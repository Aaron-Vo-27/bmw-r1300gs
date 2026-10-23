import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductTile } from "@/components/product-tile";
import { Crumbs, Shell } from "@/components/shell";
import { getCatalog } from "@/lib/catalog.functions";

export const Route = createFileRoute("/mau/$slug")({
  loader: async ({ params }) => {
    const catalog = await getCatalog();
    for (const line of catalog.lines) {
      const model = line.models.find((item) => item.slug === params.slug);
      if (model) return { line, model };
    }
    throw notFound();
  },
  component: ModelPage,
  notFoundComponent: () => (
    <Shell>
      <main className="mx-auto max-w-6xl px-5 py-24">Không thấy mẫu xe này.</main>
    </Shell>
  ),
});

function ModelPage() {
  const { line, model } = Route.useLoaderData();
  return (
    <Shell>
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-10">
        <Crumbs
          items={[
            { label: "Thông số", to: "/thong-so" },
            { label: line.name, href: `/dong/${line.slug}` },
            { label: model.name },
          ]}
        />
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">{line.name}</p>
        <h1 className="font-display mt-3 text-5xl tracking-tight sm:text-6xl">{model.name}</h1>
        <p className="mt-4 max-w-xl text-lg text-muted">{model.tagline}</p>
        <h2 className="mt-14 text-sm font-semibold uppercase tracking-[0.18em] text-muted">Phiên bản</h2>
        <ul className="tile-grid mt-6">
          {model.versions.map((version, index) => (
            <ProductTile
              key={version.id}
              to="/phien-ban/$slug"
              slug={version.slug}
              image={version.heroImage}
              title={version.name}
              meta={`${version.milestones.length} mốc thời gian`}
              swatch={version.swatch}
              delay={`${index * 50}ms`}
            />
          ))}
        </ul>
        {model.versions.length === 0 && (
          <p className="mt-8 text-muted">Chưa có phiên bản. Thêm trong mục Nhập liệu.</p>
        )}
      </main>
    </Shell>
  );
}
