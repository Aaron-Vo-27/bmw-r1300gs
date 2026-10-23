import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteSettingsProvider, themeVars } from "@/components/site-settings";
import { defaultSettings, getSettings } from "@/lib/settings.functions";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  loader: () => getSettings(),
  head: ({ loaderData }) => {
    const settings = loaderData ?? defaultSettings;
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: settings.brand },
        { name: "description", content: settings.description },
        { name: "theme-color", content: settings.theme.bone },
      ],
      links: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "stylesheet", href: appCss },
        { rel: "manifest", href: "/__grok/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,520;9..144,640&family=Manrope:wght@400;500;600;700&display=swap",
        },
      ],
    };
  },
  component: Root,
});

function Root() {
  const settings = Route.useLoaderData();
  return (
    <html lang="vi" data-radius={settings.theme.radius} style={themeVars(settings)} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <SiteSettingsProvider value={settings}>
            <Outlet />
          </SiteSettingsProvider>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
