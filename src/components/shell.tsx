import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useSiteSettings } from "@/components/site-settings";

export function Shell({ children }: { children: React.ReactNode }) {
  const settings = useSiteSettings();
  const links = [
    { to: "/", label: settings.nav.news },
    { to: "/thong-so", label: settings.nav.specs },
    { to: "/cong-nghe", label: settings.nav.tech },
    { to: "/blog", label: settings.nav.blog },
  ] as const;

  useEffect(() => {
    const stage = document.querySelector("[data-stage]");
    const header = document.querySelector("header.site-nav");
    if (!stage) return;
    const surface = stage;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" },
    );

    function arm(node: Element) {
      if (!(node instanceof HTMLElement) || node.dataset.armed) return;
      if (!node.matches("h1, .rise, [data-reveal]")) return;
      node.dataset.armed = "1";
      if (reduce) {
        node.classList.add("is-in");
        return;
      }
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) node.classList.add("is-in");
      else io.observe(node);
    }

    function scan(root: ParentNode) {
      root.querySelectorAll("h1, .rise, [data-reveal]").forEach(arm);
    }

    scan(stage);
    if (!reduce) document.documentElement.classList.add("motion");

    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          arm(node);
          scan(node);
        });
      }
    });
    mo.observe(stage, { childList: true, subtree: true });

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        header?.classList.toggle("nav-scrolled", window.scrollY > 12);
        if (reduce) return;
        surface.querySelectorAll<HTMLElement>("[data-billboard]").forEach((el) => {
          const rect = el.getBoundingClientRect();
          const drift = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)));
          el.style.setProperty("--drift", drift.toFixed(3));
        });
      });
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.documentElement.classList.remove("motion");
    };
  }, []);

  return (
    <div className="min-h-screen text-ink">
      <div className="sticky top-0 z-40 px-3 pt-3">
        <header className="site-nav mx-auto flex min-h-14 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-full px-5 py-2">
          <Link to="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            {settings.logo ? (
              <img src={settings.logo} alt="" className="h-7 w-auto max-w-36 object-contain" />
            ) : null}
            {settings.brand}
          </Link>
          <nav className="flex items-center gap-4 text-[13px] text-muted sm:gap-6">
            {links.map((link) => (
              <Link key={link.to} to={link.to} className="transition-colors duration-300 hover:text-ink" activeProps={{ className: "text-ink" }}>
                {link.label}
              </Link>
            ))}
          </nav>
        </header>
      </div>
      <div data-stage>{children}</div>
      <footer className="px-3 pb-6">
        <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-4 text-sm text-muted">
          <p>{settings.footer}</p>
          <Link to="/nhap-lieu" className="hover:text-ink">
            Quản trị
          </Link>
        </div>
      </footer>
    </div>
  );
}

export function Crumbs({
  items,
}: {
  items: { label: string; to?: "/" | "/thong-so" | "/cong-nghe" | "/blog" | "/nhap-lieu"; href?: string }[];
}) {
  return (
    <p className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted">
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center gap-2">
          {index > 0 && <span aria-hidden>/</span>}
          {item.to ? (
            <Link to={item.to} className="hover:text-ink">
              {item.label}
            </Link>
          ) : item.href ? (
            <a href={item.href} className="hover:text-ink">
              {item.label}
            </a>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </p>
  );
}
