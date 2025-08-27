import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Add performance-related headers
  addPerformanceHeaders(response);
  
  // Add caching headers for static assets
  addCachingHeaders(request, response);
  
  // Add preload hints for critical resources
  addPreloadHints(request, response);
  
  return response;
}

/**
 * Add performance-related headers
 */
function addPerformanceHeaders(response: NextResponse) {
  // Enable HTTP/2 Server Push hints
  response.headers.set('Link', [
    '</fonts/inter-var.woff2>; rel=preload; as=font; type=font/woff2; crossorigin=anonymous',
    '</api/analytics/performance>; rel=preconnect',
  ].join(', '));
  
  // Add timing headers for debugging
  response.headers.set('Server-Timing', `middleware;dur=${Date.now()}`);
  
  // Enable resource hints
  response.headers.set('X-DNS-Prefetch-Control', 'on');
}

/**
 * Add caching headers for static assets
 */
function addCachingHeaders(request: NextRequest, response: NextResponse) {
  const { pathname } = request.nextUrl;
  
  // Cache static assets aggressively
  if (pathname.startsWith('/_next/static/') || 
      pathname.startsWith('/images/') ||
      pathname.startsWith('/icons/') ||
      pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|webp|avif|svg)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // Cache API responses with shorter TTL
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  }
  
  // Cache pages with revalidation
  if (!pathname.startsWith('/api/') && !pathname.startsWith('/_next/')) {
    response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=86400, must-revalidate');
  }
}

/**
 * Add preload hints for critical resources
 */
function addPreloadHints(request: NextRequest, response: NextResponse) {
  const { pathname } = request.nextUrl;
  
  // Preload critical resources for homepage
  if (pathname === '/') {
    const preloadLinks = [
      '</api/analytics/performance>; rel=preconnect',
      '<https://fonts.googleapis.com>; rel=preconnect',
      '<https://fonts.gstatic.com>; rel=preconnect; crossorigin',
    ];
    
    const existingLink = response.headers.get('Link') || '';
    const newLinks = existingLink ? `${existingLink}, ${preloadLinks.join(', ')}` : preloadLinks.join(', ');
    response.headers.set('Link', newLinks);
  }
  
  // Add early hints for critical CSS
  if (!pathname.startsWith('/api/')) {
    response.headers.set('X-Early-Hints', 'Link: </_next/static/css/app.css>; rel=preload; as=style');
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};