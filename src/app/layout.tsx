import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Newsreader, Noto_Sans_Armenian, Noto_Serif_Armenian } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Providers } from "@/ui/Providers";
import "./globals.css";

// Latin faces carry the personality; the Armenian faces are metric-friendly fallbacks used per glyph, so the
// same stack renders both languages correctly.
const newsreader = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-newsreader", display: "swap" });
const instrument = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });
// Referenced by family name in globals.css (`:lang(hy)`), so only their @font-face rules are needed here.
const notoSerifArmenian = Noto_Serif_Armenian({ subsets: ["armenian"], variable: "--font-noto-serif-armenian", display: "swap" });
const notoSansArmenian = Noto_Sans_Armenian({ subsets: ["armenian"], variable: "--font-noto-sans-armenian", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: { default: t("appName"), template: `%s · ${t("appName")}` },
    description: t("description"),
    // A private notebook: keep it out of search indexes.
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef0eb" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1a20" },
  ],
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const fonts = [newsreader, instrument, notoSerifArmenian, notoSansArmenian].map((f) => f.variable).join(" ");

  return (
    <html lang={locale} className={fonts}>
      <body>
        <NextIntlClientProvider locale={locale}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
