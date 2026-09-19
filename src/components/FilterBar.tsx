export type FilterValue = "all" | "none" | "listed";

interface Props {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  counts: { all: number; none: number; listed: number };
}

const OPTIONS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "none", label: "No Website" },
  { value: "listed", label: "Website Listed" },
];

export default function FilterBar({ value, onChange, counts }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
            value === opt.value
              ? "border-accent bg-accent text-fg"
              : "border-fg/15 bg-transparent text-muted hover:border-fg/30 hover:text-fg"
          }`}
        >
          {opt.label} ({counts[opt.value]})
        </button>
      ))}
    </div>
  );
}
