import type { NextConfig } from "next";

// 업로드 이미지는 API 서버가 /uploads/** 로 서빙한다. 브라우저가 접근하는
// NEXT_PUBLIC_API_URL 의 호스트를 next/image 허용 목록에 추가한다.
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [
  { protocol: 'https', hostname: 'picsum.photos' },
];

for (const base of [PUBLIC_API_URL, 'http://localhost:4000', 'http://127.0.0.1:4000']) {
  try {
    const { protocol, hostname, port, pathname } = new URL(base);
    // API 가 /api 접두사 뒤에 프록시되는 경우 업로드 경로도 그 접두사를 포함한다.
    const prefix = pathname.replace(/\/+$/, '');
    remotePatterns.push({
      protocol: protocol.replace(':', '') as 'http' | 'https',
      hostname,
      ...(port ? { port } : {}),
      pathname: `${prefix}/uploads/**`,
    });
  } catch {
    // URL 형식이 아니면 무시한다.
  }
}

const nextConfig: NextConfig = {
  // Docker 배포용 최소 런타임 번들 (server.js + 추적된 의존성만 포함)
  output: 'standalone',
  images: { remotePatterns },
};

export default nextConfig;