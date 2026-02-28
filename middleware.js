import { NextResponse } from 'next/server';

// ============================================
// EDGE MIDDLEWARE - Bot Protection & Rate Limiting
// Runs at Vercel's edge BEFORE function invocations
// ============================================

// Known bot/crawler user agent patterns to block
const BOT_PATTERNS = [
  /bot/i, /crawl/i, /spider/i, /scrape/i, /lighthouse/i,
  /headless/i, /phantom/i, /selenium/i, /puppeteer/i,
  /wget/i, /curl\//i, /python-requests/i, /axios\//i,
  /node-fetch/i, /go-http/i, /java\//i, /okhttp/i,
  /httpclient/i, /libwww/i, /httpunit/i, /nutch/i,
  /biglotron/i, /teoma/i, /convera/i, /gigablast/i,
  /ia_archiver/i, /webmon/i, /httrack/i, /grub/i,
  /netresearchserver/i, /speedy/i, /fluffy/i, /findlink/i,
  /panscient/i, /ips-agent/i, /yanga/i, /cyberpatrol/i,
  /postman/i, /insomnia/i,
];

// Simple in-memory rate limiter using Map (resets on cold start, which is fine)
// Key: IP, Value: { count, windowStart }
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_API = 60;       // max 60 API requests per minute per IP
const RATE_LIMIT_MAX_PAGE = 30;      // max 30 page loads per minute per IP
const CLEANUP_INTERVAL = 5 * 60 * 1000; // cleanup old entries every 5 min
let lastCleanup = Date.now();

function checkRateLimit(ip, prefix, max) {
  const now = Date.now();
  const key = `${prefix}:${ip}`;

  // Periodic cleanup to prevent memory leak
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    lastCleanup = now;
    for (const [k, v] of rateLimitMap) {
      if (now - v.windowStart > RATE_LIMIT_WINDOW * 2) {
        rateLimitMap.delete(k);
      }
    }
  }

  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: max - 1 };
  }

  entry.count++;
  if (entry.count > max) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: max - entry.count };
}

// Check if this looks like a real mobile WebView (World App)  
function isLikelyWebView(ua) {
  if (!ua) return false;
  // World App runs in Android WebView (wv) or iOS WKWebView
  return /wv\)|WebView|MiniKit/i.test(ua) || 
         // iOS WebView typically doesn't have "Safari" at the end
         (/iPhone|iPad/.test(ua) && !/Safari\//.test(ua)) ||
         // Android WebView
         /; wv\)/.test(ua);
}

function isDesktopBrowser(ua) {
  if (!ua) return false;
  // Desktop Chrome/Firefox/Edge on Windows/Mac/Linux - NOT a mobile webview
  return /Windows NT|Macintosh|X11/.test(ua) && 
         !/Mobile|Android|wv\)/.test(ua);
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const ua = request.headers.get('user-agent') || '';
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             request.headers.get('x-real-ip') || 
             'unknown';

  // --- 1. Block known bots on all routes ---
  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(ua)) {
      return new NextResponse('Not allowed', { status: 403 });
    }
  }

  // --- 2. Block empty user agents (automated scripts) ---
  if (!ua || ua.length < 10) {
    return new NextResponse('Not allowed', { status: 403 });
  }

  // --- 3. API route protection ---
  if (pathname.startsWith('/api/')) {
    // Rate limit API calls
    const { allowed, remaining } = checkRateLimit(ip, 'api', RATE_LIMIT_MAX_API);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { 
          status: 429, 
          headers: { 
            'Retry-After': '60',
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX_API),
            'X-RateLimit-Remaining': '0',
          } 
        }
      );
    }

    // Add rate limit headers to API responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX_API));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    return response;
  }

  // --- 4. Page route protection (main page) ---
  if (pathname === '/' || pathname === '') {
    // Block desktop browsers - this is a mobile-only World App mini-app
    // Desktop traffic generating millions of requests is certainly bots/scrapers
    if (isDesktopBrowser(ua)) {
      return new NextResponse(
        `<!DOCTYPE html><html><head><title>VidLook</title></head><body style="background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center">
          <div><h1>📱 VidLook</h1><p>VidLook is a mobile app. Please open it in the <a href="https://world.org/download" style="color:#ef4444">World App</a>.</p></div>
        </body></html>`,
        { 
          status: 200, 
          headers: { 
            'Content-Type': 'text/html',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          } 
        }
      );
    }

    // Rate limit page loads
    const { allowed } = checkRateLimit(ip, 'page', RATE_LIMIT_MAX_PAGE);
    if (!allowed) {
      return new NextResponse('Too many requests', { status: 429, headers: { 'Retry-After': '60' } });
    }
  }

  return NextResponse.next();
}

// Only run middleware on these paths (skip static files, _next, etc.)
export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Match the main page
    '/',
  ],
};
