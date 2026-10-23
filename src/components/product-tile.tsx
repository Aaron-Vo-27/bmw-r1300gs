import { Link } from "@tanstack/react-router";
import { Cover } from "@/components/cover";

type TileRoute = "/dong/$slug" | "/mau/$slug" | "/phien-ban/$slug" | "/bai/$slug";

export function ProductTile({
  to,
  slug,
  image,
  title,
  text,
  meta,
  swatch,
  delay,
}: {
  to: TileRoute;
  slug: string;
  image: string;
  title: string;
  text?: string;
  meta?: string;
  swatch?: string;
  delay?: string;
}) {
  return (
    <li>
      <Link to={to} params={{ slug }} style={{ transitionDelay: delay }} className="tile group rise">
        <Cover src={image} className="tile-photo" />
        <div className="tile-copy">
          <div className="flex items-start justify-between gap-3">
            <h3>{title}</h3>
            {swatch ? (
              <span className="mt-1 h-4 w-4 shrink-0 rounded-full border border-white/70" style={{ background: swatch }} aria-hidden />
            ) : null}
          </div>
          {text ? <p>{text}</p> : null}
          {meta ? <p className="tile-meta">{meta}</p> : null}
        </div>
      </Link>
    </li>
  );
}
