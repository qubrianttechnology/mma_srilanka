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

    if (url.pathname === '/index.html' || url.pathname === '/home') {
      return Response.redirect(new URL('/', url), 301);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const headers = new Headers(assetResponse.headers);

    for (const [name, value] of Object.entries(securityHeaders)) {
      headers.set(name, value);
    }

    if (/\.(?:png|svg|webp|jpg|jpeg|gif|ico)$/i.test(url.pathname)) {
      headers.set('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
    } else if (/\.(?:css|js)$/i.test(url.pathname)) {
      headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
    }

    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers
    });
  }
};
