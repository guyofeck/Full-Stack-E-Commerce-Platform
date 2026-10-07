import type { NextConfig } from "next";

// Optional dev proxy: when API_PROXY_TARGET is set (e.g. http://server:5000),
// /api/v1/* is forwarded to the API so the browser stays on a single origin.
const apiProxyTarget = process.env.API_PROXY_TARGET;

const nextConfig: NextConfig = {
  ...(process.env.BASE44_PREVIEW_MODE === "1" && process.env.BASE44_PUBLIC_HOST_SUFFIX && {
    allowedDevOrigins: ["3000-" + process.env.BASE44_PUBLIC_HOST_SUFFIX],
  }),
  ...(apiProxyTarget && {
    async rewrites() {
      return [
        { source: "/api/v1/:path*", destination: `${apiProxyTarget}/api/v1/:path*` },
      ];
    },
  }),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "m.media-amazon.com",
      "www.bestbuy.com",
      "www.dyson.com",
      "store.hp.com",
      "i1.adis.ws",
      "i5.walmartimages.com",
      "lh3.googleusercontent.com",
      "res.cloudinary.com",
      "pbs.twimg.com",
      "store.storeimages.cdn-apple.com",
    ],
  },
};

export default nextConfig;
