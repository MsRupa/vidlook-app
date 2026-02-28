import { NextResponse } from 'next/server';

// ============================================
// EDGE MIDDLEWARE - Bot Protection & Rate Limiting
// Runs at Vercel's edge BEFORE function invocations
// ============================================

// Allowed origins - only your domain can call the API
const ALLOWED_ORIGINS = [
  'https://vidlook.app',
  'https://www.vidlook.app',
  'http://localhost:3000',  // dev
  'http://localhost:3001',
];

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
  /postman/i, /insomnia/i, /aiohttp/i, /httpx/i,
  /scrapy/i, /mechanize/i, /request\//i, /fetch\//i,
];

// Simple in-memory rate limiter using Map (resets on cold start, which is fine)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_API = 30;       // max 30 API requests per minute per IP (reduced from 60)
const RATE_LIMIT_MAX_PAGE = 15;      // max 15 page loads per minute per IP (reduced from 30)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

// Track abusive IPs that hit rate limit multiple times
const abuseMap = new Map();
const ABUSE_THRESHOLD = 3;           // 3 rate-limit hits = blocked for 1 hour
const ABUSE_BLOCK_DURATION = 60 * 60 * 1000; // 1 hour block

function checkRateLimit(ip, prefix, max) {
  const now = Date.now();
  const key = `${prefix}:${ip}`;

  // Check if IP is in abuse block
  const abuseEntry = abuseMap.get(ip);
  if (abuseEntry && abuseEntry.blockedUntil > now) {
    return { allowed: false, remaining: 0, blocked: true };
  }

  // Periodic cleanup
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    lastCleanup = now;
    for (const [k, v] of rateLimitMap) {
      if (now - v.windowStart > RATE_LIMIT_WINDOW * 2) rateLimitMap.delete(k);
    }
    for (const [k, v] of abuseMap) {
      if (v.blockedUntil < now) abuseMap.delete(k);
    }
  }

  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: max - 1 };
  }

  entry.count++;
  if (entry.count > max) {
    // Track repeated abuse
    const abuse = abuseMap.get(ip) || { hits: 0, blockedUntil: 0 };
    abuse.hits++;
    if (abuse.hits >= ABUSE_THRESHOLD) {
      abuse.blockedUntil = now + ABUSE_BLOCK_DURATION;
    }
    abuseMap.set(ip, abuse);
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: max - entry.count };
}

function isDesktopBrowser(ua) {
  if (!ua) return false;
  return /Windows NT|Macintosh|X11/.test(ua) && 
         !/Mobile|Android|wv\)/.test(ua);
}

function isValidOrigin(referer, origin) {
  // Check if the request comes from an allowed origin
  for (const allowed of ALLOWED_ORIGINS) {
    if (referer.startsWith(allowed) || origin === allowed) {
      return true;
    }
  }
  return false;
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

  // --- 2. Block empty/tiny user agents (automated scripts) ---
  if (!ua || ua.length < 10) {
    return new NextResponse('Not allowed', { status: 403 });
  }

  // --- 3. API route protection (strictest) ---
  if (pathname.startsWith('/api/')) {
    const referer = request.headers.get('referer') || '';
    const origin = request.headers.get('origin') || '';

    // Block requests where Referer is an API URL (self-referencing loop)
    if (referer.includes('/api/')) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 403 });
    }

    // CRITICAL: Only allow API requests that come from your own domain
    // Browser fetch() calls include Origin or Referer headers automatically
    // Direct API hits (curl, scripts, bots) won't have valid origin
    if (referer || origin) {
      // If headers are present, they must match allowed origins
      if (!isValidOrigin(referer, origin)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    } else {
      // No referer AND no origin = direct API hit (not from a browser page)
      // Block completely — real app requests always have at least a Referer
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Block desktop browsers on API routes
    if (isDesktopBrowser(ua)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Rate limit API calls
    const { allowed, remaining, blocked } = checkRateLimit(ip, 'api', RATE_LIMIT_MAX_API);
    if (!allowed) {
      return NextResponse.json(
        { error: blocked ? 'IP temporarily blocked due to abuse.' : 'Too many requests. Please slow down.' },
        { 
          status: 429, 
          headers: { 
            'Retry-After': blocked ? '3600' : '60',
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX_API),
            'X-RateLimit-Remaining': '0',
          } 
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX_API));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    return response;
  }

  // --- 4. Page route protection ---
  if (pathname === '/' || pathname === '') {
    // Block desktop browsers — mobile-only app
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

// Only run middleware on these paths
export const config = {
  matcher: [
    '/api/:path*',
    '/',
  ],
};
