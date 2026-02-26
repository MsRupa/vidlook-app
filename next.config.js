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
            value: "frame-ancestors *; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.youtube.com https://www.youtube.com https://www.googletagmanager.com https://www.google-analytics.com https://oculus-sdk.humanlabs.world https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.googleadservices.com https://adservice.google.com https://www.googleadservices.com https://tpc.googlesyndication.com https://*.effectivegatecpm.com https://www.highperformanceformat.com blob:; connect-src 'self' https://*.youtube.com https://*.supabase.co https://*.upstash.io https://www.googleapis.com https://www.google-analytics.com https://analytics.google.com https://*.humanlabs.world https://*.googlesyndication.com https://*.googleadservices.com https://*.doubleclick.net https://pagead2.googlesyndication.com https://*.effectivegatecpm.com https://www.highperformanceformat.com *; img-src 'self' data: https: blob:; frame-src 'self' https://*.youtube.com https://*.youtube-nocookie.com https://*.googlesyndication.com https://*.doubleclick.net https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://*.effectivegatecpm.com https://www.highperformanceformat.com *;" 
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
