import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeScript } from "@/components/layout/theme-script";
import { MotionProvider } from "@/components/providers/motion-provider";
import { StoreProvider } from "@/components/providers/store-provider";
import { Toaster } from "@/components/ui/sonner";
import { serverEnv } from "@/lib/env.server";
import { isIndexable, openGraphDefaults, siteConfig } from "@/lib/seo/site";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  category: "finance",
  creator: siteConfig.name,
  publisher: siteConfig.name,
  keywords: [
    "crypto prices",
    "cryptocurrency prices today",
    "bitcoin price",
    "ethereum price",
    "crypto market cap",
    "live crypto prices",
    "crypto price chart",
    "crypto watchlist",
  ],
  formatDetection: { telephone: false, address: false, email: false },
  openGraph: {
    ...openGraphDefaults,
    url: "/",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: isIndexable
    ? {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
      }
    : { index: false, follow: false },
  // Set GOOGLE_SITE_VERIFICATION / BING_SITE_VERIFICATION to verify ownership in Search Console / Bing Webmaster Tools.
  verification: {
    google: serverEnv.googleSiteVerification,
    other: serverEnv.bingSiteVerification ? { "msvalidate.01": serverEnv.bingSiteVerification } : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0c0a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-dvh flex-col">
        <NextTopLoader color="var(--primary)" height={3} showSpinner={false} shadow={false} />
        <a
          href="#main"
          className="sr-only z-50 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
        >
          Skip to content
        </a>
        <StoreProvider>
          <MotionProvider>
            <SiteHeader />
            <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
              {children}
            </main>
            <SiteFooter />
            <Toaster position="bottom-right" />
          </MotionProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
