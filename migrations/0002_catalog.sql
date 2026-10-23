create table if not exists lines (
  id text primary key,
  name text not null,
  slug text not null unique,
  blurb text not null default '',
  sort_order int not null default 0
);

create table if not exists models (
  id text primary key,
  line_id text not null references lines(id) on delete cascade,
  name text not null,
  slug text not null unique,
  tagline text not null default '',
  hero_image text not null default '',
  sort_order int not null default 0
);

create table if not exists versions (
  id text primary key,
  model_id text not null references models(id) on delete cascade,
  name text not null,
  slug text not null unique,
  summary text not null default '',
  swatch text not null default '#161513',
  hero_image text not null default '',
  sort_order int not null default 0
);

create table if not exists milestones (
  id text primary key,
  version_id text not null references versions(id) on delete cascade,
  label text not null,
  happened_on date not null,
  note text not null default '',
  sort_order int not null default 0
);

create table if not exists editions (
  id text primary key,
  milestone_id text not null references milestones(id) on delete cascade,
  name text not null,
  image text not null default '',
  sort_order int not null default 0
);

create table if not exists specs (
  id text primary key,
  edition_id text not null references editions(id) on delete cascade,
  group_name text not null default '',
  spec_name text not null,
  spec_value text not null default '',
  sort_order int not null default 0
);

create table if not exists options (
  id text primary key,
  edition_id text not null references editions(id) on delete cascade,
  name text not null,
  description text not null default '',
  sort_order int not null default 0
);

insert into lines (id, name, slug, blurb, sort_order) values
  ('ln-adv', 'Adventure', 'adventure', 'Xe địa hình đường dài. GS là trụ cột của dòng này.', 1),
  ('ln-spt', 'Sport', 'sport', 'Hiệu suất và độ chính xác trên đường đua lẫn đường núi.', 2),
  ('ln-tou', 'Tour', 'tour', 'Thoải mái cho hành trình nhiều ngày, hành lý đầy đủ.', 3)
on conflict (id) do nothing;

