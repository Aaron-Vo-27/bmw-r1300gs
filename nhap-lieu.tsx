import { useEffect, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { defaultSettings, saveSettings, type PageCopy, type SiteSettings } from "@/lib/settings.functions";
import { useSiteSettings } from "@/components/site-settings";
import {
  assignOption,
  assignSpec,
  checkAdmin,
  getCatalog,
  getLibrary,
  getPosts,
  getTags,
  removeRow,
  saveCatalogOption,
  saveEdition,
  saveLine,
  saveMilestone,
  saveModel,
  savePost,
  saveSpecChoice,
  saveSpecField,
  saveTag,
  saveVersion,
  type Catalog,
  type Library,
  type Tag,
} from "@/lib/catalog.functions";

let sessionAdminKey = "";

function keyed<T extends object>(data: T) {
  return { ...data, adminKey: sessionAdminKey };
}

export const Route = createFileRoute("/nhap-lieu")({
  loader: async () => {
    const [catalog, posts, library, tags] = await Promise.all([getCatalog(), getPosts(), getLibrary(), getTags()]);
    return { catalog, posts, library, tags };
  },
  component: AdminPage,
});

function AdminPage() {
  const { catalog, posts, library, tags } = Route.useLoaderData();
  const router = useRouter();
  const [advanced, setAdvanced] = useState(false);
  const [message, setMessage] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [code, setCode] = useState("");
  const [pane, setPane] = useState<"home" | "the" | "san-pham" | "bai-viet" | "giao-dien">("home");

  useEffect(() => {
    const saved = sessionStorage.getItem("kho-admin") ?? "";
    if (!saved) return;
    sessionAdminKey = saved;
    setUnlocked(true);
  }, []);

  async function refresh(text: string) {
    setMessage(text);
    await router.invalidate();
  }

  async function unlock(event: React.FormEvent) {
    event.preventDefault();
    try {
      await checkAdmin({ data: { adminKey: code } });
      sessionAdminKey = code;
      sessionStorage.setItem("kho-admin", code);
      setUnlocked(true);
      setMessage("");
    } catch {
      setMessage("Mã quản trị không đúng.");
    }
  }

  if (!unlocked) {
    return (
      <Shell>
        <main className="mx-auto max-w-md px-5 py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Quản trị</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Nhập liệu</h1>
          <p className="mt-3 text-sm text-muted">Chỉ người quản trị mới thêm hoặc sửa nội dung. Sales dùng các mục tra cứu ở trên.</p>
          <form onSubmit={unlock} className="mt-8">
            <input
              type="password"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Mã quản trị"
              className="w-full rounded-xl border border-line bg-bone px-3 py-3"
              required
            />
            <button type="submit" className="mt-4 rounded-full bg-ink px-5 py-3 text-sm text-bone">
              Vào
            </button>
          </form>
          {message ? <p className="mt-4 text-sm text-danger">{message}</p> : null}
        </main>
      </Shell>
    );
  }

  return (
    <Shell>
      <main className="mx-auto max-w-3xl px-5 pb-24 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Nhập liệu</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              {pane === "the" ? "Thẻ" : pane === "san-pham" ? "Sản phẩm" : pane === "bai-viet" ? "Bài viết" : pane === "giao-dien" ? "Giao diện" : "Quản trị"}
            </h1>
          </div>
          <div className="flex gap-2">
            {pane !== "home" && (
              <button type="button" onClick={() => setPane("home")} className="rounded-full border border-line px-4 py-2 text-sm">
                Về menu
              </button>
            )}
            {pane === "san-pham" && (
              <button
                type="button"
                onClick={() => setAdvanced((value) => !value)}
                className="rounded-full border border-line bg-paper px-4 py-2 text-sm"
              >
                {advanced ? "Chế độ nâng cao" : "Chế độ cơ bản"}
              </button>
            )}
          </div>
        </div>
        {message ? <p className="mt-4 text-sm text-accent">{message}</p> : null}

        {pane === "home" && (
          <ul className="mt-8 grid gap-4">
            <MenuCard title="Thẻ" text="Tạo thẻ phân loại bài viết, thông số và option. Dùng lại khi tạo sản phẩm hoặc bài." onClick={() => setPane("the")} />
            <MenuCard title="Sản phẩm" text="Khai báo lần lượt: dòng xe, mẫu xe, phiên bản, rồi timeline và option." onClick={() => setPane("san-pham")} />
            <MenuCard title="Bài viết" text="Viết bài và gán thẻ Tin tức, Công nghệ, Blog hoặc thẻ vừa tạo." onClick={() => setPane("bai-viet")} />
            <MenuCard title="Giao diện" text="Sửa tên site, menu, màu, font, góc bo và chữ trên từng trang." onClick={() => setPane("giao-dien")} />
          </ul>
        )}

        {pane === "the" && (
          <>
            <Section title="Thẻ bài viết">
              <TagLibrary
                tags={tags}
                onDone={refresh}
              />
            </Section>
            <Section title="Thẻ thông số">
              <FieldLibrary library={library} onDone={refresh} />
            </Section>
            <Section title="Thẻ option">
              <OptionLibrary library={library} onDone={refresh} />
            </Section>
          </>
        )}

        {pane === "san-pham" && (
          <ProductDesk catalog={catalog} library={library} advanced={advanced} onDone={refresh} />
        )}

        {pane === "giao-dien" && <AppearanceDesk onDone={refresh} />}

        {pane === "bai-viet" && (
          <Section title="Bài viết">
            <PostForm
              tags={tags}
              onSave={async (input) => {
                await savePost({ data: keyed(input) });
                await refresh("Đã đăng bài.");
              }}
            />
            <ul className="mt-4 space-y-2 text-sm">
              {posts.map((post) => (
                <li key={post.id} className="flex items-start justify-between gap-3">
                  <span>
                    {post.tags.map((tag) => tag.name).join(", ") || post.kind} · {post.title}
                  </span>
                  <Trash
                    onClick={async () => {
                      await removeRow({ data: keyed({ table: "posts" as const, id: post.id }) });
                      await refresh("Đã xóa bài.");
                    }}
                  />
                </li>
              ))}
            </ul>
          </Section>
        )}
      </main>
    </Shell>
  );
}

function AppearanceDesk({ onDone }: { onDone: (text: string) => Promise<void> }) {
  const saved = useSiteSettings();
  const [draft, setDraft] = useState(saved);

  function patch(next: Partial<SiteSettings>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  async function save(next: SiteSettings) {
    await saveSettings({ data: keyed({ settings: next }) });
    setDraft(next);
    await onDone("Đã cập nhật giao diện.");
  }

  return (
    <form
      className="mt-8 space-y-8"
      onSubmit={async (event) => {
        event.preventDefault();
        await save(draft);
      }}
    >
      <Section title="Thương hiệu">
        <Field label="Tên site">
          <input className={inputClass} value={draft.brand} onChange={(event) => patch({ brand: event.target.value })} required />
        </Field>
        <Field label="Logo">
          <input
            className="block text-sm"
            type="file"
            accept="image/*"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              patch({ logo: await shrinkLogo(file) });
            }}
          />
          {draft.logo ? (
            <span className="mt-3 flex items-center gap-3">
              <img src={draft.logo} alt="" className="h-8 w-auto max-w-36 object-contain" />
              <button type="button" className="text-sm text-danger" onClick={() => patch({ logo: "" })}>
                Gỡ logo
              </button>
            </span>
          ) : (
            <span className="mt-2 block text-sm text-muted">Ảnh được thu nhỏ vừa thanh trên, giữ đúng tỉ lệ.</span>
          )}
        </Field>
        <Field label="Mô tả (thẻ title của trình duyệt)">
          <input className={inputClass} value={draft.description} onChange={(event) => patch({ description: event.target.value })} />
        </Field>
        <Field label="Chữ chân trang">
          <input className={inputClass} value={draft.footer} onChange={(event) => patch({ footer: event.target.value })} />
        </Field>
      </Section>
      <Section title="Menu">
        <div className="grid gap-2 sm:grid-cols-2">
          <Field label="Tin tức">
            <input className={inputClass} value={draft.nav.news} onChange={(event) => patch({ nav: { ...draft.nav, news: event.target.value } })} required />
          </Field>
          <Field label="Thông số">
            <input className={inputClass} value={draft.nav.specs} onChange={(event) => patch({ nav: { ...draft.nav, specs: event.target.value } })} required />
          </Field>
          <Field label="Công nghệ">
            <input className={inputClass} value={draft.nav.tech} onChange={(event) => patch({ nav: { ...draft.nav, tech: event.target.value } })} required />
          </Field>
          <Field label="Blog">
            <input className={inputClass} value={draft.nav.blog} onChange={(event) => patch({ nav: { ...draft.nav, blog: event.target.value } })} required />
          </Field>
        </div>
      </Section>
      <Section title="Màu, chữ, góc">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(
            [
              ["bone", "Nền"],
              ["paper", "Thẻ"],
              ["ink", "Chữ"],
              ["muted", "Chữ phụ"],
              ["line", "Viền"],
              ["accent", "Nhấn"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="text-sm">
              <span className="mb-1 block text-muted">{label}</span>
              <input
                type="color"
                className="h-11 w-full"
                value={draft.theme[key]}
                onChange={(event) => patch({ theme: { ...draft.theme, [key]: event.target.value } })}
              />
            </label>
          ))}
        </div>
        <Field label="Font">
          <select
            className={inputClass}
            value={draft.theme.font}
            onChange={(event) => patch({ theme: { ...draft.theme, font: event.target.value as SiteSettings["theme"]["font"] } })}
          >
            <option value="editorial">Manrope + Fraunces</option>
            <option value="manrope">Manrope</option>
            <option value="fraunces">Fraunces</option>
          </select>
        </Field>
        <Field label="Góc bo">
          <select
            className={inputClass}
            value={draft.theme.radius}
            onChange={(event) => patch({ theme: { ...draft.theme, radius: event.target.value as SiteSettings["theme"]["radius"] } })}
          >
            <option value="round">Tròn</option>
            <option value="soft">Vừa</option>
            <option value="tight">Thẳng</option>
          </select>
        </Field>
      </Section>
      <PageFields title="Trang tin tức" value={draft.pages.home} onChange={(home) => patch({ pages: { ...draft.pages, home } })} />
      <PageFields title="Trang công nghệ" value={draft.pages.tech} onChange={(tech) => patch({ pages: { ...draft.pages, tech } })} />
      <PageFields title="Trang blog" value={draft.pages.blog} onChange={(blog) => patch({ pages: { ...draft.pages, blog } })} />
      <PageFields title="Trang thông số" value={draft.pages.specs} onChange={(specs) => patch({ pages: { ...draft.pages, specs } })} />
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="rounded-full bg-ink px-5 py-3 text-sm text-bone">
          Lưu giao diện
        </button>
        <button type="button" className="rounded-full border border-line px-5 py-3 text-sm" onClick={() => void save(defaultSettings)}>
          Khôi phục mặc định
        </button>
      </div>
    </form>
  );
}

