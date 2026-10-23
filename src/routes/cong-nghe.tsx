import { createFileRoute } from "@tanstack/react-router";
import { ArticleGrid } from "@/components/article-grid";
import { Banner, MidBanner } from "@/components/banner";
import { Shell } from "@/components/shell";
import { useSiteSettings } from "@/components/site-settings";
import { getPosts } from "@/lib/catalog.functions";

export const Route = createFileRoute("/cong-nghe")({
  loader: () => getPosts({ data: { kind: "tech" } }),
  component: TechPage,
});

function TechPage() {
  const posts = Route.useLoaderData();
  const page = useSiteSettings().pages.tech;
  return (
    <Shell>
      <Banner tall to="/thong-so" image={page.heroImage} eyebrow={page.eyebrow} title={page.title} text={page.text} />
      <main className="mx-auto max-w-6xl px-5 pb-24 pt-14">
        <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">{page.heading}</h1>
        <p data-reveal style={{ transitionDelay: "90ms" }} className="mt-3 max-w-xl text-lg text-muted">{page.intro}</p>
        <div className="mt-10">
          <ArticleGrid
            posts={posts}
            middle={
              <MidBanner
                to="/thong-so"
                image={page.midImage}
                eyebrow={page.midEyebrow}
                title={page.midTitle}
                text={page.midText}
              />
            }
          />
        </div>
      </main>
    </Shell>
  );
}
