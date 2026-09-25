import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Batasi root ke folder project ini supaya lockfile di luar tidak ikut terbaca
  turbopack: { root: __dirname },
  // src/lib/storage.ts writes uploads under /public in local dev, which makes
  // the bundler trace all 45k files in /public into the serverless functions.
  // Those files are served as static assets by the platform, never from a
  // function, so exclude them from function file-tracing to keep bundles small.
  outputFileTracingExcludes: {
    "*": ["public/**"],
  },
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
