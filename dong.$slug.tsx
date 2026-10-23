import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductTile } from "@/components/product-tile";
import { Crumbs, Shell } from "@/components/shell";
import { getCatalog } from "@/lib/catalog.functions";

export const Route = createFileRoute("/dong/$slug")({
  loader: async ({ params }) => {
    const catalog = await getCatalog();
    const line = catalog.lines.find((item) => item.slug === params.slug);
    if (!line) throw notFound();
    return { line };
  },
  component: LinePage,
  notFoundComponent: () => (
    <Shell>
      <main className="mx-auto max-w-6xl px-5 py-24">Không thấy dòng xe này.</main>
    </Shell>
  ),
});

function LinePage() {
  const { line } = Route.useLoaderData();
  return (
    <Shell>
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-10">
        <Crumbs items={[{ label: "Thông số", to: "/thong-so" }, { label: line.name }]} />
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Dòng xe</p>
        <h1 className="font-display mt-3 text-5xl tracking-tight sm:text-6xl">{line.name}</h1>
        <p className="mt-4 max-w-xl text-lg text-muted">{line.blurb}</p>
        <ul className="tile-grid mt-10">
          {line.models.map((model, index) => (
            <ProductTile
              key={model.id}
              to="/mau/$slug"
              slug={model.slug}
              image={model.heroImage}
              title={model.name}
              text={model.tagline}
              meta={`${model.versions.length} phiên bản`}
              delay={`${index * 50}ms`}
            />
          ))}
        </ul>
        {line.models.length === 0 && (
          <p className="mt-12 text-muted">Chưa có mẫu xe. Thêm trong mục Nhập liệu.</p>
        )}
      </main>
    </Shell>
  );
}
