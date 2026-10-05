# 온결 API 서버 (NestJS + PostgreSQL)

기존 Supabase(PostgREST + Auth + Storage)를 대체하는 백엔드. Prisma 로 PostgreSQL 을 다루고,
JWT(httpOnly 쿠키) 인증과 로컬 파일 업로드(정적 서빙)를 제공한다.

## 실행

```bash
cd server
cp .env.example .env
docker compose up -d          # PostgreSQL 16 (localhost:5433)
npm install
npx prisma migrate dev        # 스키마 적용
npm run seed                  # 카테고리/상품/관리자 계정 시드
npm run start:dev             # http://localhost:4000
```

## 환경변수

| 키 | 설명 | 기본값 |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL 연결 문자열 | (필수) |
| `PORT` | API 포트 | `4000` |
| `JWT_SECRET` | JWT 서명 키 | `dev-secret-change-me` |
| `CORS_ORIGIN` | 허용 오리진(콤마 구분) | `http://localhost:3000` |
| `TOSS_SECRET_KEY` | 토스페이먼츠 시크릿 키 | 테스트 키 |
| `PUBLIC_API_URL` | 업로드 파일 공개 URL 의 베이스 | `http://localhost:{PORT}` |
| `UPLOAD_DIR` | 업로드 저장 디렉터리 | `uploads` |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | 시드 관리자 계정 | `admin@ongyeol.com` / `admin1234!` |

## 공통 규칙

- **응답 형태**: Prisma 결과를 `serialize()` 로 변환해 Supabase PostgREST 와 동일한 snake_case JSON 을 반환한다.
  관계 필드명도 동일하다: `product_images`, `product_options`, `order_items`, `order_logs`,
  그리고 단일 관계는 `categories`(상품의 카테고리), `products`(주문항목/리뷰/문의의 상품), `orders`(주문항목의 주문).
- **요청 본문(DTO)**: camelCase. `class-validator` 데코레이터로 검증하고, 전역 `ValidationPipe(whitelist: true)` 가 적용된다.
- **인증**: JWT 를 `access_token` httpOnly 쿠키로 발급. 브라우저는 `credentials: 'include'` 로 호출한다.
- **권한**: `JwtAuthGuard`(로그인 필수) / `OptionalAuthGuard`(비회원 허용) / `AdminGuard`(role === 'admin').
  현재 사용자는 `@CurrentUser() user?: AuthUser` 로 주입받는다.
- **에러**: `NotFoundException`(404), `BadRequestException`(400), `ConflictException`(409),
  `UnauthorizedException`(401), `ForbiddenException`(403). 응답 본문은 `{ message, error, statusCode }`.
- 컨트롤러 메서드의 반환 타입은 추론에 맡긴다(`serialize()` 는 `Json` 반환). `: any` 사용 금지.
- Prisma 모델 필드는 camelCase, 컬럼은 snake_case (`@map`). 필드명은 `prisma/schema.prisma` 참고.

## 엔드포인트

### Auth — `src/auth`

