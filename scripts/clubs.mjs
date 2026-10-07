const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const jsonScript = value => JSON.stringify(value).replace(/</g, '\\u003c');
const countryPath = club => `clubs/countries/${club.countryCode.toLowerCase()}/`;
const clubPath = club => `clubs/${club.slug}/`;
const location = club => [club.city, club.region, club.country].filter(Boolean).join(', ');
const phoneHref = club => { const number = club.phone.replace(/[ ()-]/g, ''); return club.countryCode === 'LK' && /^0[0-9]{9}$/.test(number) ? '+94' + number.slice(1) : number; };
const text = value => typeof value === 'string' && value.trim().length > 0;

export function validateClubs(data) {
  if (!data || !Array.isArray(data.clubs)) throw new Error('data/clubs.json must contain a clubs array.');
  const slugs = new Set();
  const countries = new Map();
  for (const club of data.clubs) {
    for (const key of ['slug','name','countryCode','country','city','description','status']) {
      if (!text(club[key])) throw new Error(`Club field ${key} is required: ${club.slug || '(no slug)'}`);
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(club.slug) || club.slug === 'countries' || slugs.has(club.slug)) throw new Error(`Invalid or duplicate club slug: ${club.slug}`);
    slugs.add(club.slug);
    if (!/^[A-Z]{2}$/.test(club.countryCode)) throw new Error(`Use a two-letter uppercase country code: ${club.slug}`);
    if (countries.has(club.countryCode) && countries.get(club.countryCode) !== club.country) throw new Error(`Use a consistent name for country ${club.countryCode}`);
    countries.set(club.countryCode, club.country);
    if (!['draft','approved','suspended'].includes(club.status)) throw new Error(`Invalid affiliation status: ${club.slug}`);
    for (const key of ['region','streetAddress','postalCode','phone','email','website','affiliationNumber','validUntil']) {
      if (club[key] !== undefined && typeof club[key] !== 'string') throw new Error(`${key} must be text: ${club.slug}`);
    }
    if (club.validUntil && (!/^\d{4}-\d{2}-\d{2}$/.test(club.validUntil) || !Number.isFinite(Date.parse(club.validUntil)) || new Date(club.validUntil).toISOString().slice(0,10) !== club.validUntil)) throw new Error(`Invalid validUntil date: ${club.slug}`);
    if (club.phone && !/^\+?[\d ()-]{6,25}$/.test(club.phone)) throw new Error(`Invalid public phone number: ${club.slug}`);
    if (club.email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(club.email)) throw new Error(`Invalid public email: ${club.slug}`);
    if (club.website) {
      let url; try { url = new URL(club.website); } catch { throw new Error(`Invalid website: ${club.slug}`); }
      if (url.protocol !== 'https:' || url.username || url.password) throw new Error(`Use a public HTTPS website: ${club.slug}`);
    }
    if (club.disciplines !== undefined && (!Array.isArray(club.disciplines) || club.disciplines.some(item => !text(item)))) throw new Error(`Disciplines must be a text array: ${club.slug}`);
  }
  return data.clubs;
}

