create table if not exists site_settings (
  id text primary key,
  payload text not null,
  updated_at timestamptz not null default now()
);