| Method | Path | Guard | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/auth/signup` | – | `{email, password, fullName?, phone?}` | user (+쿠키) / 409 중복 |
| POST | `/auth/login` | – | `{email, password}` | user (+쿠키) / 401 |
| POST | `/auth/logout` | – | – | `204`, 쿠키 삭제 |
| GET | `/auth/me` | Jwt | – | user / 401 |
| PATCH | `/auth/me` | Jwt | `{fullName?, phone?}` | user |

user = `{id, email, role, full_name, phone, created_at, updated_at}` (`password_hash` 는 절대 포함하지 않는다).
`role` 은 `admin` | `customer` (기본 `customer`). 비밀번호는 bcrypt 로 해시.

### Addresses — `src/addresses` (모두 Jwt)

| Method | Path | Body | 비고 |
| --- | --- | --- | --- |
| GET | `/addresses` | – | 본인 배송지, `is_default desc, created_at desc` |
| POST | `/addresses` | `{label?, recipientName, phone, address, isDefault?}` | `isDefault` 면 기존 기본 배송지 해제 |
| PATCH | `/addresses/:id` | `{label?, recipientName?, phone?, address?, isDefault?}` | `isDefault: true` → 나머지 해제 / `false` → 본인만 해제 |
| DELETE | `/addresses/:id` | – | `204` |

### Catalog — `src/catalog`

| Method | Path | Guard | Query / Body | Response |
| --- | --- | --- | --- | --- |
| GET | `/categories` | – | – | `Category[]` (`sort_order asc`) |
| GET | `/categories/slug/:slug` | – | – | `Category` / 404 |
| GET | `/products` | – | `status`, `categoryId`, `categorySlug`, `featured=true`, `search`, `sort`, `limit`, `offset` | `ProductWithImages[]` |
| GET | `/products/:id` | – | – | `ProductDetail` (images, categories, options) |
| GET | `/products/slug/:slug` | – | `includeHidden=true`(관리자용) | `ProductDetail` / 404, 기본적으로 `status='hidden'` 제외 |
| POST | `/products` | Admin | `{name, slug?, categoryId?, price, salePrice?, shortDescription?, description?, status?, isFeatured?, seoTitle?, seoDescription?}` | 생성된 상품 |
| PATCH | `/products/:id` | Admin | 위 필드 일부 | 수정된 상품 |
| DELETE | `/products/:id` | Admin | – | `204` |
| POST | `/products/:id/images` | Admin | multipart `file` (+`isMain?`) | 생성된 `product_image` |
| DELETE | `/product-images/:id` | Admin | – | `204` |
| PUT | `/products/:id/options` | Admin | `[{color?, size?, stockQty?, status?}]` | 기존 옵션 전체 교체 후 `product_option[]` |
| GET | `/banners` | – | – | `is_active=true`, `sort_order asc` |

- `sort` 값: `created_at.desc`(기본) | `created_at.asc` | `price.asc` | `price.desc` | `name.asc`
- `search` 는 상품명 부분일치(`contains`, 대소문자 무시).
- `ProductWithImages` = product + `product_images: []` + `categories: Category|null`
  (Prisma include `{ productImages: true, category: true }` → `serialize(row, RELATION_ALIASES)`).
- `ProductDetail` = 위 + `product_options: []`.
- `POST /products/:id/images` 는 multer 로 받은 파일을 `UPLOAD_DIR/products/<productId>/` 에 저장하고
  `publicUploadUrl()` 로 만든 URL 을 `image_url` 에 넣는다.

### Orders — `src/orders`

| Method | Path | Guard | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/orders` | Optional | `{customerName, customerPhone, customerAddress, customerMemo?, totalAmount, deliveryFee?, items:[{productId, productName, productSlug, imageUrl?, optionColor?, optionSize?, price, quantity}]}` | `{orderId, orderNumber}` |
| GET | `/orders/mine` | Jwt | `from=YYYY-MM-DD`, `to=YYYY-MM-DD`, `excludeCancelled=true`, `limit`, `offset` | `OrderWithItems[]` (`created_at desc`) |
| GET | `/orders` | Admin | `status`, `limit`(기본 100), `offset` | `OrderWithItems[]` |
| GET | `/orders/counts` | Admin | – | `{pending, paid, shipping, delivered, cancelled}` |
| GET | `/orders/:id` | Jwt | – | `OrderWithItems` (본인 또는 admin 아니면 404) |
| PATCH | `/orders/:id` | Admin | `{status?, customerName?, customerPhone?, customerAddress?, customerMemo?}` | 수정된 주문 |
| PATCH | `/orders/:id/shipping` | Jwt | `{customerName, customerPhone, customerAddress, customerMemo?}` | 본인 주문, `pending`/`paid` 만 |
| POST | `/orders/:id/confirm` | – | `{paymentKey, amount}` | `{success:true}` — 토스 결제 승인 후 `paid` |
| POST | `/orders/:id/cancel` | Jwt | – | `{success:true}` — 본인 주문, `pending`/`paid`; `paid` 는 토스 취소 API 호출 |
| DELETE | `/orders/:id` | Optional | – | `204`. 비회원/본인은 `pending` 만, 관리자는 모두(로그/항목 cascade) |
| GET | `/order-items/:id` | Jwt | – | order_item + `orders: {id, user_id, status}` (리뷰 작성 검증용, 본인 주문만) |
| GET | `/order-logs` | Admin | `orderIds=a,b,c` | `order_logs[]` (`created_at desc`) |
| POST | `/order-logs` | Admin | `{orderId, action, detail?}` | 생성된 로그 |

- 주문번호: `OG` + `YYYYMMDD` + 5자리 난수.
- `/orders/mine` 의 `from`/`to` 는 `created_at` 을 각각 `00:00:00`/`23:59:59` 경계로 필터한다.
- `confirm`/`cancel` 의 토스 호출은 `TOSS_SECRET_KEY` 로 Basic 인증 (`src/orders/toss.service.ts`).
- `OrderWithItems` = order + `order_items: []`.

### Inquiries — `src/inquiries`

| Method | Path | Guard | Body / Query | Response |
| --- | --- | --- | --- | --- |
| POST | `/inquiries` | Optional | `{productId?, customerName, phone, message}` | 생성된 문의 (`user_id` 는 쿠키에서) |
| GET | `/inquiries/mine` | Jwt | `limit`(기본 20) | 본인 문의 + `products: {name, slug}\|null` |
| GET | `/inquiries` | Admin | `status`, `limit`(기본 100), `offset` | 문의 + `products` |
| GET | `/inquiries/counts` | Admin | – | `{pending, replied, closed}` |
| PATCH | `/inquiries/:id` | Admin | `{status?, adminReply?}` | `adminReply` 를 주면 `replied_at` 도 갱신 |

### Reviews — `src/reviews`

| Method | Path | Guard | Body / Query | Response |
| --- | --- | --- | --- | --- |
| GET | `/reviews` | – | `productId`, `orderItemId`, `limit`, `offset` | 리뷰 + `products: {name, slug, product_images:[]}` |
| GET | `/reviews/mine` | Jwt | – | 본인 리뷰 (동일 include) |
| POST | `/reviews` | Jwt | `{productId, orderItemId?, rating(1-5), content}` | 생성된 리뷰. `order_item_id` 중복은 409 |
| DELETE | `/reviews/:id` | Jwt | – | `204` (본인 또는 admin) |

### Admin — `src/admin`

| Method | Path | Guard | Response |
| --- | --- | --- | --- |
| GET | `/admin/dashboard` | Admin | `{pendingInquiryCount, paidOrderCount, todayOrderCount, todaySales, recentInquiries, paidOrders}` |

- `todayOrderCount`: 오늘(`created_at >= 오늘 00:00`) 주문 중 `cancelled` 제외 건수.
- `todaySales`: 위 주문들의 `total_amount` 합계.
- `recentInquiries`: `status='pending'`, `created_at desc`, 5건, `products: {name}` 포함.
- `paidOrders`: `status='paid'`, `created_at desc`, `order_items` 포함.

### Uploads

- 업로드 파일은 `/uploads/**` 정적 경로로 서빙된다 (`main.ts` 의 `useStaticAssets`).
- 상품 이미지 업로드는 `POST /products/:id/images` 를 사용한다.