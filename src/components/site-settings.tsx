import { createContext, useContext } from "react";
import type { SiteSettings } from "@/lib/settings.functions";

const SettingsContext = createContext<SiteSettings | null>(null);

export function SiteSettingsProvider({
  value,
  children,
}: {
  value: SiteSettings;
  children: React.ReactNode;
}) {
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSiteSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error("Thiếu cài đặt giao diện.");
  return value;
}

export function themeVars(settings: SiteSettings): React.CSSProperties {
  const sans = '"Manrope", ui-sans-serif, system-ui, sans-serif';
  const serif = '"Fraunces", ui-serif, Georgia, serif';
  const font = settings.theme.font === "fraunces" ? serif : sans;
  const display = settings.theme.font === "manrope" ? sans : serif;
  return {
    "--color-bone": settings.theme.bone,
    "--color-paper": settings.theme.paper,
    "--color-ink": settings.theme.ink,
    "--color-muted": settings.theme.muted,
    "--color-line": settings.theme.line,
    "--color-accent": settings.theme.accent,
    "--font-sans": font,
    "--font-display": display,
  } as React.CSSProperties;
}
