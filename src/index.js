const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Preserve one crawlable URL for each page and retain query strings.
    if (request.method === 'GET' || request.method === 'HEAD') {
      const pages = new Set(['about', 'programmes', 'clubs', 'events', 'news', 'contact']);
      const originalPath = url.pathname;
      if (originalPath === '/home' || originalPath === '/index.html') url.pathname = '/';
      else if (originalPath.endsWith('/index.html')) url.pathname = originalPath.slice(0, -10);
      else {
        const name = originalPath.slice(1).replace(/\.html$|\/$/g, '');
        if (pages.has(name)) url.pathname = '/' + name + (name === 'clubs' ? '/' : '');
        else if (/^\/clubs\/(?:countries\/[a-z]{2}|[a-z0-9]+(?:-[a-z0-9]+)*)$/.test(originalPath)) url.pathname += '/';
      }
      if (url.pathname !== originalPath) return Response.redirect(url, 301);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const headers = new Headers(assetResponse.headers);

    for (const [name, value] of Object.entries(securityHeaders)) {
      headers.set(name, value);
    }

    if (assetResponse.status === 404) headers.set('X-Robots-Tag', 'noindex');

    if (assetResponse.ok && /\.(?:png|svg|webp|jpg|jpeg|gif|ico)$/i.test(url.pathname)) {
      headers.set('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
    } else if (assetResponse.ok && /\.(?:css|js)$/i.test(url.pathname)) {
      headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
    }

    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers
    });
  }
};
