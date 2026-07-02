import Link from "next/link";

// 모바일 하단 고정 CTA (데스크톱은 우측 사이드바가 대신하므로 lg 이상에서 숨김)
export function MobileBookingBar({
  slug,
  price,
}: {
  slug: string;
  price: number;
}) {
  const label =
    price > 0 ? `${price.toLocaleString("ko-KR")}원~` : "상담 후 안내";
  return (
    <div className="fixed inset-x-0 bottom-14 z-40 border-t border-fairway-100 bg-white/95 backdrop-blur sm:bottom-0 lg:hidden">
      <div className="container-page flex items-center gap-3 py-2.5">
        <div className="shrink-0">
          <div className="text-[11px] text-fairway-500">레슨 시작가</div>
          <div className="text-base font-black text-fairway-900">{label}</div>
        </div>
        <Link
          href={`/pros/${slug}/booking`}
          className="btn-gold flex-1 text-sm"
        >
          견적 요청하기
        </Link>
      </div>
    </div>
  );
}
