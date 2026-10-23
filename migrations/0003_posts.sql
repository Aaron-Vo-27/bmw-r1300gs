create table if not exists posts (
  id text primary key,
  kind text not null,
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  cover text not null default '',
  author text not null default '',
  published_on date not null default current_date
);

insert into posts (id, kind, slug, title, excerpt, body, cover, author, published_on) values
  ('ps-1', 'news', 'gs-2026-ve-showroom', 'R 1300 GS bản 2026 đã có lịch giao tại showroom', 'Đợt tháng 3 mang đồ họa mới và bảo vệ tay mở rộng trên mọi gói màu.', 'Sales cần nhớ: khách hỏi “có khác máy không” thì trả lời khung máy vẫn là boxer 1300, 145 hp. Điểm bán của đợt này là đồ họa và bảo vệ tay, không phải đời máy mới.' || E'\n\n' || 'Khi dẫn khách xem xe, mở timeline Triple Black, mốc Đợt 3 · 2026, để đối chiếu option với xe đang có trong kho.', 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1600&q=80', 'Kho xe', '2026-03-12'),
  ('ps-2', 'news', 'goi-dynamic-con-hang', 'Gói Dynamic trên Triple Black còn hàng đợt 2', 'DSA, Shift Assistant Pro và phanh Sport. Không nhầm với bản Comfort.', 'Bản Dynamic dành cho khách muốn cảm giác lái. Bản Comfort dành cho khách đi tour hai người: yên sưởi, kính điện, tay nắm sưởi.' || E'\n\n' || 'Luôn hỏi khách đi một mình hay có người ngồi sau trước khi gợi ý gói.', 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1600&q=80', 'Tư vấn', '2026-02-02'),
  ('ps-3', 'news', 'rt-va-gs-khac-nhau', 'Phân biệt nhanh R 1300 RT và R 1300 GS cho khách mới', 'Cùng họ boxer, khác việc sử dụng. Đừng đẩy GS cho khách chỉ đi đường nhựa dài.', 'RT là touring kính lớn, yên rộng, hành lý cốp. GS là adventure, đứng lái, đi được đường xấu.' || E'\n\n' || 'Câu hỏi lọc: “Anh/chị có xuống đường đất không?” Nếu không, dẫn sang Tour.', 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1600&q=80', 'Tư vấn', '2026-01-20'),
  ('ps-4', 'tech', 'm-frame', 'Khung M Frame', 'Khung chính đúc, mở chỗ cho thùng xăng phẳng và tư thế đứng lái.', 'M Frame gom khối động cơ và khung thành một cụm gọn. Người lái có tầm nhìn xuống bánh trước rõ hơn, dễ đứng trên peg khi off-road.' || E'\n\n' || 'Khi giải thích với khách: đây là lý do GS mới trông ngắn và nhẹ mắt hơn đời trước, dù dung tích vẫn 1300.', 'https://images.unsplash.com/photo-1558980664-10e7170b5df2?auto=format&fit=crop&w=1400&q=80', 'Kỹ thuật', '2026-01-08'),
  ('ps-5', 'tech', 'evo-telelever', 'EVO Telelever', 'Giảm xóc trước tách lực phanh khỏi tay lái.', 'Telelever dùng càng dẫn và giảm xóc trung tâm thay vì phuộc ống lồng truyền thống. Khi phanh gấp, mũi xe không cắm mạnh, tay lái vẫn nhẹ.' || E'\n\n' || 'Câu bán hàng: khách đi đèo hoặc chở người sẽ thấy đầu xe ổn định hơn khi giảm tốc.', 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=1400&q=80', 'Kỹ thuật', '2025-11-18'),
  ('ps-6', 'tech', 'evo-paralever', 'EVO Paralever', 'Giảm phản lực truyền từ truyền động trục tới gầm xe.', 'Paralever là hệ thống tay đòn sau của mô-tơ boxer truyền động trục. Thế hệ EVO giữ bánh sau bám khi tăng tốc, hạn chế hiện tượng gầm nhấc.', 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=1400&q=80', 'Kỹ thuật', '2025-11-18'),
  ('ps-7', 'blog', 'di-deo-bao-loc', 'Một ngày đèo Bảo Lộc trên GS', 'Ghi lại cảm giác yên, kính gió và chế độ lái khi đường ướt.', 'Sáng xuất phát Sài Gòn, đến Bảo Lộc tầm trưa. Đường ướt, mình để Rain. Kính để thấp cho mát, nâng lên khi vào đèo để đỡ gió ngực.' || E'\n\n' || 'Điều đáng kể với khách: không phải sức máy, mà là mình còn tỉnh sau 200 km.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80', 'Quang', '2026-02-28'),
  ('ps-8', 'blog', 'ngoi-sau-comfort', 'Ngồi sau trên bản Comfort', 'Người ngồi sau nhận xét yên sưởi và bệ nắm sau một chuyến cuối tuần.', 'Yên rộng hơn bản tiêu chuẩn. Sưởi mức 1 là đủ buổi tối. Bệ nắm dễ với, không phải ôm eo người lái suốt.', 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1400&q=80', 'Lan', '2026-01-30')
on conflict (id) do nothing;
