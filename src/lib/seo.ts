import type { Metadata } from "next";
import { SITE_URL } from "./site";

export const SITE_NAME = "100 to the Future";
export const DEFAULT_TITLE = "100 to the Future | 골프 레슨 매칭 플랫폼";
export const DEFAULT_DESCRIPTION =
  "지역, 목표, 시간, 예산에 맞는 검증 골프 레슨 프로를 비교하고 상담·예약할 수 있는 골프 레슨 매칭 플랫폼.";
export const LEE_HYUN_OG_IMAGE = "/pros/lee-hyun-og.jpg";
export const DEFAULT_OG_IMAGE = LEE_HYUN_OG_IMAGE;

export const SEO_KEYWORDS = [
  "골프레슨",
  "골프 레슨",
  "골프 프로",
  "골프 레슨 예약",
  "골프 레슨 견적",
  "100타 탈출",
  "드라이버 레슨",
  "비거리 레슨",
  "골프 초보 레슨",
  "골프 개인레슨",
];

export function absoluteUrl(pathOrUrl = "/") {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl, SITE_URL).toString();
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function truncateMeta(value: string, max = 155) {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function pageSeo({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  imageAlt,
  keywords = [],
  type = "website",
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  imageAlt?: string;
  keywords?: string[];
  type?: "website" | "article" | "profile";
  noIndex?: boolean;
}): Metadata {
  const cleanDescription = truncateMeta(description);
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description: cleanDescription,
    keywords: unique([...SEO_KEYWORDS, ...keywords]),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      locale: "ko_KR",
      url,
      siteName: SITE_NAME,
      title,
      description: cleanDescription,
      images: [
        {
          url: imageUrl,
          type: "image/jpeg",
          width: 1200,
          height: 630,
          alt: imageAlt ?? title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: cleanDescription,
      images: [imageUrl],
    },
    robots: {
      index: !noIndex,
      follow: true,
      googleBot: {
        index: !noIndex,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/favicon.ico"),
    sameAs: ["https://www.instagram.com/leehyun__golf"],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "ko-KR",
    description: DEFAULT_DESCRIPTION,
  };
}
