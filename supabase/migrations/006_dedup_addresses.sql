-- 중복 배송지 제거: 동일 user_id + recipient_name + phone + address 중 가장 오래된 것만 남김
delete from addresses
where id not in (
  select distinct on (user_id, recipient_name, phone, address) id
  from addresses
  order by user_id, recipient_name, phone, address, created_at asc
);
