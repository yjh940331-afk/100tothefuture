export type PortfolioItem = {
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  imageMode?: "cover" | "thumbnail" | "none";
  href: string;
  platform: "YouTube" | "Instagram" | "Brand";
  type: "레슨 영상" | "소셜 포트폴리오" | "프로필" | "브랜드 협업";
};

const youtubeSearch = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

export const PORTFOLIO_BY_SLUG: Record<string, PortfolioItem[]> = {
  "lee-hyun": [
    {
      title: "비거리 늘리는 3가지 훈련",
      eyebrow: "JTBC GOLF · 골짤강",
      description: "캐스팅, 체중이동, 비거리 고민을 다룬 레슨 콘텐츠.",
      image: "/pros/lee-hyun-youtube-distance.jpg",
      href: youtubeSearch("비거리 늘리는 3가지 훈련 캐스팅 체중이동 이현 프로 JTBC GOLF"),
      platform: "YouTube",
      type: "레슨 영상",
    },
    {
      title: "스윙 공간 확보와 상체 움직임",
      eyebrow: "JTBC GOLF · 골짤강",
      description: "비거리와 방향 때문에 고민하는 골퍼를 위한 상체 움직임 레슨.",
      image: "/pros/lee-hyun-youtube-space.jpg",
      href: youtubeSearch("스윙 공간 확보 상체를 숨기자 이현 프로 JTBC GOLF"),
      platform: "YouTube",
      type: "레슨 영상",
    },
    {
      title: "Instagram @leehyun_golf",
      eyebrow: "프로골퍼 이현",
      description: "필드 스윙, 레슨 현장, 골프 라이프를 확인할 수 있는 공식 인스타그램.",
      image: "/pros/lee-hyun-hero.jpg",
      imageMode: "thumbnail",
      href: "https://www.instagram.com/leehyun_golf/",
      platform: "Instagram",
      type: "프로필",
    },
    {
      title: "Malbon 골프웨어 브랜드 활동",
      eyebrow: "Golf Wear · Brand Portfolio",
      description: "이현 프로님의 필드 스타일과 브랜드 협업 활동을 함께 보여주는 골프웨어 포트폴리오.",
      image: "/pros/lee-hyun-hero.jpg",
      href: "https://www.instagram.com/leehyun_golf/",
      platform: "Brand",
      type: "브랜드 협업",
    },
    {
      title: "필드 스윙 포트폴리오",
      eyebrow: "Instagram",
      description: "실제 코스에서의 스윙과 필드 감각을 보여주는 콘텐츠.",
      image: "/pros/lee-hyun-field.jpg",
      imageMode: "thumbnail",
      href: "https://www.instagram.com/leehyun_golf/",
      platform: "Instagram",
      type: "소셜 포트폴리오",
    },
    {
      title: "벙커샷·트러블샷",
      eyebrow: "Instagram",
      description: "짧은 게임과 상황별 샷 감각을 확인할 수 있는 포트폴리오.",
      image: "/pros/lee-hyun-bunker.jpg",
      imageMode: "thumbnail",
      href: "https://www.instagram.com/leehyun_golf/",
      platform: "Instagram",
      type: "소셜 포트폴리오",
    },
  ],
};

export function getPortfolioForSlug(slug: string) {
  return PORTFOLIO_BY_SLUG[slug] ?? [];
}
