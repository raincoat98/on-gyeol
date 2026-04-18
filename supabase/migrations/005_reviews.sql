-- 리뷰
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  order_item_id uuid references order_items(id) on delete set null,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  content text not null,
  created_at timestamptz not null default now()
);

-- 주문 아이템당 리뷰 하나
create unique index reviews_order_item_id_key on reviews(order_item_id)
  where order_item_id is not null;

alter table reviews enable row level security;

create policy "public can read reviews"
  on reviews for select using (true);

create policy "user can insert review"
  on reviews for insert with check (auth.uid() = user_id);

create policy "user can delete review"
  on reviews for delete using (auth.uid() = user_id);

create policy "admin full access reviews"
  on reviews for all using (is_admin()) with check (is_admin());

-- inquiries에 user_id 추가
alter table inquiries add column if not exists user_id uuid references auth.users(id) on delete set null;

create policy "user can read own inquiries"
  on inquiries for select using (user_id = auth.uid());
