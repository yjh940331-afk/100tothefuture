/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Cloudflare Pages 는 Next 기본 이미지 최적화를 지원하지 않아 unoptimized 사용.
    // (원하면 Cloudflare Images 로더로 교체 가능)
    unoptimized: true,
    remotePatterns: [
      // Supabase Storage 공개 버킷 (프로필/자격증 이미지)
      { protocol: "https", hostname: "*.supabase.co" },
      // 시드 데이터용 임시 이미지 (실서비스에선 제거)
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
