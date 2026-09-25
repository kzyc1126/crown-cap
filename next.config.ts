import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Batasi root ke folder project ini supaya lockfile di luar tidak ikut terbaca
  turbopack: { root: __dirname },
  experimental: {
    serverActions: {
      /**
       * Photos are uploaded through server actions, so the whole request body
       * has to clear the biggest thing the app itself allows: a trade request
       * carries up to MAIL_ATTACHMENT_BUDGET (9 MB) of photos, plus the form
       * fields and multipart overhead. Next's own default is 1 MB, which would
       * reject those long before src/lib/limits.ts could explain why.
       */
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
