create table if not exists tags (
  id text primary key,
  name text not null,
  slug text not null unique,
  kind text not null
);

create table if not exists post_tags (
  post_id text not null references posts (id) on delete cascade,
  tag_id text not null references tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

insert into tags (id, name, slug, kind) values
  ('tg-news', 'Tin tức', 'tin-tuc', 'news'),
  ('tg-tech', 'Công nghệ', 'cong-nghe', 'tech'),
  ('tg-blog', 'Blog', 'blog', 'blog')
on conflict (id) do nothing;

insert into post_tags (post_id, tag_id)
select p.id, t.id
from posts p
join tags t on t.kind = p.kind
on conflict do nothing;
