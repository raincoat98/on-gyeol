# 온결 (on-gyeol)

여성 의류 쇼핑몰. Next.js(App Router) 프론트엔드와 NestJS + PostgreSQL API 서버로 구성된다.
데이터베이스 접근, 인증, 이미지 업로드는 자체 API 서버가 담당한다(Supabase 미사용).

## 구조

```
app/  components/  lib/  types/   # Next.js 프론트엔드
server/                           # NestJS API 서버 (Prisma + PostgreSQL)
  prisma/schema.prisma            # 스키마
  prisma/seed.ts                  # 카테고리/상품/관리자 시드
  README.md                       # API 계약 문서
```

## 사전 요구사항

- Node.js 20+
- Docker (PostgreSQL 실행용)

## 1. API 서버

```bash
cd server
cp .env.example .env
docker compose up -d      # PostgreSQL 16 → localhost:5433
npm install
npx prisma migrate dev    # 스키마 적용
npm run seed              # 카테고리 5 / 상품 12 / 관리자 계정
npm run start:dev         # http://localhost:4000
```

시드 관리자 계정: `admin@ongyeol.com` / `admin1234!` (`.env` 의 `SEED_ADMIN_*` 로 변경 가능)

엔드포인트·응답 형태는 [`server/README.md`](server/README.md) 참고.

## 2. 프론트엔드

```bash
cp .env.example .env      # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev               # http://localhost:3000
```

## 스크립트

| 위치 | 명령 | 설명 |
| --- | --- | --- |
| 루트 | `npm run dev` | Next.js 개발 서버 |
| 루트 | `npm run build` / `npm start` | 프로덕션 빌드/실행 |
| 루트 | `npm run lint` | ESLint |
| 루트 | `npm run dev:server` | API 서버 개발 모드 |
| server | `npm run start:dev` | NestJS watch 모드 |
| server | `npm run build` / `npm run start:prod` | NestJS 빌드/실행 |
| server | `npx prisma migrate dev` | 마이그레이션 생성/적용 |
| server | `npm run seed` | 시드 데이터 입력 |

## 인증

JWT 를 `access_token` httpOnly 쿠키로 발급한다(7일). 브라우저 호출은 `credentials: 'include'`,
서버 컴포넌트는 `lib/api/server.ts` 의 `apiFetch` 가 쿠키를 자동 전달한다.
관리자 페이지는 `role === 'admin'` 만 접근 가능하다.

## 이미지 업로드

상품 이미지는 API 서버의 `server/uploads/` 에 저장되고 `/uploads/...` 정적 경로로 서빙된다.
운영 배포 시 이 디렉터리를 영구 볼륨으로 마운트하고, `PUBLIC_API_URL` 을 실제 API 주소로 설정한다.
`next.config.ts` 의 `images.remotePatterns` 에 API 호스트를 추가해야 한다.