import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PwaInstallPrompt } from "@/features/pwa/components/pwa-install-prompt";
import { StructuredData } from "@/features/seo/components/structured-data";
import { absoluteUrl, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";

import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_TITLE,
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "경기동부상공회의소 회원사를 기업명, 지역, 업종, 주요 품목으로 검색하고 기업별 상세 정보를 확인할 수 있는 회원사 검색 서비스입니다.",
  openGraph: {
    title: SITE_TITLE,
    description:
      "남양주·구리·가평 지역 기업과 경기동부상공회의소 회원사의 업종, 주소, 연락처, 주요 품목 정보를 검색할 수 있습니다.",
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    images: [{ url: "/logo.png", alt: `${SITE_NAME} 로고` }],
  },
  twitter: { card: "summary_large_image" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "회원사 검색",
  },
  manifest: "/favicon/manifest.json",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico" },
      {
        url: "/favicon/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        url: "/favicon/android-icon-36x36.png",
        sizes: "36x36",
        type: "image/png",
      },
      {
        url: "/favicon/android-icon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        url: "/favicon/android-icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        url: "/favicon/android-icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        url: "/favicon/android-icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        url: "/favicon/android-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      { url: "/favicon/apple-icon.png" },
      {
        url: "/favicon/apple-icon-57x57.png",
        sizes: "57x57",
        type: "image/png",
      },
      {
        url: "/favicon/apple-icon-60x60.png",
        sizes: "60x60",
        type: "image/png",
      },
      {
        url: "/favicon/apple-icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        url: "/favicon/apple-icon-76x76.png",
        sizes: "76x76",
        type: "image/png",
      },
      {
        url: "/favicon/apple-icon-114x114.png",
        sizes: "114x114",
        type: "image/png",
      },
      {
        url: "/favicon/apple-icon-120x120.png",
        sizes: "120x120",
        type: "image/png",
      },
      {
        url: "/favicon/apple-icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        url: "/favicon/apple-icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        url: "/favicon/apple-icon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        url: "/favicon/apple-icon-precomposed.png",
        rel: "apple-touch-icon-precomposed",
      },
    ],
    other: [
      {
        url: "/favicon/ms-icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        url: "/favicon/ms-icon-150x150.png",
        sizes: "150x150",
        type: "image/png",
      },
      {
        url: "/favicon/ms-icon-310x310.png",
        sizes: "310x310",
        type: "image/png",
      },
      {
        url: "/favicon/ms-icon-70x70.png",
        sizes: "70x70",
        type: "image/png",
      },
    ],
  },
  other: {
    "msapplication-config": "/favicon/browserconfig.xml",
    "msapplication-TileColor": "#ffffff",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#007fff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-50 text-slate-950">
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                name: SITE_NAME,
                url: absoluteUrl("/companies"),
                logo: absoluteUrl("/logo.png"),
              },
              {
                "@type": "WebSite",
                name: SITE_TITLE,
                url: absoluteUrl("/companies"),
                inLanguage: "ko-KR",
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${SITE_URL}/companies?q={search_term_string}`,
                  "query-input": "required name=search_term_string",
                },
              },
            ],
          }}
        />
        {children}
        <PwaInstallPrompt />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
