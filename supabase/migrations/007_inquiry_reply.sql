alter table inquiries
  add column if not exists admin_reply text,
  add column if not exists replied_at timestamptz;
