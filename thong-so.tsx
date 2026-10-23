import { createFileRoute } from "@tanstack/react-router";
import { Banner, MidBanner } from "@/components/banner";
import { ProductTile } from "@/components/product-tile";
import { Shell } from "@/components/shell";
import { useSiteSettings } from "@/components/site-settings";
import { getCatalog } from "@/lib/catalog.functions";

export const Route = createFileRoute("/thong-so")({
  loader: () => getCatalog(),
  component: SpecsHome,
});

function SpecsHome() {
  const { lines } = Route.useLoaderData();
  const page = useSiteSettings().pages.specs;
  const first = lines.slice(0, 3);
  const rest = lines.slice(3);
  return (
    <Shell>
      <Banner tall to="/cong-nghe" image={page.heroImage} eyebrow={page.eyebrow} title={page.title} text={page.text} />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-14">
        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">{page.heading}</h1>
        <p data-reveal style={{ transitionDelay: "90ms" }} className="mt-3 max-w-xl text-muted">{page.intro}</p>
        <h2 className="mt-14 text-sm font-semibold uppercase tracking-[0.18em] text-muted">Dòng xe</h2>
        <ul className="tile-grid mt-5">
          {first.map((line, index) => (
            <ProductTile
              key={line.id}
              to="/dong/$slug"
              slug={line.slug}
              image={line.models.find((model) => model.heroImage)?.heroImage ?? ""}
              title={line.name}
              text={line.blurb}
              meta={`${line.models.length} mẫu xe`}
              delay={`${index * 50}ms`}
            />
          ))}
        </ul>
        <MidBanner
          to="/blog"
          image={page.midImage}
          eyebrow={page.midEyebrow}
          title={page.midTitle}
          text={page.midText}
        />
        {rest.length > 0 && (
          <ul className="tile-grid">
            {rest.map((line, index) => (
              <ProductTile
                key={line.id}
                to="/dong/$slug"
                slug={line.slug}
                image={line.models.find((model) => model.heroImage)?.heroImage ?? ""}
                title={line.name}
                text={line.blurb}
                meta={`${line.models.length} mẫu xe`}
                delay={`${(index + first.length) * 50}ms`}
              />
            ))}
          </ul>
        )}
      </main>
    </Shell>
  );
}
