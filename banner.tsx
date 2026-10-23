import { Link } from "@tanstack/react-router";

type BannerProps = {
  eyebrow: string;
  title: string;
  text: string;
  to: "/" | "/thong-so" | "/cong-nghe" | "/blog";
  image: string;
  tall?: boolean;
};

export function Banner({ eyebrow, title, text, to, image, tall = false }: BannerProps) {
  return (
    <Link
      to={to}
      data-billboard
      className={`group relative block w-full overflow-hidden ${tall ? "h-[78vh] min-h-[520px]" : "h-[340px] sm:h-[420px]"}`}
    >
      <img src={image} alt="" className="billboard-photo absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-ink/10" />
      <div className="billboard-copy relative flex h-full max-w-6xl flex-col justify-end px-5 pb-12 sm:px-8 sm:pb-16">
        <p className="glass w-fit rounded-full px-3 py-1 text-xs font-medium tracking-[0.14em] text-ink uppercase">{eyebrow}</p>
        <h2 className={`mt-3 max-w-3xl font-semibold tracking-tight text-bone ${tall ? "text-5xl sm:text-7xl" : "text-4xl sm:text-6xl"}`}>
          {title}
        </h2>
        <p className="mt-4 max-w-md text-base text-bone/85 sm:text-lg">{text}</p>
      </div>
    </Link>
  );
}

export function MidBanner(props: BannerProps) {
  return (
    <div className="relative left-1/2 my-4 w-screen -translate-x-1/2">
      <Banner {...props} />
    </div>
  );
}