function PageFields({
  title,
  value,
  onChange,
}: {
  title: string;
  value: PageCopy;
  onChange: (value: PageCopy) => void;
}) {
  function set<K extends keyof PageCopy>(key: K, next: string) {
    onChange({ ...value, [key]: next });
  }
  return (
    <Section title={title}>
      <Field label="Banner — nhãn">
        <input className={inputClass} value={value.eyebrow} onChange={(event) => set("eyebrow", event.target.value)} />
      </Field>
      <Field label="Banner — tiêu đề">
        <input className={inputClass} value={value.title} onChange={(event) => set("title", event.target.value)} />
      </Field>
      <Field label="Banner — mô tả">
        <input className={inputClass} value={value.text} onChange={(event) => set("text", event.target.value)} />
      </Field>
      <ImageField label="Ảnh banner" value={value.heroImage} onChange={(next) => set("heroImage", next)} />
      <Field label="Tiêu đề trang">
        <input className={inputClass} value={value.heading} onChange={(event) => set("heading", event.target.value)} />
      </Field>
      <Field label="Đoạn giới thiệu">
        <input className={inputClass} value={value.intro} onChange={(event) => set("intro", event.target.value)} />
      </Field>
      <Field label="Banner giữa — nhãn">
        <input className={inputClass} value={value.midEyebrow} onChange={(event) => set("midEyebrow", event.target.value)} />
      </Field>
      <Field label="Banner giữa — tiêu đề">
        <input className={inputClass} value={value.midTitle} onChange={(event) => set("midTitle", event.target.value)} />
      </Field>
      <Field label="Banner giữa — mô tả">
        <input className={inputClass} value={value.midText} onChange={(event) => set("midText", event.target.value)} />
      </Field>
      <ImageField label="Ảnh banner giữa" value={value.midImage} onChange={(next) => set("midImage", next)} />
    </Section>
  );
}

