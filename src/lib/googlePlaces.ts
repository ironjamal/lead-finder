import { Business, WebsiteStatus } from "./types";

const TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

// Fields we need back from Google, kept minimal to control cost.
const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.rating",
  "places.userRatingCount",
  "places.websiteUri",
  "places.googleMapsUri",
  "places.primaryTypeDisplayName",
  "nextPageToken",
].join(",");

interface GooglePlace {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  googleMapsUri?: string;
  primaryTypeDisplayName?: { text?: string };
}

interface GoogleTextSearchResponse {
  places?: GooglePlace[];
  nextPageToken?: string;
  error?: { message?: string; status?: string };
}

export class GooglePlacesError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

function toBusiness(place: GooglePlace): Business {
  let websiteStatus: WebsiteStatus = "unknown";
  if (typeof place.websiteUri === "string") {
    websiteStatus = place.websiteUri.trim().length > 0 ? "listed" : "none";
  } else if (place.id) {
    // Google returned the place but no website field at all -> treat as no website listed.
    websiteStatus = "none";
  }

  return {
    placeId: place.id,
    name: place.displayName?.text || "Unnamed business",
    category: place.primaryTypeDisplayName?.text || "Uncategorized",
    address: place.formattedAddress || "Address unavailable",
    phone: place.nationalPhoneNumber || place.internationalPhoneNumber || null,
    rating: typeof place.rating === "number" ? place.rating : null,
    reviewCount: typeof place.userRatingCount === "number" ? place.userRatingCount : null,
    website: place.websiteUri || null,
    websiteStatus,
    googleMapsUrl:
      place.googleMapsUri ||
      `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${place.id}`,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(
  apiKey: string,
  query: string,
  pageToken?: string
): Promise<GoogleTextSearchResponse> {
  const body: Record<string, unknown> = pageToken
    ? { pageToken }
    : { textQuery: query };

  const res = await fetch(TEXT_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as GoogleTextSearchResponse;

  if (!res.ok) {
    const message = data?.error?.message || `Google Places API error (status ${res.status})`;
    if (res.status === 429 || data?.error?.status === "RESOURCE_EXHAUSTED") {
      throw new GooglePlacesError(
        "Google API quota was exceeded. Please try again later or check your billing/quota settings.",
        429
      );
    }
    if (res.status === 400) {
      throw new GooglePlacesError(
        "The search request was invalid. Try a more specific business type or location.",
        400
      );
    }
    if (res.status === 403) {
      throw new GooglePlacesError(
        "Google API key is invalid, restricted, or missing permission for the Places API.",
        403
      );
    }
    throw new GooglePlacesError(message, 502);
  }

  return data;
}

export async function searchBusinesses(
  businessType: string,
  location: string,
  resultCount: number
): Promise<{ results: Business[]; warning?: string }> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new GooglePlacesError(
      "The server is missing GOOGLE_PLACES_API_KEY. Add it to your .env.local file.",
      500
    );
  }

  const query = `${businessType} in ${location}`;
  const results: Business[] = [];
  let pageToken: string | undefined;
  let warning: string | undefined;
  const maxPages = Math.ceil(resultCount / 20);

  for (let page = 0; page < maxPages; page++) {
    if (page > 0) {
      // Google requires a short delay before a new page token becomes valid.
      await sleep(2000);
    }

    const data = await fetchPage(apiKey, query, pageToken);
    const places = data.places || [];

    if (page === 0 && places.length === 0) {
      return { results: [] };
    }

    for (const place of places) {
      results.push(toBusiness(place));
      if (results.length >= resultCount) break;
    }

    pageToken = data.nextPageToken;
    if (!pageToken || results.length >= resultCount) break;
  }

  if (results.length < resultCount && results.length > 0) {
    warning = `Google returned ${results.length} result(s) for this search — fewer than the ${resultCount} requested.`;
  }

  return { results: results.slice(0, resultCount), warning };
}
