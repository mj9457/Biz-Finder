import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // The directory is public and query parameters are part of the CDN key.
        // Keep the browser private, but let Vercel reuse rendered responses.
        source: "/companies",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
        ],
      },
      {
        // The header logo is a small immutable public asset. Its version is
        // included in the URL used by CompanyHeader, so it can be cached
        // immediately without delaying every page transition.
        source: "/logo.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Files in public/ default to max-age=0. The browser revalidated the
        // PWA manifest and Android icon after every filter navigation as a
        // result. Change the icon URL when replacing one of these files.
        source: "/favicon/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Keep the manifest refreshable without requiring it on every route
        // transition. This rule follows the broad favicon rule above.
        source: "/favicon/manifest.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
