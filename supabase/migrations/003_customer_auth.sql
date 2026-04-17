-- 사용자 프로필
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 배송지 관리
create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default '집',
  recipient_name text not null,
  phone text not null,
  address text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- 주문에 회원 연결
alter table orders add column user_id uuid references auth.users(id) on delete set null;

-- updated_at 자동 갱신
create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- 신규 회원 프로필 자동 생성
create function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, role)
  values (new.id, 'customer')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 관리자 확인 함수
create function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  )
$$ language sql security definer stable;

-- RLS
alter table profiles enable row level security;
alter table addresses enable row level security;

-- profiles 정책
create policy "users can read own profile"
  on profiles for select using (auth.uid() = id);

create policy "users can update own profile"
  on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "admin can read all profiles"
  on profiles for select using (is_admin());

-- addresses 정책
create policy "users can manage own addresses"
  on addresses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 기존 관리자 RLS 정책 교체 (is_admin() 사용)
-- products
drop policy if exists "admin full access products" on products;
create policy "admin full access products"
  on products for all using (is_admin()) with check (is_admin());

-- product_images
drop policy if exists "admin full access product_images" on product_images;
create policy "admin full access product_images"
  on product_images for all using (is_admin()) with check (is_admin());

-- product_options
drop policy if exists "admin full access product_options" on product_options;
create policy "admin full access product_options"
  on product_options for all using (is_admin()) with check (is_admin());

-- categories
drop policy if exists "admin full access categories" on categories;
create policy "admin full access categories"
  on categories for all using (is_admin()) with check (is_admin());

-- banners
drop policy if exists "admin full access banners" on banners;
create policy "admin full access banners"
  on banners for all using (is_admin()) with check (is_admin());

-- inquiries
drop policy if exists "admin full access inquiries" on inquiries;
drop policy if exists "admin update inquiries" on inquiries;
create policy "admin full access inquiries"
  on inquiries for all using (is_admin()) with check (is_admin());

-- orders
drop policy if exists "admin full access orders" on orders;
drop policy if exists "admin full access order_items" on order_items;
create policy "admin full access orders"
  on orders for all using (is_admin()) with check (is_admin());
create policy "admin full access order_items"
  on order_items for all using (is_admin()) with check (is_admin());

-- 회원은 본인 주문만 조회
drop policy if exists "anyone can select own order" on orders;
drop policy if exists "anyone can select order_items" on order_items;
create policy "users can select own orders"
  on orders for select using (user_id = auth.uid() or user_id is null);
create policy "users can select order_items"
  on order_items for select
  using (exists (select 1 from orders where orders.id = order_items.order_id and (orders.user_id = auth.uid() or orders.user_id is null)));

-- ※ 마이그레이션 실행 후, 기존 관리자 계정의 profile을 수동으로 admin으로 설정:
-- update profiles set role = 'admin' where id = '<admin-user-uuid>';
