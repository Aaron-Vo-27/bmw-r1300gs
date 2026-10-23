import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";

const ADMIN_KEY = "admin123";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const pageSchema = z.object({
  eyebrow: z.string().max(80),
  title: z.string().max(140),
  text: z.string().max(280),
  heading: z.string().max(80),
  intro: z.string().max(280),
  heroImage: z.string().max(1_200_000),
  midEyebrow: z.string().max(80),
  midTitle: z.string().max(140),
  midText: z.string().max(280),
  midImage: z.string().max(1_200_000),
});

export const settingsSchema = z.object({
  brand: z.string().min(1).max(80),
  logo: z.string().max(120000).default(""),
  description: z.string().max(240),
  footer: z.string().max(200),
  nav: z.object({
    news: z.string().min(1).max(40),
    specs: z.string().min(1).max(40),
    tech: z.string().min(1).max(40),
    blog: z.string().min(1).max(40),
  }),
  theme: z.object({
    bone: hex,
    paper: hex,
    ink: hex,
    muted: hex,
    line: hex,
    accent: hex,
    font: z.enum(["manrope", "fraunces", "editorial"]),
    radius: z.enum(["tight", "soft", "round"]),
  }),
  pages: z.object({
    home: pageSchema,
    tech: pageSchema,
    blog: pageSchema,
    specs: pageSchema,
  }),
});

export type SiteSettings = z.infer<typeof settingsSchema>;
export type PageCopy = z.infer<typeof pageSchema>;

export const defaultSettings: SiteSettings = {
  brand: "Kho Motorrad",
  logo: "",
  description: "Thư viện tra cứu dòng xe, phiên bản và option cho salesperson.",
  footer: "Thư viện nội bộ cho salesperson.",
  nav: { news: "Tin tức", specs: "Thông số", tech: "Công nghệ", blog: "Blog" },
  theme: {
    bone: "#f3efe6",
    paper: "#faf8f4",
    ink: "#161513",
    muted: "#6e695f",
    line: "#e4ddd0",
    accent: "#1d4e89",
    font: "editorial",
    radius: "round",
  },
  pages: {
    home: {
      eyebrow: "Thư viện nội bộ",
      title: "Tra cứu trước khi tư vấn.",
      text: "Dòng xe, phiên bản màu và option theo từng đợt nhập.",
      heading: "Tin mới.",
      intro: "Cập nhật showroom, đợt hàng và những gì salesperson cần biết trong tuần.",
      heroImage: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=2000&q=80",
      midEyebrow: "Công nghệ",
      midTitle: "Khung, giảm xóc, đèn. Nói được cho khách.",
      midText: "Mở mục công nghệ khi khách hỏi xe khác đời trước ở điểm nào.",
      midImage: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=2000&q=80",
    },
    tech: {
      eyebrow: "Công nghệ",
      title: "Nói được vì sao xe này khác.",
      text: "Khung, giảm xóc, đèn, điện tử. Mỗi bài là một câu trả lời cho khách.",
      heading: "Thông tin công nghệ",
      intro: "Khung, giảm xóc, đèn, điện tử. Mỗi ô là một bài để sales giải thích cho khách.",
      heroImage: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=2000&q=80",
      midEyebrow: "Thông số",
      midTitle: "Hiểu công nghệ rồi, mở đúng bảng số.",
      midText: "Option thay đổi theo đợt nhập. Đừng trộn số của hai mốc.",
      midImage: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?auto=format&fit=crop&w=2000&q=80",
    },
    blog: {
      eyebrow: "Blog",
      title: "Đường thật, không chỉ thông số.",
      text: "Cảm nhận sau đèo, mưa đêm và một ngày chở người ngồi sau.",
      heading: "Blog",
      intro: "Cảm nhận, đánh giá và trải nghiệm sau từng chuyến đi.",
      heroImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80",
      midEyebrow: "Công nghệ",
      midTitle: "Muốn biết vì sao xe êm, đọc phần kỹ thuật.",
      midText: "Telelever, Paralever, khung M. Giải thích ngắn cho buổi tư vấn.",
      midImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2000&q=80",
    },
    specs: {
      eyebrow: "Thông số",
      title: "Đúng đời, đúng đợt, đúng option.",
      text: "Chọn dòng xe, rồi mẫu, rồi mốc nhập. Đừng đọc số của đợt khác.",
      heading: "Thông số kỹ thuật",
      intro: "Chọn dòng xe, rồi mẫu, rồi phiên bản. Trong phiên bản là timeline từng đợt nhập.",
      heroImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=2000&q=80",
      midEyebrow: "Trải nghiệm",
      midTitle: "Số liệu xong, đọc một chuyến đi thật.",
      midText: "Blog ghi lại cảm giác yên, kính và chế độ lái khi đường ướt.",
      midImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80",
    },
  },
};

function mergeSettings(value: unknown): SiteSettings {
  const parsed = settingsSchema.safeParse(value);
  if (parsed.success) return parsed.data;
  const raw = value && typeof value === "object" ? (value as Partial<SiteSettings>) : {};
  const candidate = {
    ...defaultSettings,
    ...raw,
    nav: { ...defaultSettings.nav, ...raw.nav },
    theme: { ...defaultSettings.theme, ...raw.theme },
    pages: {
      home: { ...defaultSettings.pages.home, ...raw.pages?.home },
      tech: { ...defaultSettings.pages.tech, ...raw.pages?.tech },
      blog: { ...defaultSettings.pages.blog, ...raw.pages?.blog },
      specs: { ...defaultSettings.pages.specs, ...raw.pages?.specs },
    },
  };
  const again = settingsSchema.safeParse(candidate);
  return again.success ? again.data : defaultSettings;
}

export const getSettings = createServerFn({ method: "GET" }).handler(async (): Promise<SiteSettings> => {
  try {
    const sql = await getSql();
    const rows = await sql<{ payload: string }>`select payload from site_settings where id = 'site'`;
    if (!rows[0]) return defaultSettings;
    return mergeSettings(JSON.parse(rows[0].payload));
  } catch {
    return defaultSettings;
  }
});

export const saveSettings = createServerFn({ method: "POST" })
  .validator(z.object({ adminKey: z.string(), settings: settingsSchema }))
  .handler(async ({ data }) => {
    if (data.adminKey !== ADMIN_KEY) throw new Error("Chỉ quản trị mới nhập liệu được.");
    const sql = await getSql();
    const payload = JSON.stringify(data.settings);
    const existing = await sql<{ id: string }>`select id from site_settings where id = 'site'`;
    if (existing[0]) {
      await sql`update site_settings set payload = ${payload}, updated_at = now() where id = 'site'`;
    } else {
      await sql`insert into site_settings (id, payload) values ('site', ${payload})`;
    }
    return { ok: true as const };
  });
