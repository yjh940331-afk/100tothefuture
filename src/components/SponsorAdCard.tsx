import Image from "next/image";
import type { SponsorBanner } from "@/lib/golf-info";

export function SponsorAdCard({ banner }: { banner: SponsorBanner }) {
  return (
    <a
      href={banner.href}
      className="group overflow-hidden rounded-lg border border-fairway-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-fairway-200 hover:shadow-card"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-fairway-100">
        <Image
          src={banner.image}
          alt={banner.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          style={{ objectPosition: banner.imagePosition ?? "center" }}
        />
        <span className="absolute left-2 top-2 rounded-md bg-white/90 px-2 py-1 text-[10px] font-black uppercase text-fairway-800 shadow-sm">
          AD
        </span>
      </div>
      <div className="p-3">
        <p className="text-[11px] font-black uppercase text-gold-700">
          {banner.eyebrow}
        </p>
        <h3 className="mt-1 text-base font-black text-fairway-900">
          {banner.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-fairway-600">
          {banner.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {banner.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-fairway-50 px-2 py-0.5 text-[11px] font-bold text-fairway-600"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="mt-3 inline-flex text-[13px] font-black text-fairway-800 group-hover:underline">
          {banner.cta}
        </span>
      </div>
    </a>
  );
}
