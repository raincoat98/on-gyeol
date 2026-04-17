-- 카테고리
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 상품
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references categories(id) on delete set null,
  price int not null,
  sale_price int,
  short_description text,
  description text,
  status text not null default 'active' check (status in ('active', 'soldout', 'hidden')),
  is_featured boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 상품 이미지
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  is_main boolean not null default false,
  created_at timestamptz not null default now()
);

-- 상품 옵션 (색상/사이즈)
create table product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  color text,
  size text,
  stock_qty int not null default 0,
  status text not null default 'active' check (status in ('active', 'soldout', 'hidden')),
  created_at timestamptz not null default now()
);

-- 문의
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  customer_name text not null,
  phone text not null,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'replied', 'closed')),
  created_at timestamptz not null default now()
);

-- 배너
create table banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  link_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- updated_at 자동 갱신
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on products
  for each row execute function update_updated_at();

-- RLS 활성화
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_options enable row level security;
alter table inquiries enable row level security;
alter table banners enable row level security;

-- 공개 읽기 정책 (active 상품만)
create policy "public can read active products"
  on products for select
  using (status != 'hidden');

create policy "public can read categories"
  on categories for select using (true);

create policy "public can read product_images"
  on product_images for select using (true);

create policy "public can read product_options"
  on product_options for select using (true);

create policy "public can read active banners"
  on banners for select
  using (is_active = true);

-- 문의 작성 허용
create policy "anyone can insert inquiry"
  on inquiries for insert
  with check (true);

-- 관리자 전체 권한 (auth.role() = 'authenticated')
create policy "admin full access products"
  on products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin full access product_images"
  on product_images for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin full access product_options"
  on product_options for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin full access inquiries"
  on inquiries for select
  using (auth.role() = 'authenticated');

create policy "admin update inquiries"
  on inquiries for update
  using (auth.role() = 'authenticated');

create policy "admin full access banners"
  on banners for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin full access categories"
  on categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Storage 버킷
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);

create policy "public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "admin upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

create policy "admin delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- 기본 카테고리 데이터
insert into categories (name, slug, sort_order) values
  ('상의', 'tops', 1),
  ('하의', 'bottoms', 2),
  ('원피스', 'onepiece', 3),
  ('아우터', 'outer', 4),
  ('세일', 'sale', 5);
