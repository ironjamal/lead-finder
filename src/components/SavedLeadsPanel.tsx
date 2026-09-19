import { Business } from "@/lib/types";
import { businessesToCsv, downloadCsv } from "@/lib/csv";
import StatusBadge from "./StatusBadge";

interface Props {
  leads: Business[];
  onRemove: (placeId: string) => void;
  onClose: () => void;
}

export default function SavedLeadsPanel({ leads, onRemove, onClose }: Props) {
  function handleExport() {
    const csv = businessesToCsv(leads);
    downloadCsv("lead-finder-saved-leads.csv", csv);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 sm:p-8">
      <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-xl border border-fg/10 bg-bg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Saved Leads ({leads.length})</h2>
          <button
            onClick={onClose}
            className="rounded-lg border border-fg/20 px-3 py-1.5 text-sm hover:border-fg/40"
          >
            Close
          </button>
        </div>

        <div className="mb-4 flex justify-end">
          <button
            onClick={handleExport}
            disabled={leads.length === 0}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-fg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export CSV
          </button>
        </div>

        {leads.length === 0 ? (
          <p className="text-sm text-muted">
            No leads saved yet. Save businesses with no website listed from your search results.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {leads.map((lead) => (
              <div
                key={lead.placeId}
                className="flex flex-col gap-2 rounded-lg border border-fg/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-fg">{lead.name}</p>
                  <p className="text-sm text-muted">{lead.address}</p>
                  <p className="text-sm text-muted">{lead.phone || "Phone unavailable"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={lead.websiteStatus} />
                  <a
                    href={lead.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-fg underline underline-offset-2 hover:text-accent"
                  >
                    Maps
                  </a>
                  <button
                    onClick={() => onRemove(lead.placeId)}
                    className="text-sm text-muted hover:text-accent"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
