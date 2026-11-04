const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
};

const programmes = new Map([
  ['membership', 'Membership, club affiliation or partnership'],
  ['camp', 'National MMA Development Camp'],
  ['certification', 'Coach & Official Certification']
]);
const roles = new Set(['Athlete', 'Coach', 'Official', 'Club representative', 'Partner']);

function registrationResponse(status, message) {
  return Response.json({ message }, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
  });
}

async function register(request, env, url) {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }
  if (request.headers.get('Origin') !== url.origin) {
    return registrationResponse(403, 'Submit your request from the SLMMAF website.');
  }
  if (request.headers.get('Content-Type')?.split(';')[0] !== 'application/json') {
    return registrationResponse(415, 'Use the online registration form to send your request.');
  }

  let data;
  try {
    const reader = request.body.getReader();
    const decoder = new TextDecoder();
    let bytes = 0;
    let body = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 8192) {
        await reader.cancel();
        return registrationResponse(413, 'Your request is too long.');
      }
      body += decoder.decode(value, { stream: true });
    }
    data = JSON.parse(body + decoder.decode());
  } catch {
    return registrationResponse(400, 'Your request could not be read. Please try again.');
  }

  const field = key => typeof data?.[key] === 'string' ? data[key].trim() : '';
  const name = field('name');
  const email = field('email');
  const role = field('interest');
  const programme = programmes.get(field('programme'));
  const phone = field('phone');
  const city = field('city');
  const message = field('message');
  const requestId = field('requestId');
  if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 || !roles.has(role) || !programme ||
      !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(requestId) ||
      phone.length > 30 || city.length > 80 || message.length > 800) {
    return registrationResponse(400, 'Check your name, email address, role and programme, then try again.');
  }

  try {
    const key = request.headers.get('CF-Connecting-IP') || 'unknown';
    const { success } = await env.REGISTRATION_LIMIT.limit({ key });
    if (!success) {
      return registrationResponse(429, 'Too many requests. Wait a minute and try again.');
    }
    await env.REGISTRATIONS.prepare(
      'INSERT INTO registrations (id, name, email, role, programme, phone, city, message) ' +
      'VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING'
    ).bind(requestId, name, email, role, programme, phone, city, message).run();
  } catch {
    return registrationResponse(503, 'Your request could not be sent. Please try again or email info@mmasrilanka.com.');
  }
  return registrationResponse(200, 'Registration request sent. SLMMAF will contact you about the next steps.');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/registration') return register(request, env, url);

    // Preserve one crawlable URL for each page and retain query strings.
    if (request.method === 'GET' || request.method === 'HEAD') {
      const pages = new Set(['about', 'programmes', 'clubs', 'events', 'news', 'contact']);
      const originalPath = url.pathname;
      const originalOrigin = url.origin;
      // Apply the production origin policy without redirecting local previews or workers.dev.
      if (url.hostname === 'mmasrilanka.com' || url.hostname === 'www.mmasrilanka.com') {
        url.protocol = 'https:';
        url.hostname = 'mmasrilanka.com';
        url.port = '';
      }
      if (/^\/(?:home|index)(?:\.html|\/)?$/.test(originalPath)) url.pathname = '/';
      else if (originalPath.endsWith('/index.html')) url.pathname = originalPath.slice(0, -10);
      else {
        const name = originalPath.slice(1).replace(/\.html$|\/$/g, '');
        if (pages.has(name)) url.pathname = '/' + name + (name === 'clubs' ? '/' : '');
        else if (/^\/clubs\/(?:countries\/[a-z]{2}|[a-z0-9]+(?:-[a-z0-9]+)*)$/.test(originalPath)) url.pathname += '/';
      }
      if (url.pathname !== originalPath || url.origin !== originalOrigin) return Response.redirect(url, 301);
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
