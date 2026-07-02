import { BADGES } from "@/lib/constants";

const toneClass: Record<string, string> = {
  green: "bg-fairway-100 text-fairway-800 border-fairway-200",
  gold: "bg-gold-100 text-gold-800 border-gold-200",
  blue: "bg-sky-50 text-sky-700 border-sky-200",
  pink: "bg-rose-50 text-rose-700 border-rose-200",
};

export function Badge({ badgeKey }: { badgeKey: string }) {
  const b = BADGES[badgeKey];
  if (!b) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClass[b.tone]}`}
    >
      {b.tone === "green" && (
        <svg
          viewBox="0 0 20 20"
          className="h-3 w-3"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.3 3.3 6.8-6.8a1 1 0 011.4 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {b.label}
    </span>
  );
}

export function BadgeList({ badges }: { badges: string[] }) {
  if (!badges?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((k) => (
        <Badge key={k} badgeKey={k} />
      ))}
    </div>
  );
}
