const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Colombo'
});
const timeFormat = new Intl.DateTimeFormat('en-GB', {
  hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Colombo'
});

function eventCards(eventsHtml, siteUrl) {
  return Array.from(eventsHtml.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g), match => JSON.parse(match[1]))
    .filter(event => ['SportsEvent', 'EducationEvent', 'Event'].includes(event['@type']))
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map(event => {
      const day = new Date(event.startDate);
      const href = new URL(event.url, siteUrl);
      const when = event.startDate.includes('T')
        ? ' · ' + timeFormat.format(day).toUpperCase()
        : '';
      const category = event['@type'] === 'EducationEvent' ? 'Course' : 'Tournament';
      const venue = event.location?.name;
      return '<article class="update-card update-card--event">\n' +
        '  <a class="update-card-link" href="' + escapeHtml(href.pathname + href.hash) + '">\n' +
        '    <span class="update-event-art"><img src="/assets/slmmaf-emblem-transparent.png" alt="" width="64" height="64" loading="lazy" decoding="async"></span>\n' +
        '    <div class="update-card-body"><span class="update-category">' + category + '</span><h3>' + escapeHtml(event.name) + '</h3>' +
        (venue ? '<p>' + escapeHtml(venue) + '</p>' : '') + '</div>\n' +
        '    <div class="update-card-footer"><time datetime="' + escapeHtml(event.startDate) + '">' + dateFormat.format(day) + when +
        '</time><span aria-hidden="true">&#8599;</span></div>\n' +
        '  </a>\n</article>';
    });
}

function programmeCards(programmesHtml) {
  const applications = programmesHtml.match(/<section\b[^>]*\bid="programme-applications"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  if (applications === undefined) throw new Error('Programme applications section is missing.');
  // Keep homepage titles, summaries and links in sync with the application list.
  return Array.from(applications.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g), ([, article]) => {
    const title = article.match(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/)?.[1];
    const summary = article.match(/<p\b[^>]*>([\s\S]*?)<\/p>/)?.[1];
    const href = article.match(/<a\b[^>]*\bhref="([^"]+)"/)?.[1];
    const category = article.match(/<span class="tag">([\s\S]*?)<\/span>/)?.[1] || 'Programme';
    if (!title || !href) throw new Error('Programme application needs a title and an application link.');
    return '<article class="update-card update-card--programme">\n' +
      '  <a class="update-card-link" href="' + href + '">\n' +
      '    <div class="update-card-body"><span class="update-category">' + category + '</span><h3>' + title + '</h3>' +
      (summary ? '<p>' + summary + '</p>' : '') + '</div>\n' +
      '    <div class="update-card-footer">Apply online<span aria-hidden="true">&#8599;</span></div>\n' +
      '  </a>\n</article>';
  });
}

export function renderHomeUpdates(homeHtml, eventsHtml, programmesHtml, siteUrl) {
  const marker = '<!-- home-update-cards -->';
  if (!homeHtml.includes(marker)) throw new Error('Home Updates card slot is missing.');
  const cards = [...eventCards(eventsHtml, siteUrl), ...programmeCards(programmesHtml)];
  return homeHtml.replace(marker, () => cards.join('\n'));
}

