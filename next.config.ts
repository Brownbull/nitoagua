import type { NextConfig } from "next";
import packageJson from "./package.json";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  // Turbopack configuration - Next.js 16+ default
  // Story 12.5-2: Bundle Size Optimization
  turbopack: {
    // Turbopack automatically handles tree-shaking and code splitting
    // The following optimizations are handled automatically:
    // - Dynamic imports for Leaflet (already using next/dynamic with ssr: false)
    // - Tree-shaking for lucide-react (named imports)
    // - Code splitting by route
    resolveAlias: {
      // Exclude unused zod locale files from bundle (~238KB savings)
      // zod v4 includes all 46+ locales by default
      // We only need English (default) - Spanish error messages are in our schemas
      "zod/v4/locales": { browser: "./node_modules/zod/v4/locales/en.js" },
    },
  },
  // Webpack configuration (for bundle analyzer and fallback)
  webpack: (config, { isServer }) => {
    // Reduce zod bundle by excluding unused locale files
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...config.resolve.alias,
        // Replace zod/v4/locales with just English locale
        "zod/v4/locales": require.resolve("zod/v4/locales/en.js"),
      };
    }
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);
