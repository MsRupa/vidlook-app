const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  experimental: {
    // Remove if not using Server Components
    serverComponentsExternalPackages: ['mongodb'],
  },
  webpack(config, { dev }) {
    if (dev) {
      // Reduce CPU/memory from file watching
      config.watchOptions = {
        poll: 2000, // check every 2 seconds
        aggregateTimeout: 300, // wait before rebuilding
        ignored: ['**/node_modules'],
      };
    }
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 10000,
    pagesBufferLength: 2,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          { 
            key: "Content-Security-Policy", 
            value: "frame-ancestors *; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.youtube.com https://www.youtube.com https://*.effectivegatecpm.com https://*.adsterra.com https://*.highperformanceformat.com https://www.googletagmanager.com https://www.google-analytics.com https://oculus-sdk.humanlabs.world blob:; connect-src 'self' https://*.youtube.com https://*.effectivegatecpm.com https://*.adsterra.com https://*.supabase.co https://*.upstash.io https://www.googleapis.com https://www.google-analytics.com https://analytics.google.com https://*.humanlabs.world *; img-src 'self' data: https: blob:; frame-src 'self' https://*.youtube.com https://*.youtube-nocookie.com https://*.effectivegatecpm.com https://*.adsterra.com *;" 
          },
          { 
            key: "Permissions-Policy", 
            value: "fullscreen=*, accelerometer=*, autoplay=*, encrypted-media=*, gyroscope=*, picture-in-picture=*" 
          },
          { key: "Access-Control-Allow-Origin", value: process.env.CORS_ORIGINS || "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "*" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
