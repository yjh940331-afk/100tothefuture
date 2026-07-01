import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const siteUrl = "https://www.100tothefuture.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "100 to the Future | 100타 탈출 골프레슨 중개 플랫폼",
    template: "%s | 100 to the Future",
  },
  description:
    "100타 탈출을 원하는 골퍼와 검증된 레슨프로를 연결하는 레슨 중개 플랫폼. 프로필·약력·자격을 검증하고, 가능한 시간에 바로 상담·예약하세요.",
  keywords: [
    "골프레슨",
    "100타 탈출",
    "골프 레슨프로",
    "골프 레슨 예약",
    "강남 골프레슨",
    "골프 원포인트 레슨",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "100 to the Future",
    title: "100타 탈출, 혼자 고민하지 말고 검증된 프로와 시작하세요.",
    description:
      "내 스윙 문제에 맞는 검증된 레슨프로를 찾고, 가능한 시간에 바로 상담·예약하세요.",
  },
  twitter: {
    card: "summary_large_image",
    title: "100 to the Future | 100타 탈출 골프레슨",
    description: "검증된 레슨프로와 함께하는 100타 탈출.",
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
      </body>
    </html>
  );
}
