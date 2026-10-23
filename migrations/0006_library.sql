create table if not exists spec_fields (
  id text primary key,
  group_name text not null default '',
  name text not null,
  sort_order integer not null default 0
);

create table if not exists spec_choices (
  id text primary key,
  field_id text not null references spec_fields (id) on delete cascade,
  label text not null,
  sort_order integer not null default 0,
  unique (field_id, label)
);

create table if not exists edition_specs (
  id text primary key,
  edition_id text not null references editions (id) on delete cascade,
  field_id text not null references spec_fields (id) on delete cascade,
  choice_id text not null references spec_choices (id) on delete cascade,
  unique (edition_id, field_id)
);

create table if not exists option_catalog (
  id text primary key,
  code text not null unique,
  name text not null,
  description text not null default ''
);

create table if not exists edition_options (
  id text primary key,
  edition_id text not null references editions (id) on delete cascade,
  option_id text not null references option_catalog (id) on delete cascade,
  sort_order integer not null default 0,
  unique (edition_id, option_id)
);

insert into spec_fields (id, group_name, name, sort_order)
select
  'sf-' || substr(md5(group_name || '|' || spec_name), 1, 10),
  group_name,
  spec_name,
  min(sort_order)
from specs
group by group_name, spec_name
on conflict (id) do nothing;

insert into spec_choices (id, field_id, label, sort_order)
select
  'sc-' || substr(md5(f.id || '|' || s.spec_value), 1, 10),
  f.id,
  s.spec_value,
  min(s.sort_order)
from specs s
join spec_fields f on f.group_name = s.group_name and f.name = s.spec_name
group by f.id, s.spec_value
on conflict (id) do nothing;

insert into edition_specs (id, edition_id, field_id, choice_id)
select
  'es-' || substr(md5(s.id), 1, 12),
  s.edition_id,
  f.id,
  c.id
from specs s
join spec_fields f on f.group_name = s.group_name and f.name = s.spec_name
join spec_choices c on c.field_id = f.id and c.label = s.spec_value
on conflict (id) do nothing;

insert into spec_fields (id, group_name, name, sort_order)
values ('sf-engine', 'Động cơ', 'Kiểu động cơ', 0)
on conflict (id) do nothing;

insert into spec_choices (id, field_id, label, sort_order) values
  ('sc-boxer', 'sf-engine', 'Boxer', 1),
  ('sc-inline4', 'sf-engine', 'In-Line 4', 2),
  ('sc-inline2', 'sf-engine', 'In-Line 2', 3),
  ('sc-single', 'sf-engine', 'Single', 4)
on conflict (id) do nothing;

insert into option_catalog (id, code, name, description)
select
  'oc-' || substr(md5(name), 1, 10),
  'OP-' || lpad((row_number() over (order by min(sort_order), name))::text, 2, '0'),
  name,
  coalesce(max(description), '')
from options
group by name
on conflict (id) do nothing;

insert into edition_options (id, edition_id, option_id, sort_order)
select
  'eo-' || substr(md5(o.id), 1, 12),
  o.edition_id,
  c.id,
  o.sort_order
from options o
join option_catalog c on c.name = o.name
on conflict (id) do nothing;
