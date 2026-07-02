type BrandLogoProps = {
  tone?: "dark" | "light";
  compact?: boolean;
  iconOnly?: boolean;
  className?: string;
};

const toneClass = {
  dark: {
    mark: "bg-fairway-950 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]",
    title: "text-fairway-950",
    subtitle: "text-fairway-500",
    fairway: "#d4a94e",
    pin: "#ffffff",
    ground: "rgba(255,255,255,0.34)",
  },
  light: {
    mark: "bg-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.24)]",
    title: "text-white",
    subtitle: "text-fairway-300",
    fairway: "#d4a94e",
    pin: "#0c1e15",
    ground: "rgba(12,30,21,0.2)",
  },
};

export function BrandLogo({
  tone = "dark",
  compact = false,
  iconOnly = false,
  className = "",
}: BrandLogoProps) {
  const styles = toneClass[tone];

  return (
    <span className={`inline-flex min-w-0 items-center gap-2.5 ${className}`}>
      <span className={`relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg ${styles.mark}`}>
        <svg viewBox="0 0 40 40" className="h-9 w-9" fill="none" aria-hidden>
          <path
            d="M7.5 27.2c5.2-9 15.1-15.6 25.4-16.4"
            stroke={styles.fairway}
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <path
            d="M10 31.5c4.8-1.7 11.7-2.2 20-1.2"
            stroke={styles.ground}
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path d="M26.4 10.4v17.4" stroke={styles.pin} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M27.7 10.2h7.3l-2.2 3.2 2.2 3.3h-7.3z" fill={styles.fairway} />
          <circle cx="10.5" cy="27.4" r="2.3" fill={styles.pin} />
        </svg>
      </span>

      {!iconOnly && (
        <span className="min-w-0 leading-none">
          <span className={`block truncate text-[15px] font-black ${styles.title}`}>Future Golf</span>
          {!compact && (
            <span className={`mt-1 block truncate text-[10px] font-semibold ${styles.subtitle} max-[380px]:hidden`}>
              레슨 매칭 플랫폼
            </span>
          )}
        </span>
      )}
    </span>
  );
}