function MenuCard({ title, text, onClick }: { title: string; text: string; onClick: () => void }) {
  return (
    <li>
      <button type="button" onClick={onClick} className="w-full rounded-3xl border border-line bg-paper p-6 text-left">
        <span className="text-2xl font-semibold tracking-tight">{title}</span>
        <span className="mt-2 block text-sm text-muted">{text}</span>
      </button>
    </li>
  );
}

function TagLibrary({ tags, onDone }: { tags: Tag[]; onDone: (text: string) => Promise<void> }) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"news" | "tech" | "blog">("news");
  return (
    <div>
      <p className="text-sm text-muted">Tin tức, Công nghệ và Blog là thẻ gốc. Thẻ mới vẫn hiện trong một trong ba mục đó.</p>
      <form
        className="mt-3 grid gap-2 sm:grid-cols-[1fr_10rem_auto]"
        onSubmit={async (event) => {
          event.preventDefault();
          await saveTag({ data: keyed({ name, kind }) });
          setName("");
          await onDone("Đã tạo thẻ.");
        }}
      >
        <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên thẻ" required />
        <select className={inputClass} value={kind} onChange={(event) => setKind(event.target.value as "news" | "tech" | "blog")}>
          <option value="news">Hiện ở Tin tức</option>
          <option value="tech">Hiện ở Công nghệ</option>
          <option value="blog">Hiện ở Blog</option>
        </select>
        <button type="submit" className="rounded-xl bg-ink px-4 py-3 text-sm text-bone">
          Tạo thẻ
        </button>
      </form>
      <ul className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li key={tag.id}>
            <button
              type="button"
              className="rounded-full border border-line bg-bone px-3 py-1 text-sm"
              onClick={async () => {
                await removeRow({ data: keyed({ table: "tags" as const, id: tag.id }) });
                await onDone("Đã xóa thẻ.");
              }}
            >
              {tag.name} ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductDesk({
  catalog,
  library,
  advanced,
  onDone,
}: {
  catalog: Catalog;
  library: Library;
  advanced: boolean;
  onDone: (text: string) => Promise<void>;
}) {
  const steps = ["Dòng xe", "Mẫu xe", "Phiên bản", "Timeline"];
  const [step, setStep] = useState(0);
  return (
    <div className="mt-8">
      <ol className="flex flex-wrap gap-2">
        {steps.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => setStep(index)}
              className={`rounded-full px-4 py-2 text-sm ${step === index ? "bg-ink text-bone" : "border border-line"}`}
            >
              {index + 1}. {label}
            </button>
          </li>
        ))}
      </ol>
      {step === 0 && (
        <Section title="1. Dòng xe">
          <LineForm
            onSave={async (input) => {
              await saveLine({ data: keyed(input) });
              await onDone("Đã lưu dòng xe. Chuyển sang mẫu xe.");
              setStep(1);
            }}
          />
          <ul className="mt-4 space-y-2 text-sm">
            {catalog.lines.map((line) => (
              <li key={line.id} className="flex items-center justify-between gap-3">
                <span>{line.name}</span>
                <Trash
                  onClick={async () => {
                    await removeRow({ data: keyed({ table: "lines" as const, id: line.id }) });
                    await onDone("Đã xóa dòng xe.");
                  }}
                />
              </li>
            ))}
          </ul>
        </Section>
      )}
      {step === 1 && (
        <Section title="2. Mẫu xe">
          <ModelForm
            catalog={catalog}
            onSave={async (input) => {
              await saveModel({ data: keyed(input) });
              await onDone("Đã lưu mẫu xe. Chuyển sang phiên bản.");
              setStep(2);
            }}
          />
        </Section>
      )}
      {step === 2 && (
        <Section title="3. Phiên bản">
          <VersionForm
            catalog={catalog}
            onSave={async (input) => {
              await saveVersion({ data: keyed(input) });
              await onDone("Đã lưu phiên bản. Chuyển sang timeline.");
              setStep(3);
            }}
          />
        </Section>
      )}
      {step === 3 && (
        <Section title="4. Timeline, thông số và option">
          <TimelineEditor catalog={catalog} library={library} advanced={advanced} onDone={onDone} />
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="glass mt-8 rounded-3xl p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mt-3 block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "w-full rounded-xl border border-line bg-bone px-3 py-3 text-ink outline-none";

function PostForm({
  tags,
  onSave,
}: {
  tags: Tag[];
  onSave: (input: {
    tagIds: string[];
    title: string;
    excerpt: string;
    body: string;
    cover: string;
    author: string;
  }) => Promise<void>;
}) {
  const [picked, setPicked] = useState<string[]>(tags[0] ? [tags[0].id] : []);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [cover, setCover] = useState("");
  const [author, setAuthor] = useState("");
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (picked.length === 0) return;
        await onSave({ tagIds: picked, title, excerpt, body, cover, author });
        setTitle("");
        setExcerpt("");
        setBody("");
        setCover("");
      }}
    >
      <Field label="Thẻ phân loại">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const on = picked.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => setPicked((current) => (on ? current.filter((id) => id !== tag.id) : [...current, tag.id]))}
                className={`rounded-full px-3 py-1 text-sm ${on ? "bg-ink text-bone" : "border border-line"}`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </Field>
      <Field label="Tiêu đề">
        <input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} required />
      </Field>
      <Field label="Tóm tắt">
        <input className={inputClass} value={excerpt} onChange={(event) => setExcerpt(event.target.value)} />
      </Field>
      <Field label="Nội dung">
        <textarea className={inputClass} rows={5} value={body} onChange={(event) => setBody(event.target.value)} />
      </Field>
      <Field label="Tác giả">
        <input className={inputClass} value={author} onChange={(event) => setAuthor(event.target.value)} />
      </Field>
      <ImageField label="Ảnh bìa" value={cover} onChange={setCover} />
      <Save label="Đăng bài" />
    </form>
  );
}

