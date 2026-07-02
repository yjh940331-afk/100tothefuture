export type GolfInfoCategory = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  highlights: string[];
  articles: {
    title: string;
    description: string;
    tag: string;
  }[];
};

export type SponsorBanner = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  href: string;
  cta: string;
  tags: string[];
  placements: string[];
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=75`;

export const GOLF_INFO_CATEGORIES: GolfInfoCategory[] = [
  {
    slug: "wear",
    title: "골프웨어",
    eyebrow: "Style",
    description:
      "필드와 연습장에서 바로 참고할 수 있는 골프웨어, 브랜드 협업, 계절별 스타일 가이드.",
    image: "/pros/lee-hyun-hero.jpg",
    highlights: ["프로 착장", "브랜드 협업", "계절별 레이어링"],
    articles: [
      {
        title: "이현 프로의 Malbon 골프웨어 무드",
        description:
          "레슨 프로의 신뢰감과 라이프스타일을 함께 보여주는 브랜드 포트폴리오 콘텐츠.",
        tag: "Brand",
      },
      {
        title: "초보 골퍼가 먼저 갖추면 좋은 필드 착장",
        description:
          "움직임을 방해하지 않는 상의, 팬츠, 장갑, 모자 선택 기준을 정리합니다.",
        tag: "Guide",
      },
      {
        title: "계절별 골프웨어 체크리스트",
        description:
          "봄·가을 레이어링, 여름 통기성, 겨울 보온성을 한눈에 비교합니다.",
        tag: "Checklist",
      },
    ],
  },
  {
    slug: "equipment",
    title: "골프장비",
    eyebrow: "Gear",
    description:
      "클럽, 볼, 장갑, 거리측정기처럼 실력과 예산에 맞춰 고르면 좋은 장비 정보.",
    image: unsplash("photo-1592919505780-303950717480"),
    highlights: ["클럽 선택", "입문 장비", "피팅 기준"],
    articles: [
      {
        title: "입문자가 처음 사도 후회 적은 장비",
        description:
          "풀세트보다 먼저 확인할 클럽 구성, 장갑, 신발, 볼 선택 기준.",
        tag: "Beginner",
      },
      {
        title: "드라이버보다 먼저 봐야 할 샤프트와 로프트",
        description: "비거리보다 방향성이 급한 골퍼를 위한 기본 피팅 포인트.",
        tag: "Fitting",
      },
      {
        title: "연습장용 장비와 필드용 장비 구분하기",
        description:
          "레슨·연습·라운드 상황별로 실제 사용 빈도가 높은 장비를 나눕니다.",
        tag: "Practice",
      },
    ],
  },
  {
    slug: "story",
    title: "골프이야기",
    eyebrow: "Story",
    description:
      "프로 인터뷰, 레슨 현장, 브랜드 캠페인, 골프 라이프스타일을 담는 콘텐츠.",
    image: unsplash("photo-1535131749006-b7f58c99034b"),
    highlights: ["프로 인터뷰", "레슨 현장", "브랜드 콘텐츠"],
    articles: [
      {
        title: "레슨 프로가 콘텐츠를 가져야 하는 이유",
        description:
          "영상, 착장, 후기, 필드 기록이 예약 전 신뢰로 이어지는 과정을 봅니다.",
        tag: "Insight",
      },
      {
        title: "100타 탈출 골퍼가 자주 하는 고민",
        description:
          "비거리, 슬라이스, 체중이동, 숏게임처럼 상담 전 자주 나오는 질문을 정리합니다.",
        tag: "Lesson",
      },
      {
        title: "필드 전날 확인하면 좋은 루틴",
        description:
          "준비물, 티타임, 복장, 식사, 연습 루틴까지 라운드 전 체크포인트.",
        tag: "Routine",
      },
    ],
  },
  {
    slug: "wiki",
    title: "골프위키",
    eyebrow: "Wiki",
    description:
      "처음 골프를 시작하는 사람이 헷갈리는 용어, 매너, 룰을 짧게 정리한 지식 카드.",
    image: unsplash("photo-1587174486073-ae5e5cff23aa"),
    highlights: ["골프 용어", "필드 매너", "기본 룰"],
    articles: [
      {
        title: "스크린골프와 필드골프 용어 차이",
        description:
          "티박스, 러프, 해저드, 컨시드처럼 처음 들으면 헷갈리는 용어를 정리합니다.",
        tag: "Terms",
      },
      {
        title: "첫 라운드에서 지키면 좋은 매너",
        description:
          "동반자 배려, 플레이 속도, 소음, 그린 위 행동을 쉽게 확인합니다.",
        tag: "Manner",
      },
      {
        title: "레슨 상담 전에 알아두면 좋은 질문",
        description:
          "내 목표와 예산을 프로에게 정확히 전달하기 위한 질문 리스트.",
        tag: "FAQ",
      },
    ],
  },
];

export function getGolfInfoCategory(slug: string) {
  return (
    GOLF_INFO_CATEGORIES.find((category) => category.slug === slug) ?? null
  );
}

export const SPONSOR_BANNERS: SponsorBanner[] = [
  {
    id: "gear-fitting",
    title: "클럽 피팅 파트너",
    eyebrow: "Equipment Ad",
    description:
      "드라이버, 아이언, 웨지 피팅 업체를 위한 골프장비 콘텐츠 배너 슬롯.",
    image: unsplash("photo-1592919505780-303950717480"),
    href: "mailto:contact@100tothefuture.com?subject=골프장비 광고 문의",
    cta: "광고 문의",
    tags: ["클럽", "피팅", "장비"],
    placements: ["home", "info", "equipment"],
  },
  {
    id: "field-package",
    title: "필드 준비 패키지",
    eyebrow: "Sponsor Slot",
    description:
      "볼, 장갑, 거리측정기처럼 라운드 전 구매가 많은 상품을 자연스럽게 노출합니다.",
    image: unsplash("photo-1587174486073-ae5e5cff23aa"),
    href: "mailto:contact@100tothefuture.com?subject=골프용품 스폰서 문의",
    cta: "스폰서 문의",
    tags: ["볼", "장갑", "거리측정기"],
    placements: ["home", "info", "equipment", "wiki"],
  },
  {
    id: "wear-campaign",
    title: "골프웨어 캠페인",
    eyebrow: "Brand Ad",
    description:
      "프로 착장, 시즌 룩북, 레슨 현장 콘텐츠와 연결되는 웨어 브랜드 배너.",
    image: "/pros/lee-hyun-hero.jpg",
    href: "mailto:contact@100tothefuture.com?subject=골프웨어 광고 문의",
    cta: "캠페인 문의",
    tags: ["웨어", "착장", "브랜드"],
    placements: ["home", "info", "wear", "story"],
  },
];

export function getSponsorBanners(placement: string) {
  return SPONSOR_BANNERS.filter((banner) =>
    banner.placements.includes(placement),
  );
}
