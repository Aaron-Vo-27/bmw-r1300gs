import { createFileRoute, notFound } from "@tanstack/react-router";
import { Crumbs, Shell } from "@/components/shell";
import { getPosts } from "@/lib/catalog.functions";

const section = {
  news: { label: "Tin tức", to: "/" as const },
  tech: { label: "Công nghệ", to: "/cong-nghe" as const },
  blog: { label: "Blog", to: "/blog" as const },
};

export const Route = createFileRoute("/bai/$slug")({
  loader: async ({ params }) => {
    const posts = await getPosts({ data: {} });
    const post = posts.find((item) => item.slug === params.slug);
    if (!post) throw notFound();
    return { post };
  },
  component: ArticlePage,
  notFoundComponent: () => (
    <Shell>
      <main className="mx-auto max-w-3xl px-5 py-24">Không thấy bài viết.</main>
    </Shell>
  ),
});

function ArticlePage() {
  const { post } = Route.useLoaderData();
  const parent = section[post.kind];
  return (
    <Shell>
      <article className="mx-auto max-w-3xl px-5 pb-24 pt-10">
        <Crumbs items={[{ label: parent.label, to: parent.to }, { label: post.title }]} />
        <p className="text-sm font-medium text-accent">{post.author}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag.id} className="rounded-full border border-line px-3 py-1 text-xs">
              {tag.name}
            </span>
          ))}
        </div>
        <h1 data-reveal className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{post.title}</h1>
        <p data-reveal style={{ transitionDelay: "80ms" }} className="mt-4 text-lg text-muted">{post.excerpt}</p>
        {post.cover ? (
          <div data-billboard className="mt-8 overflow-hidden rounded-3xl">
            <img src={post.cover} alt="" className="billboard-photo aspect-[16/9] w-full object-cover" />
          </div>
        ) : null}
        <div className="mt-8 space-y-4 text-lg leading-relaxed">
          {post.body.split("\n").filter(Boolean).map((paragraph) => (
            <p key={paragraph.slice(0, 24)}>{paragraph}</p>
          ))}
        </div>
      </article>
    </Shell>
  );
}