function LineForm({ onSave }: { onSave: (input: { name: string; blurb: string }) => Promise<void> }) {
  const [name, setName] = useState("");
  const [blurb, setBlurb] = useState("");
  return (
    <form
      className="grid gap-1"
      onSubmit={async (event) => {
        event.preventDefault();
        await onSave({ name, blurb });
        setName("");
        setBlurb("");
      }}
    >
      <Field label="Tên dòng">
        <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required />
      </Field>
      <Field label="Mô tả ngắn">
        <input className={inputClass} value={blurb} onChange={(event) => setBlurb(event.target.value)} />
      </Field>
      <Save />
    </form>
  );
}

function ModelForm({
  catalog,
  onSave,
}: {
  catalog: Catalog;
  onSave: (input: { lineId: string; name: string; tagline: string; heroImage: string }) => Promise<void>;
}) {
  const [lineId, setLineId] = useState(catalog.lines[0]?.id ?? "");
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [heroImage, setHeroImage] = useState("");
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        await onSave({ lineId, name, tagline, heroImage });
        setName("");
        setTagline("");
        setHeroImage("");
      }}
    >
      <Field label="Thuộc dòng">
        <select className={inputClass} value={lineId} onChange={(event) => setLineId(event.target.value)} required>
          {catalog.lines.map((line) => (
            <option key={line.id} value={line.id}>
              {line.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Tên mẫu">
        <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required />
      </Field>
      <Field label="Câu mô tả">
        <input className={inputClass} value={tagline} onChange={(event) => setTagline(event.target.value)} />
      </Field>
      <ImageField label="Ảnh mẫu xe" value={heroImage} onChange={setHeroImage} />
      <Save />
    </form>
  );
}

function VersionForm({
  catalog,
  onSave,
}: {
  catalog: Catalog;
  onSave: (input: {
    modelId: string;
    name: string;
    summary: string;
    swatch: string;
    heroImage: string;
  }) => Promise<void>;
}) {
  const models = catalog.lines.flatMap((line) => line.models.map((model) => ({ ...model, lineName: line.name })));
  const [modelId, setModelId] = useState(models[0]?.id ?? "");
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [swatch, setSwatch] = useState("#161513");
  const [heroImage, setHeroImage] = useState("");
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        await onSave({ modelId, name, summary, swatch, heroImage });
        setName("");
        setSummary("");
        setHeroImage("");
      }}
    >
      <Field label="Thuộc mẫu">
        <select className={inputClass} value={modelId} onChange={(event) => setModelId(event.target.value)} required>
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.lineName} · {model.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Tên phiên bản">
        <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required />
      </Field>
      <Field label="Tóm tắt cho sales">
        <textarea className={inputClass} rows={3} value={summary} onChange={(event) => setSummary(event.target.value)} />
      </Field>
      <Field label="Màu nhận diện">
        <input className="h-11 w-20" type="color" value={swatch} onChange={(event) => setSwatch(event.target.value)} />
      </Field>
      <ImageField label="Ảnh phiên bản" value={heroImage} onChange={setHeroImage} />
      <Save />
    </form>
  );
}

