import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { Crumbs, Shell } from "@/components/shell";
import { getCatalog, type Edition } from "@/lib/catalog.functions";

export const Route = createFileRoute("/phien-ban/$slug")({
  loader: async ({ params }) => {
    const catalog = await getCatalog();
    for (const line of catalog.lines) {
      for (const model of line.models) {
        const version = model.versions.find((item) => item.slug === params.slug);
        if (version) return { line, model, version };
      }
    }
    throw notFound();
  },
  component: VersionPage,
  notFoundComponent: () => (
    <Shell>
      <main className="mx-auto max-w-6xl px-5 py-24">Không thấy phiên bản này.</main>
    </Shell>
  ),
});

function VersionPage() {
  const { line, model, version } = Route.useLoaderData();
  const [openId, setOpenId] = useState<string | null>(version.milestones.at(-1)?.id ?? null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  return (
    <Shell>
      <main className="mx-auto max-w-6xl px-5 pb-28 pt-10">
        <Crumbs
          items={[
            { label: "Thông số", to: "/thong-so" },
            { label: line.name, href: `/dong/${line.slug}` },
            { label: model.name, href: `/mau/${model.slug}` },
            { label: version.name },
          ]}
        />
        <div className="grid items-end gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
              {line.name} · {model.name}
            </p>
            <h1 className="font-display mt-3 text-5xl tracking-tight sm:text-6xl">{version.name}</h1>
            <p className="mt-4 max-w-lg text-lg text-muted">{version.summary}</p>
          </div>
          {version.heroImage ? (
            <div data-billboard className="overflow-hidden rounded-3xl">
              <img src={version.heroImage} alt="" className="billboard-photo aspect-[16/10] w-full object-cover" />
            </div>
          ) : null}
        </div>

        <section className="mt-16">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">Timeline đợt nhập</h2>
          <p className="mt-2 max-w-xl text-muted">
            Đưa chuột lên một mốc để xem ảnh các bản thuộc đợt đó. Bấm vào mốc để mở thông số và danh sách option.
          </p>

          {version.milestones.length === 0 ? (
            <p className="mt-10 text-muted">Chưa có mốc thời gian.</p>
          ) : (
            <ol className="relative mt-10 space-y-4 border-l border-line pl-8">
              {version.milestones.map((milestone) => {
                const open = openId === milestone.id;
                const hover = hoverId === milestone.id;
                return (
                  <li key={milestone.id} className="relative">
                    <span className="absolute -left-[39px] top-6 h-3 w-3 rounded-full border-2 border-paper bg-accent" />
                    <button
                      type="button"
                      className="glass w-full rounded-3xl px-5 py-5 text-left transition duration-500 hover:-translate-y-0.5"
                      onMouseEnter={() => setHoverId(milestone.id)}
                      onMouseLeave={() => setHoverId(null)}
                      onFocus={() => setHoverId(milestone.id)}
                      onBlur={() => setHoverId(null)}
                      onClick={() => setOpenId(open ? null : milestone.id)}
                      aria-expanded={open}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <span className="font-display text-2xl tracking-tight">{milestone.label}</span>
                        <time className="text-sm text-muted" dateTime={milestone.happenedOn}>
                          {formatDate(milestone.happenedOn)}
                        </time>
                      </div>
                      {milestone.note ? <p className="mt-2 text-sm text-muted">{milestone.note}</p> : null}
                      <p className="mt-3 text-sm text-accent">
                        {milestone.editions.length} phiên bản chi tiết
                        {open ? " · đang mở" : " · bấm để mở"}
                      </p>
                    </button>

                    {(hover || open) && milestone.editions.length > 0 && (
                      <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
                        {milestone.editions.map((edition) => (
                          <figure
                            key={edition.id}
                            className="w-40 shrink-0 overflow-hidden rounded-2xl border border-line bg-bone"
                          >
                            {edition.image ? (
                              <img src={edition.image} alt="" className="aspect-[4/3] w-full object-cover" />
                            ) : (
                              <div className="aspect-[4/3] bg-line" />
                            )}
                            <figcaption className="px-3 py-2 text-xs font-medium">{edition.name}</figcaption>
                          </figure>
                        ))}
                      </div>
                    )}

                    {open && (
                      <div className="mt-3 space-y-6">
                        {milestone.editions.map((edition) => (
                          <EditionDetail key={edition.id} edition={edition} />
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </main>
    </Shell>
  );
}

function EditionDetail({ edition }: { edition: Edition }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-paper">
      <div className="grid md:grid-cols-[280px_1fr]">
        {edition.image ? (
          <img src={edition.image} alt="" className="h-full min-h-48 w-full object-cover" />
        ) : (
          <div className="min-h-48 bg-line" />
        )}
        <div className="p-6">
          <h3 className="font-display text-3xl tracking-tight">{edition.name}</h3>
          <h4 className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Thông số kỹ thuật</h4>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {edition.specs.map((spec) => (
                <tr key={spec.id} className="border-b border-line">
                  <td className="w-28 py-3 pr-3 text-muted">{spec.groupName}</td>
                  <td className="py-3 pr-3">{spec.specName}</td>
                  <td className="py-3 font-medium">{spec.specValue}</td>
                </tr>
              ))}
              {edition.specs.length === 0 && (
                <tr>
                  <td className="py-3 text-muted">Chưa có thông số.</td>
                </tr>
              )}
            </tbody>
          </table>
          <h4 className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Option trên xe</h4>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="w-24 py-2 font-medium">Mã</th>
                <th className="w-1/3 py-2 font-medium">Tên option</th>
                <th className="py-2 font-medium">Mô tả chức năng</th>
              </tr>
            </thead>
            <tbody>
              {edition.options.map((option) => (
                <tr key={option.id} className="border-b border-line">
                  <td className="py-3 pr-4 font-medium">{option.code}</td>
                  <td className="py-3 pr-4 font-medium">{option.name}</td>
                  <td className="py-3 text-muted">{option.description}</td>
                </tr>
              ))}
              {edition.options.length === 0 && (
                <tr>
                  <td className="py-3 text-muted" colSpan={3}>
                    Chưa có option.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </article>
  );
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}
