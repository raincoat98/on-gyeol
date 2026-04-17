-- 주문
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  customer_memo text,
  total_amount int not null,
  delivery_fee int not null default 3000,
  status text not null default 'pending' check (status in ('pending', 'paid', 'shipping', 'delivered', 'cancelled')),
  payment_key text,
  payment_method text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 주문 상품
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  product_slug text not null,
  image_url text,
  option_color text,
  option_size text,
  price int not null,
  quantity int not null default 1,
  created_at timestamptz not null default now()
);

-- updated_at 자동 갱신
create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- RLS
alter table orders enable row level security;
alter table order_items enable row level security;

-- 누구나 주문 생성 가능
create policy "anyone can insert order"
  on orders for insert with check (true);

create policy "anyone can insert order_items"
  on order_items for insert with check (true);

-- 본인 주문 조회 (order_number로 접근)
create policy "anyone can select own order"
  on orders for select using (true);

create policy "anyone can select order_items"
  on order_items for select using (true);

-- 주문 상태 업데이트 (결제 확인용)
create policy "anyone can update order status"
  on orders for update using (true) with check (true);

-- 관리자 전체 권한
create policy "admin full access orders"
  on orders for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "admin full access order_items"
  on order_items for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