function TimelineEditor({
  catalog,
  library,
  advanced,
  onDone,
}: {
  catalog: Catalog;
  library: Library;
  advanced: boolean;
  onDone: (text: string) => Promise<void>;
}) {
  const versions = catalog.lines.flatMap((line) =>
    line.models.flatMap((model) =>
      model.versions.map((version) => ({
        ...version,
        path: `${line.name} · ${model.name} · ${version.name}`,
      })),
    ),
  );
  const [versionId, setVersionId] = useState(versions[0]?.id ?? "");
  const version = versions.find((item) => item.id === versionId);
  const [label, setLabel] = useState("");
  const [happenedOn, setHappenedOn] = useState("2026-01-01");
  const [note, setNote] = useState("");

  if (versions.length === 0) return <p className="text-sm text-muted">Tạo phiên bản trước.</p>;

  return (
    <div>
      <Field label="Chọn phiên bản">
        <select className={inputClass} value={versionId} onChange={(event) => setVersionId(event.target.value)}>
          {versions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.path}
            </option>
          ))}
        </select>
      </Field>
      <form
        className="mt-4 border-t border-line pt-4"
        onSubmit={async (event) => {
          event.preventDefault();
          await saveMilestone({ data: keyed({ versionId, label, happenedOn, note }) });
          setLabel("");
          setNote("");
          await onDone("Đã thêm mốc thời gian.");
        }}
      >
        <p className="text-sm font-medium">Thêm mốc</p>
        <Field label="Tên mốc">
          <input className={inputClass} value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Đợt 4 · 2026" required />
        </Field>
        <Field label="Ngày">
          <input className={inputClass} type="date" value={happenedOn} onChange={(event) => setHappenedOn(event.target.value)} required />
        </Field>
        {advanced && (
          <Field label="Ghi chú đợt hàng">
            <input className={inputClass} value={note} onChange={(event) => setNote(event.target.value)} />
          </Field>
        )}
        <Save label="Thêm mốc" />
      </form>

      <ul className="mt-6 space-y-6">
        {(version?.milestones ?? []).map((milestone) => (
          <li key={milestone.id} className="rounded-2xl border border-line p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{milestone.label}</p>
                <p className="text-sm text-muted">{milestone.happenedOn}</p>
              </div>
              <Trash
                onClick={async () => {
                  await removeRow({ data: keyed({ table: "milestones" as const, id: milestone.id }) });
                  await onDone("Đã xóa mốc.");
                }}
              />
            </div>
            <EditionAdder
              milestoneId={milestone.id}
              advanced={advanced}
              onDone={onDone}
            />
            <ul className="mt-4 space-y-4">
              {milestone.editions.map((edition) => (
                <li key={edition.id} className="rounded-xl bg-bone p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{edition.name}</p>
                    <Trash
                      onClick={async () => {
                        await removeRow({ data: keyed({ table: "editions" as const, id: edition.id }) });
                        await onDone("Đã xóa phiên bản chi tiết.");
                      }}
                    />
                  </div>
                  <SpecAssign edition={edition} library={library} onDone={onDone} />
                  <OptionAssign edition={edition} library={library} onDone={onDone} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EditionAdder({
  milestoneId,
  onDone,
}: {
  milestoneId: string;
  advanced: boolean;
  onDone: (text: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  return (
    <form
      className="mt-3"
      onSubmit={async (event) => {
        event.preventDefault();
        await saveEdition({ data: keyed({ milestoneId, name, image }) });
        setName("");
        setImage("");
        await onDone("Đã thêm phiên bản chi tiết trên mốc.");
      }}
    >
      <Field label="Phiên bản chi tiết trên mốc này">
        <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} placeholder="Triple Black Comfort" required />
      </Field>
      <ImageField label="Ảnh thumbnail" value={image} onChange={setImage} />
      <Save label="Thêm bản" />
    </form>
  );
}

function FieldLibrary({ library, onDone }: { library: Library; onDone: (text: string) => Promise<void> }) {
  const [groupName, setGroupName] = useState("");
  const [name, setName] = useState("");
  return (
    <div>
      <p className="text-sm text-muted">Tạo tên thông số một lần, rồi thêm các giá trị để sổ ra. Ví dụ: Kiểu động cơ gồm Boxer, In-Line 4, In-Line 2, Single.</p>
      <form
        className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={async (event) => {
          event.preventDefault();
          await saveSpecField({ data: keyed({ groupName, name }) });
          setName("");
          await onDone("Đã thêm thông số vào danh mục.");
        }}
      >
        <input className={inputClass} value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="Nhóm, ví dụ Động cơ" />
        <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên thông số" required />
        <button type="submit" className="rounded-xl bg-ink px-4 py-3 text-sm text-bone">
          Thêm
        </button>
      </form>
      <ul className="mt-4 space-y-4">
        {library.fields.map((field) => (
          <ChoiceEditor key={field.id} field={field} onDone={onDone} />
        ))}
      </ul>
    </div>
  );
}

function ChoiceEditor({
  field,
  onDone,
}: {
  field: Library["fields"][number];
  onDone: (text: string) => Promise<void>;
}) {
  const [label, setLabel] = useState("");
  return (
    <li className="rounded-2xl border border-line p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">
          {field.groupName ? `${field.groupName} · ` : ""}
          {field.name}
        </p>
        <Trash
          onClick={async () => {
            await removeRow({ data: keyed({ table: "spec_fields" as const, id: field.id }) });
            await onDone("Đã xóa thông số khỏi danh mục.");
          }}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {field.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className="rounded-full border border-line bg-bone px-3 py-1 text-sm"
            onClick={async () => {
              await removeRow({ data: keyed({ table: "spec_choices" as const, id: choice.id }) });
              await onDone("Đã xóa giá trị.");
            }}
          >
            {choice.label} ×
          </button>
        ))}
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await saveSpecChoice({ data: keyed({ fieldId: field.id, label }) });
            setLabel("");
            await onDone("Đã thêm giá trị sổ ra.");
          } catch {
            await onDone("Giá trị này đã có.");
          }
        }}
      >
        <input className={inputClass} value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Thêm giá trị" required />
        <button type="submit" className="shrink-0 rounded-xl border border-line px-3 text-sm">
          Thêm giá trị
        </button>
      </form>
    </li>
  );
}

function OptionLibrary({ library, onDone }: { library: Library; onDone: (text: string) => Promise<void> }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  return (
    <div>
      <p className="text-sm text-muted">Mỗi option có mã, tên và mô tả. Tạo một lần, sau đó tìm theo mã hoặc tên để gắn vào xe.</p>
      <form
        className="mt-3 grid gap-2"
        onSubmit={async (event) => {
          event.preventDefault();
          try {
            await saveCatalogOption({ data: keyed({ code, name, description }) });
            setCode("");
            setName("");
            setDescription("");
            await onDone("Đã thêm option vào danh mục.");
          } catch {
            await onDone("Mã option này đã có.");
          }
        }}
      >
        <div className="grid gap-2 sm:grid-cols-[8rem_1fr]">
          <input className={inputClass} value={code} onChange={(event) => setCode(event.target.value)} placeholder="Mã" required />
          <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên option" required />
        </div>
        <input className={inputClass} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Mô tả chức năng" />
        <button type="submit" className="rounded-xl bg-ink px-4 py-3 text-sm text-bone">
          Thêm vào danh mục
        </button>
      </form>
      <ul className="mt-4 space-y-2 text-sm">
        {library.options.map((option) => (
          <li key={option.id} className="flex items-start justify-between gap-3">
            <span>
              <span className="font-medium">{option.code}</span> · {option.name}
              <span className="block text-muted">{option.description}</span>
            </span>
            <Trash
              onClick={async () => {
                await removeRow({ data: keyed({ table: "option_catalog" as const, id: option.id }) });
                await onDone("Đã xóa option khỏi danh mục.");
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function SpecAssign({
  edition,
  library,
  onDone,
}: {
  edition: { id: string; specs: { id: string; groupName: string; specName: string; specValue: string }[] };
  library: Library;
  onDone: (text: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [fieldId, setFieldId] = useState("");
  const [choiceId, setChoiceId] = useState("");
  const needle = query.trim().toLowerCase();
  const matches = library.fields
    .filter((field) => {
      const haystack = `${field.groupName} ${field.name} ${field.choices.map((choice) => choice.label).join(" ")}`.toLowerCase();
      return needle === "" || haystack.includes(needle);
    })
    .slice(0, 6);
  const field = library.fields.find((item) => item.id === fieldId) ?? matches[0];

  async function attach(nextFieldId: string, nextChoiceId: string) {
    await assignSpec({ data: keyed({ editionId: edition.id, fieldId: nextFieldId, choiceId: nextChoiceId }) });
    await onDone("Đã gắn thông số vào xe.");
  }

  return (
    <div className="mt-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Thông số trên xe</p>
      <ul className="mt-2 space-y-1 text-sm">
        {edition.specs.map((spec) => (
          <li key={spec.id} className="flex items-center justify-between gap-2">
            <span>
              {spec.groupName ? `${spec.groupName} · ` : ""}
              {spec.specName}: {spec.specValue}
            </span>
            <Trash
              onClick={async () => {
                await removeRow({ data: keyed({ table: "edition_specs" as const, id: spec.id }) });
                await onDone("Đã bỏ thông số khỏi xe.");
              }}
            />
          </li>
        ))}
      </ul>
      <input
        className={`${inputClass} mt-3`}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Tìm thông số"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {matches.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setFieldId(item.id);
              setChoiceId(item.choices[0]?.id ?? "");
            }}
            className={`rounded-full border px-3 py-1 text-sm ${field?.id === item.id ? "border-ink bg-ink text-bone" : "border-line"}`}
          >
            {item.name}
          </button>
        ))}
      </div>
      {field && (
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
          <select
            className={inputClass}
            value={choiceId || field.choices[0]?.id || ""}
            onChange={(event) => {
              setFieldId(field.id);
              setChoiceId(event.target.value);
            }}
          >
            {field.choices.map((choice) => (
              <option key={choice.id} value={choice.id}>
                {choice.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded-xl bg-ink px-4 py-3 text-sm text-bone"
            onClick={() => {
              const picked = choiceId || field.choices[0]?.id;
              if (picked) void attach(field.id, picked);
            }}
          >
            Gắn vào xe
          </button>
        </div>
      )}
      {field && (
        <div
          className="mt-3 rounded-xl border border-dashed border-line p-3"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            const raw = event.dataTransfer.getData("text/plain");
            const [droppedField, droppedChoice] = raw.split("|");
            if (droppedField && droppedChoice) void attach(droppedField, droppedChoice);
          }}
        >
          <p className="text-xs text-muted">Hoặc kéo một giá trị vào đây</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {field.choices.map((choice) => (
              <span
                key={choice.id}
                draggable
                onDragStart={(event) => event.dataTransfer.setData("text/plain", `${field.id}|${choice.id}`)}
                className="cursor-grab rounded-full bg-paper px-3 py-1 text-sm"
              >
                {choice.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OptionAssign({
  edition,
  library,
  onDone,
}: {
  edition: { id: string; options: { id: string; code: string; name: string }[] };
  library: Library;
  onDone: (text: string) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matches = library.options
    .filter((option) => needle === "" || `${option.code} ${option.name}`.toLowerCase().includes(needle))
    .slice(0, 6);

  async function attach(optionId: string) {
    await assignOption({ data: keyed({ editionId: edition.id, optionId }) });
    await onDone("Đã gắn option vào xe.");
  }

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Option trên xe</p>
      <ul
        className="mt-2 min-h-12 space-y-1 rounded-xl border border-dashed border-line p-2 text-sm"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const optionId = event.dataTransfer.getData("text/plain");
          if (optionId.startsWith("oc-") || library.options.some((option) => option.id === optionId)) {
            void attach(optionId);
          }
        }}
      >
        {edition.options.length === 0 && <li className="text-muted">Kéo option vào đây, hoặc bấm Chọn.</li>}
        {edition.options.map((option) => (
          <li key={option.id} className="flex items-center justify-between gap-2">
            <span>
              {option.code} · {option.name}
            </span>
            <Trash
              onClick={async () => {
                await removeRow({ data: keyed({ table: "edition_options" as const, id: option.id }) });
                await onDone("Đã bỏ option khỏi xe.");
              }}
            />
          </li>
        ))}
      </ul>
      <input
        className={`${inputClass} mt-3`}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Tìm theo mã hoặc tên"
      />
      <ul className="mt-2 space-y-1 text-sm">
        {matches.map((option) => (
          <li key={option.id} className="flex items-center justify-between gap-2 rounded-xl bg-paper px-3 py-2">
            <span
              draggable
              onDragStart={(event) => event.dataTransfer.setData("text/plain", option.id)}
              className="cursor-grab"
            >
              <span className="font-medium">{option.code}</span> · {option.name}
            </span>
            <button type="button" className="text-sm text-accent" onClick={() => void attach(option.id)}>
              Chọn
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <input
        className={inputClass}
        value={value.startsWith("data:") ? "" : value}
        placeholder="Dán link ảnh, hoặc chọn file bên dưới"
        onChange={(event) => onChange(event.target.value)}
      />
      <input
        className="mt-2 block text-sm"
        type="file"
        accept="image/*"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          onChange(await shrinkImage(file));
        }}
      />
      {value ? <img src={value} alt="" className="mt-3 h-24 w-36 rounded-xl object-cover" /> : null}
    </Field>
  );
}

function Save({ label = "Lưu" }: { label?: string }) {
  return (
    <button type="submit" className="mt-4 rounded-full bg-ink px-5 py-3 text-sm text-bone">
      {label}
    </button>
  );
}

function Trash({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="text-sm text-danger" onClick={onClick}>
      Xóa
    </button>
  );
}

async function shrinkLogo(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 64 / bitmap.height, 280 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) return "";
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

async function shrinkImage(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 960 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) return "";
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.72);
}
