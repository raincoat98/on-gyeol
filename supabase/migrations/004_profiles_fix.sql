-- 누락된 profiles 행 채우기 (트리거 추가 전 가입한 사용자)
insert into profiles (id, role)
select id, 'customer'
from auth.users
where id not in (select id from profiles)
on conflict (id) do nothing;

-- 본인 프로필 insert 허용 (upsert 지원)
create policy "users can insert own profile"
  on profiles for insert with check (auth.uid() = id);
