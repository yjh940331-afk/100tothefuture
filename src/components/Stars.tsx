export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center" aria-label={`별점 ${value}점`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          fill={n <= full ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={n <= full ? 0 : 1.5}
          className="text-gold-400"
          aria-hidden
        >
          <path d="M10 1.5l2.6 5.3 5.9.86-4.25 4.14 1 5.87L10 15.9l-5.25 2.77 1-5.87L1.5 8.66l5.9-.86L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}

export function RatingInline({
  value,
  count,
}: {
  value: number;
  count: number;
}) {
  if (!count) {
    return <span className="text-sm text-fairway-400">아직 후기가 없어요</span>;
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Stars value={value} />
      <span className="font-bold text-fairway-900">{value.toFixed(1)}</span>
      <span className="text-fairway-500">({count})</span>
    </span>
  );
}
