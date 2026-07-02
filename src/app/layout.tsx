import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileNav } from "@/components/MobileNav";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "100 to the Future | 골프 레슨 매칭 플랫폼",
    template: "%s | 100 to the Future",
  },
  description:
    "목표, 지역, 시간, 예산에 맞는 골프 레슨 프로를 비교하고 상담·예약할 수 있는 골프 레슨 매칭 플랫폼.",
  keywords: [
    "골프레슨",
    "골프 프로",
    "골프 레슨 예약",
    "100타 탈출",
    "드라이버 레슨",
    "비거리 레슨",
    "골프 레슨 견적",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "100 to the Future",
    title: "내 조건에 맞는 골프 프로를 비교하세요",
    description:
      "지역, 목표, 가능 시간, 예산을 기준으로 검증된 골프 레슨 프로를 연결합니다.",
  },
  twitter: {
    card: "summary_large_image",
    title: "100 to the Future | 골프 레슨 매칭",
    description: "검증된 골프 프로와 함께하는 맞춤 레슨 매칭.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-cream font-sans text-fairway-900 antialiased">
        <Header />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        {/* 모바일 하단 네비게이션이 콘텐츠를 가리지 않도록 여백 */}
        <div aria-hidden className="h-14 sm:hidden" />
        <MobileNav />
      </body>
    </html>
  );
}