function rootLinks(html) {
  return html.replace(/\b(href|src)="([^"#:/][^"]*)"/g, (match, attribute, url) => {
    if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return match;
    return `${attribute}="/${url === 'index.html' ? '' : url}"`;
  });
}
function metadata(html, title, description, url) {
  return html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta (?:name="(?:description|twitter:description)"|property="og:description") content=")[^"]*(")/g, (_,a,b) => a + escapeHtml(description) + b)
    .replace(/(<meta (?:name="twitter:title"|property="og:title") content=")[^"]*(")/g, (_,a,b) => a + escapeHtml(title) + b)
    .replace(/(<link rel="canonical" href=")[^"]*(")/g, (_,a,b) => a + escapeHtml(url) + b)
    .replace(/(<meta property="og:url" content=")[^"]*(")/g, (_,a,b) => a + escapeHtml(url) + b);
}
function schema(html, value) {
  return html.replace('</head>', `<script type="application/ld+json">${jsonScript(value)}</script>\n</head>`);
}
function card(club) {
  return `<article class="club-card" data-club data-country="${escapeHtml(club.countryCode)}" data-region="${escapeHtml(club.region || club.city)}" data-search="${escapeHtml([club.name,location(club),...(club.disciplines || [])].join(' ').toLowerCase())}">
    <span class="club-status">SLMMAF affiliated</span><h2><a href="/${clubPath(club)}">${escapeHtml(club.name)}</a></h2>
    <p class="club-location">${escapeHtml(location(club))}</p><p>${escapeHtml(club.description)}</p>
    ${club.affiliationNumber ? `<p class="club-ref">Affiliation: ${escapeHtml(club.affiliationNumber)}</p>` : ''}
    <a class="arrow-link" href="/${clubPath(club)}">View club profile <span aria-hidden="true">&#8599;</span></a></article>`;
}
function directoryContent(clubs, selectedCountry = '') {
  if (!clubs.length) return `<div class="club-empty"><h2>Club listings are coming soon.</h2><p>Contact the federation to ask about affiliated clubs near you.</p><a class="arrow-link" href="/contact.html">Ask about affiliated clubs <span aria-hidden="true">&#8599;</span></a></div>`;
  const countries = [...new Map(clubs.map(c => [c.countryCode,c])).values()].sort((a,b)=>a.country.localeCompare(b.country));
  return `<form class="club-filters" data-club-filters hidden role="search" aria-label="Find an affiliated club">
    <label>Search clubs<input type="search" name="q" placeholder="Club name, city or discipline" autocomplete="off"></label>
    <label>Country<select name="country"><option value="">All countries</option>${countries.map(c=>`<option value="${escapeHtml(c.countryCode)}"${selectedCountry===c.countryCode?' selected':''}>${escapeHtml(c.country)}</option>`).join('')}</select></label>
    <button type="reset" class="club-reset">Clear filters</button></form>
    <nav class="country-links" aria-label="Browse clubs by country">${countries.map(c=>`<a href="/${countryPath(c)}">${escapeHtml(c.country)}</a>`).join('')}</nav>
    <p class="club-result-count" data-club-count role="status" aria-live="polite">${clubs.length} affiliated ${clubs.length===1?'club':'clubs'}</p>
    <div class="club-grid">${clubs.map(card).join('\n')}</div>
    <div class="club-empty" data-no-clubs hidden><h2>No matching clubs.</h2><p>Try another location or clear your filters.</p><button type="button" class="club-reset" data-clear-clubs>Clear filters</button></div>`;
}
function profileContent(club) {
  const e = escapeHtml;
  const address = [club.streetAddress,club.city,club.region,club.postalCode,club.country].filter(Boolean).join(', ');
  return `<main id="main"><section class="section club-profile"><div class="container">
    <nav class="club-breadcrumb" aria-label="Breadcrumb"><a href="/clubs.html">Affiliated clubs</a><span aria-hidden="true">/</span><a href="/${countryPath(club)}">${e(club.country)}</a><span aria-hidden="true">/</span><span aria-current="page">${e(club.name)}</span></nav>
    <span class="club-status">SLMMAF affiliated club</span><h1 class="page-title">${e(club.name)}</h1><p class="directory-intro">${e(location(club))}</p>
    <div class="club-profile-grid"><div><h2>About the club</h2><p>${e(club.description)}</p>
    ${club.disciplines?.length ? `<h2>Training disciplines</h2><ul class="club-disciplines">${club.disciplines.map(d=>`<li>${e(d)}</li>`).join('')}</ul>`:''}
    <h2>Federation affiliation</h2><p>Affiliated with the Sri Lanka Mixed Martial Arts Federation (SLMMAF).</p>
    ${club.affiliationNumber?`<p><strong>Affiliation number:</strong> ${e(club.affiliationNumber)}</p>`:''}
    ${club.validUntil?`<p><strong>Valid until:</strong> <time datetime="${e(club.validUntil)}">${e(club.validUntil)}</time></p>`:''}
    <a class="arrow-link" href="/contact.html">Enquire about affiliation <span aria-hidden="true">&#8599;</span></a></div>
    <aside class="club-contact" aria-labelledby="club-contact-title"><h2 id="club-contact-title">Location &amp; contact</h2><address>${e(address)}</address>
    ${club.phone?`<a href="tel:${e(phoneHref(club))}">${e(club.phone)}</a>`:''}
    ${club.email?`<a href="mailto:${e(club.email)}">${e(club.email)}</a>`:''}
    ${club.website?`<a href="${e(club.website)}" rel="external">Visit club website &#8599;</a>`:''}
    ${club.streetAddress?`<a href="https://www.google.com/maps/search/?api=1&amp;query=${e(encodeURIComponent(address))}" rel="external">Find location on Google Maps &#8599;</a>`:''}
    ${!club.phone&&!club.email&&!club.website?'<p>Contact the federation for club contact information.</p>':''}</aside></div>
    <a class="arrow-link club-back" href="/clubs.html">Browse all affiliated clubs <span aria-hidden="true">&#8599;</span></a>
    </div></section></main>`;
}

export function renderClubs({ data, template, siteUrl, today = new Date().toISOString().slice(0,10) }) {
  const clubs = validateClubs(data).filter(c=>c.status==='approved' && (!c.validUntil || c.validUntil>=today)).sort((a,b)=>a.name.localeCompare(b.name));
  const base = rootLinks(template);
  const replaceDirectory = (html, list, selected='') => html.replace(/<!-- CLUB_DIRECTORY_START -->[\s\S]*?<!-- CLUB_DIRECTORY_END -->/,()=>`<!-- CLUB_DIRECTORY_START -->${directoryContent(list,selected)}<!-- CLUB_DIRECTORY_END -->`);
  const itemList = list => ({'@context':'https://schema.org','@type':'ItemList',itemListElement:list.map((c,i)=>({'@type':'ListItem',position:i+1,name:c.name,url:`${siteUrl}/${clubPath(c)}`}))});
  let directory = replaceDirectory(base,clubs);
  if(clubs.length) directory=schema(directory,itemList(clubs));
  const pages = new Map([['clubs/index.html', directory]]);
  const paths=['clubs/'];
  const countries=[...new Set(clubs.map(c=>c.countryCode))];
  for(const code of countries){
    const list=clubs.filter(c=>c.countryCode===code);const country=list[0].country;const path=countryPath(list[0]);
    let html=metadata(base,`MMA Clubs in ${country} | SLMMAF Directory`,`Find SLMMAF affiliated MMA clubs in ${country}. Browse locations, club profiles and public contact details.`,`${siteUrl}/${path}`);
    html=html.replace(/<h1 class="page-title" id="clubs-title">[\s\S]*?<\/h1>/,()=>`<h1 class="page-title" id="clubs-title">Affiliated MMA clubs<br><em>in ${escapeHtml(country)}.</em></h1>`);
    html=replaceDirectory(html,list,code);
    pages.set(path+'index.html',schema(html,itemList(list)));paths.push(path);
  }
  for(const club of clubs){
    const path=clubPath(club);const url=`${siteUrl}/${path}`;
    let html=metadata(base,`${club.name} | MMA Srilanka`,`${club.name} is an SLMMAF affiliated MMA club in ${location(club)}. View affiliation details, training disciplines and public contact information.`,url);
    html=html.replace(/<main id="main">[\s\S]*?<\/main>/,()=>profileContent(club));
    const organization={'@context':'https://schema.org','@type':'SportsOrganization',name:club.name,url,description:club.description,sport:'Mixed Martial Arts',memberOf:{'@type':'SportsOrganization',name:'Sri Lanka Mixed Martial Arts Federation',url:siteUrl+'/'},address:{'@type':'PostalAddress',addressLocality:club.city,addressCountry:club.countryCode}};
    if(club.region)organization.address.addressRegion=club.region;
    if(club.streetAddress)organization.address.streetAddress=club.streetAddress;
    if(club.postalCode)organization.address.postalCode=club.postalCode;
    if(club.phone)organization.telephone=phoneHref(club);
    if(club.email)organization.email=club.email;
    if(club.website)organization.sameAs=[club.website];
    if(club.affiliationNumber)organization.identifier={'@type':'PropertyValue',propertyID:'SLMMAF affiliation number',value:club.affiliationNumber};
    html=schema(html,organization);
    html=schema(html,{'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Affiliated clubs',item:siteUrl+'/clubs/'},{'@type':'ListItem',position:2,name:club.country,item:`${siteUrl}/${countryPath(club)}`},{'@type':'ListItem',position:3,name:club.name,item:url}]});
    pages.set(path+'index.html',html);paths.push(path);
  }
  return { pages, paths, count: clubs.length };
}
