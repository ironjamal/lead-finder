export type WebsiteStatus = "listed" | "none" | "unknown";

export interface Business {
  placeId: string;
  name: string;
  category: string;
  address: string;
  phone: string | null;
  rating: number | null;
  reviewCount: number | null;
  website: string | null;
  websiteStatus: WebsiteStatus;
  googleMapsUrl: string;
}

export interface SearchRequestBody {
  businessType: string;
  location: string;
  resultCount: 20 | 50 | 100;
}

export interface SearchResponseBody {
  results: Business[];
  warning?: string;
}

export interface ApiErrorBody {
  error: string;
}
