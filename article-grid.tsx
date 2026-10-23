import { Link } from "@tanstack/react-router";
import { Cover } from "@/components/cover";
import { ProductTile } from "@/components/product-tile";
import type { Post } from "@/lib/catalog.functions";

export function ArticleGrid({
  posts,
  lead = false,
  middle,
}: {
  posts: Post[];
  lead?: boolean;
  middle?: React.ReactNode;
}) {
  if (posts.length === 0) {
    return <p className="text-muted">Chưa có bài. Thêm trong Nhập liệu.</p>;
  }
  const featured = lead ? posts[0] : undefined;
  const tiles = lead ? posts.slice(1) : posts;
  const head = middle ? tiles.slice(0, 3) : tiles;
  const tail = middle ? tiles.slice(3) : [];
  return (
    <div className="space-y-6">
      {featured ? <Featured post={featured} /> : null}
      {head.length > 0 ? <TileRow posts={head} /> : null}
      {middle}
      {tail.length > 0 ? <TileRow posts={tail} start={head.length} /> : null}
    </div>
  );
}

function TileRow({ posts, start = 0 }: { posts: Post[]; start?: number }) {
  return (
    <ul className="tile-grid">
      {posts.map((post, index) => (
        <ProductTile
          key={post.id}
          to="/bai/$slug"
          slug={post.slug}
          image={post.cover}
          title={post.title}
          text={post.excerpt}
          meta={post.author}
          delay={`${(start + index) * 50}ms`}
        />
      ))}
    </ul>
  );
}

function Featured({ post }: { post: Post }) {
  return (
    <Link
      to="/bai/$slug"
      params={{ slug: post.slug }}
      className="group rise relative block h-[520px] overflow-hidden rounded-[28px] sm:h-[640px]"
      data-billboard
    >
      <Cover src={post.cover} className="absolute inset-0" photoClassName="billboard-photo" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/15 to-transparent" />
      <div className="billboard-copy glass absolute inset-x-4 bottom-4 rounded-[1.4rem] p-5 text-ink sm:inset-x-6 sm:bottom-6 sm:p-7">
        <p className="text-sm font-medium text-muted">{post.author}</p>
        <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">{post.title}</h2>
        {post.excerpt ? <p className="mt-3 max-w-xl text-sm text-muted sm:text-base">{post.excerpt}</p> : null}
      </div>
    </Link>
  );
}
