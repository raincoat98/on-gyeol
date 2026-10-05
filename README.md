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
- Docker / Docker Compose (로컬 PostgreSQL 및 프로덕션 배포)

## 1. API 서버 (로컬 개발)

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

## 2. 프론트엔드 (로컬 개발)

```bash
cp .env.example .env      # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev               # http://localhost:3000
```

## 3. 프로덕션 배포 (Docker)

`nginx`(유일한 공개 진입점), `web`(Next.js standalone), `api`(NestJS) 세 컨테이너로 실행한다.
`api` 는 같은 머신의 `prod-postgres` 컨테이너(`~/dev/postgres/prod`)와 `prod-postgres_default`
네트워크를 공유해 `db:5432` 로 접속하고, 공개는 Cloudflare Tunnel(`~/dev/cloudflared`)이 담당한다.

초기 1회 전용 DB 를 만든다(`app_rw` 소유, 기존 `app` DB 의 `app_probe` 와 충돌 방지):

```bash
docker exec prod-postgres psql -U postgres \
  -c "CREATE DATABASE ongyeol OWNER app_rw ENCODING 'UTF8'"
```

```bash
cp .env.production.example .env.production   # DATABASE_URL, JWT_SECRET 등 채우기
docker compose --env-file .env.production up -d --build
```

| 서비스 | 공개 포트 | 설명 |
| --- | --- | --- |
| `nginx` | `4500` → :80 | 단일 오리진. `/api/*` → `api`(접두사 제거), 그 외 → `web` |
| `web` | 내부 :3000 | Next.js standalone |
| `api` | 내부 :4000 | NestJS. 기동 시 `prisma migrate deploy` 자동 실행 |
| `api` 볼륨 | – | `uploads` (업로드 이미지 영구 저장) |

- Tunnel Public Hostname **하나만** 추가한다:
  `on-gyeol.cloudrainit.com` → `http://host.docker.internal:4500`.
- 브라우저는 공개 주소 `NEXT_PUBLIC_API_URL=https://on-gyeol.cloudrainit.com/api`,
  서버 컴포넌트(SSR)는 내부 주소 `API_URL=http://api:4000` 로 호출한다.
- 단일 오리진이므로 인증 쿠키(`SameSite=Lax` + `secure`)와 CORS 제약이 없다.
- `NEXT_PUBLIC_*` 는 빌드 시 번들에 인라인되므로 값 변경 시 `--build` 로 재빌드해야 한다.

### DB 가 비어 있을 때만 시드

프로덕션 DB 스키마는 API 컨테이너가 자동 적용한다. 초기 데이터가 필요하면:

```bash
docker build --target build -t ongyeol-api:build ./server
docker run --rm --network prod-postgres_default \
  -e DATABASE_URL="$DATABASE_URL" \
  -e SEED_ADMIN_EMAIL=... -e SEED_ADMIN_PASSWORD=... \
  ongyeol-api:build npm run seed
```

시드 관리자 비밀번호는 기본값(`admin1234!`)을 그대로 쓰지 말고 `SEED_ADMIN_PASSWORD` 로 지정한다.

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
프로덕션에서는 `uploads` 볼륨으로 영구 저장하고, `PUBLIC_API_URL`(=`.../api`) 을 실제 API 주소로 설정한다.
`next.config.ts` 는 `NEXT_PUBLIC_API_URL` 의 호스트와 경로 접두사(`/api`)를 반영해
`images.remotePatterns` 를 자동으로 구성한다.