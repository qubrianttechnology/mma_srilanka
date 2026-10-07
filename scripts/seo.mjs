const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const decode = value => value.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const serialize = value => JSON.stringify(value).replace(/</g,'\\u003c');

export function pagePath(file) {
  if (file === 'index.html') return '/';
  if (file.endsWith('/index.html')) return '/' + file.slice(0,-10);
  return '/' + file.replace(/\.html$/, '');
}

export function enhanceSeo(html, { file, siteUrl, verification = '' }) {
  const route = pagePath(file);
  const canonical = siteUrl + route;
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] || 'MMA Srilanka');
  const description = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] || '');
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/,(_,a,b)=>a+escapeHtml(canonical)+b)
    .replace(/(<meta property="og:url" content=")[^"]*(")/,(_,a,b)=>a+escapeHtml(canonical)+b);
  const orgId = siteUrl + '/#organization';
  const websiteId = siteUrl + '/#website';
  const schemas = [];
  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) schemas.push(JSON.parse(match[1]));
  // Preserve club facts and existing profile breadcrumbs rather than inventing local-business data.
  const club = route.startsWith('/clubs/') && schemas.find(item => item['@type'] === 'SportsOrganization' && item.url === canonical);
  const breadcrumb = schemas.find(item => item['@type'] === 'BreadcrumbList');
  const pageType = route === '/about' ? 'AboutPage' : route === '/contact' ? 'ContactPage' : route === '/clubs/' || route.startsWith('/clubs/countries/') || route === '/news' ? 'CollectionPage' : 'WebPage';
  const graph = [{ '@type': pageType, '@id': canonical + '#webpage', url: canonical, name: title, description, inLanguage:'en-LK', isPartOf:{'@id':websiteId}, publisher:{'@id':orgId}, about: club ? {'@type':'SportsOrganization',name:club.name,url:canonical} : {'@id':orgId} }];
  if (route === '/' || route === '/about') graph[0].mainEntity = { '@id': orgId };
  if (route === '/') graph.push({ '@type':'WebSite','@id':websiteId,url:siteUrl+'/',name:'MMA Srilanka',alternateName:['MMA Sri Lanka','Sri Lanka MMA Federation','SLMMAF'],inLanguage:'en-LK',publisher:{'@id':orgId} });
  const label = { '/about':'About SLMMAF', '/programmes':'MMA programmes', '/clubs/':'Affiliated clubs', '/events':'MMA events', '/news':'Federation news', '/contact':'Contact' }[route];
  if (label && route !== '/') {
    const trail = {'@type':'BreadcrumbList','@id':canonical+'#breadcrumb',itemListElement:[{'@type':'ListItem',position:1,name:'MMA Srilanka',item:siteUrl+'/'},{'@type':'ListItem',position:2,name:label,item:canonical}]};
    graph.push(trail);graph[0].breadcrumb={'@id':trail['@id']};
    html=html.replace('<main id="main">',`<main id="main"><nav class="seo-breadcrumb container" aria-label="Breadcrumb"><a href="/">MMA Srilanka</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(label)}</span></nav>`);
  } else if (route.startsWith('/clubs/countries/')) {
    const country = decode(html.match(/<h1[^>]*>[\s\S]*?<em>in ([\s\S]*?)\.<\/em>/)?.[1] || 'Country');
    graph.push({'@type':'BreadcrumbList','@id':canonical+'#breadcrumb',itemListElement:[{'@type':'ListItem',position:1,name:'MMA Srilanka',item:siteUrl+'/'},{'@type':'ListItem',position:2,name:'Affiliated clubs',item:siteUrl+'/clubs/'},{'@type':'ListItem',position:3,name:country,item:canonical}]});
    graph[0].breadcrumb={'@id':canonical+'#breadcrumb'};
    html=html.replace('<main id="main">',`<main id="main"><nav class="seo-breadcrumb container" aria-label="Breadcrumb"><a href="/">MMA Srilanka</a><span aria-hidden="true">/</span><a href="/clubs/">Affiliated clubs</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(country)}</span></nav>`);
  } else if (breadcrumb) graph[0].breadcrumb = breadcrumb;
  html=html.replace('</head>',`  <script type="application/ld+json">${serialize({'@context':'https://schema.org','@graph':graph})}</script>\n</head>`);
  const emblemPreview = html.includes('property="og:image" content="' + siteUrl + '/assets/slmmaf-logo.png"');
  const additions = [
    '<meta property="og:image:type" content="image/png">',
    `<meta property="og:image:width" content="${emblemPreview ? 1254 : 1983}">`,
    `<meta property="og:image:height" content="${emblemPreview ? 1254 : 793}">`,
    `<meta name="twitter:image:alt" content="${emblemPreview ? 'Sri Lanka Mixed Martial Arts Federation emblem' : 'Mixed martial artists training together in a cage'}">`
  ];
  if (verification) additions.push(`<meta name="google-site-verification" content="${escapeHtml(verification)}">`);
  html=html.replace('</head>',additions.join('\n  ')+'\n</head>');
  // Production links use the same canonical paths that the sitemap publishes.
  html=html.replace(/href="(?:\/)?(index|about|programmes|clubs|events|news|contact)\.html(#[^"]*)?"/g,(_,name,hash='')=>`href="${name==='index'?'/':name==='clubs'?'/clubs/':'/'+name}${hash}"`);
  return html;
}