insert into models (id, line_id, name, slug, tagline, hero_image, sort_order) values
  ('md-gs', 'ln-adv', 'R 1300 GS', 'r-1300-gs', 'Boxer 1300. Dẫn nhịp, không đi theo.', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1600&q=80', 1),
  ('md-gsa', 'ln-adv', 'R 1300 GS Adventure', 'r-1300-gs-adventure', 'Tầm xa, bình lớn, sẵn sàng ra khỏi đường nhựa.', 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1600&q=80', 2),
  ('md-rr', 'ln-spt', 'S 1000 RR', 's-1000-rr', 'Superbike đường phố. Giới hạn là việc của người cầm lái.', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1600&q=80', 1),
  ('md-rt', 'ln-tou', 'R 1300 RT', 'r-1300-rt', 'Touring boxer. Kính lớn, yên rộng, đường dài.', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1600&q=80', 1)
on conflict (id) do nothing;

insert into versions (id, model_id, name, slug, summary, swatch, hero_image, sort_order) values
  ('vr-tb', 'md-gs', 'Triple Black', 'triple-black', 'Toàn đen. Bản all-rounder, tiện nghi cao, dễ bán cho khách muốn một chiếc GS kín đáo.', '#1a1a1a', 'https://images.unsplash.com/photo-1558980664-10e7170b5df2?auto=format&fit=crop&w=1600&q=80', 1),
  ('vr-rr', 'md-gs', 'Racing Red', 'racing-red', 'Đỏ thể thao. Cùng khung máy, khác đồ họa và một số option theo đợt.', '#9b2335', 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=1600&q=80', 2),
  ('vr-tr', 'md-gs', 'GS Trophy', 'gs-trophy', 'Định hướng off-road. Bảo vệ gầm và option địa hình thay đổi theo đợt nhập.', '#1e3a5f', 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&w=1600&q=80', 3)
on conflict (id) do nothing;

insert into milestones (id, version_id, label, happened_on, note, sort_order) values
  ('ms-1', 'vr-tb', 'Đợt 1 · 2024', '2024-04-01', 'Lô đầu sau khi R 1300 GS về Việt Nam.', 1),
  ('ms-2', 'vr-tb', 'Đợt 2 · 2025', '2025-02-15', 'Bổ sung gói Dynamic và bản Comfort cho khách touring.', 2),
  ('ms-3', 'vr-tb', 'Đợt 3 · 2026', '2026-03-01', 'Màu và option mới theo năm model 2026.', 3)
on conflict (id) do nothing;

insert into editions (id, milestone_id, name, image, sort_order) values
  ('ed-1', 'ms-1', 'Triple Black tiêu chuẩn', 'https://images.unsplash.com/photo-1558980664-10e7170b5df2?auto=format&fit=crop&w=1400&q=80', 1),
  ('ed-2', 'ms-2', 'Triple Black Dynamic', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1400&q=80', 1),
  ('ed-3', 'ms-2', 'Triple Black Comfort', 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1400&q=80', 2),
  ('ed-4', 'ms-3', 'Triple Black 2026', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1400&q=80', 1)
on conflict (id) do nothing;

insert into specs (id, edition_id, group_name, spec_name, spec_value, sort_order) values
  ('sp-1', 'ed-1', 'Động cơ', 'Loại', 'Boxer 2 xy-lanh, ShiftCam', 1),
  ('sp-2', 'ed-1', 'Động cơ', 'Dung tích', '1.300 cc', 2),
  ('sp-3', 'ed-1', 'Động cơ', 'Công suất', '145 hp tại 7.750 vòng/phút', 3),
  ('sp-4', 'ed-1', 'Động cơ', 'Mô-men', '149 Nm tại 6.500 vòng/phút', 4),
  ('sp-5', 'ed-1', 'Khung gầm', 'Treo trước / sau', 'EVO Telelever / EVO Paralever', 5),
  ('sp-6', 'ed-1', 'Khung gầm', 'Trọng lượng sẵn sàng', '237 kg', 6),
  ('sp-7', 'ed-2', 'Động cơ', 'Công suất', '145 hp tại 7.750 vòng/phút', 1),
  ('sp-8', 'ed-2', 'Điện tử', 'Gói Dynamic', 'DSA, Riding Modes Pro, Shift Assistant Pro', 2),
  ('sp-9', 'ed-3', 'Tiện nghi', 'Yên', 'Yên comfort, sưởi người lái và sau', 1),
  ('sp-10', 'ed-3', 'Tiện nghi', 'Kính gió', 'Chỉnh điện', 2),
  ('sp-11', 'ed-4', 'Động cơ', 'Dung tích', '1.300 cc', 1),
  ('sp-12', 'ed-4', 'Năm model', 'Áp dụng', 'Từ sản xuất 03/2026', 2)
on conflict (id) do nothing;

insert into options (id, edition_id, name, description, sort_order) values
  ('op-1', 'ed-1', 'Mâm đúc đen', 'Bộ mâm hợp kim sơn đen, nhận diện Triple Black.', 1),
  ('op-2', 'ed-1', 'Đèn LED', 'Đèn pha LED đối xứng, xi-nhan tích hợp bảo vệ tay.', 2),
  ('op-3', 'ed-1', 'TFT Connectivity', 'Màn hình màu, kết nối điện thoại qua BMW Motorrad Connected.', 3),
  ('op-4', 'ed-2', 'Dynamic Suspension Adjustment', 'Giảm xóc điện tử, chỉnh theo chế độ lái và tải.', 1),
  ('op-5', 'ed-2', 'Shift Assistant Pro', 'Lên số và xuống số không cần bóp côn.', 2),
  ('op-6', 'ed-2', 'Phanh Sport', 'Đĩa và kẹp phanh nâng cấp cho nhịp phanh gắt hơn.', 3),
  ('op-7', 'ed-3', 'Yên sưởi', 'Sưởi yên người lái và người ngồi sau, nhiều mức.', 1),
  ('op-8', 'ed-3', 'Kính chắn gió chỉnh điện', 'Nâng hạ kính theo tốc độ hoặc bằng nút trên tay lái.', 2),
  ('op-9', 'ed-3', 'Tay nắm sưởi', 'Giữ ấm tay trên đường đèo sáng sớm.', 3),
  ('op-10', 'ed-4', 'Đồ họa 2026', 'Tem và phối màu Triple Black theo năm model mới.', 1),
  ('op-11', 'ed-4', 'Bảo vệ tay mở rộng', 'Chắn gió và va chạm cho cổ tay, có trên mọi gói màu 2026.', 2)
on conflict (id) do nothing;
