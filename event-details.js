if (typeof HTMLDialogElement !== 'undefined' && typeof HTMLDialogElement.prototype.showModal === 'function') {
  const popup = document.createElement('dialog');
  popup.className = 'event-popup';
  popup.setAttribute('aria-labelledby', 'event-popup-title');
  popup.innerHTML = '<div class="event-popup-toolbar"><button type="button" class="event-popup-close" autofocus>Close <span aria-hidden="true">&times;</span></button></div>';
  const body = document.createElement('div');
  body.className = 'event-popup-body';
  popup.append(body);
  document.body.append(popup);

  let opener;
  popup.querySelector('button').addEventListener('click', () => popup.close());
  popup.addEventListener('close', () => {
    if (popup.open) return;
    body.replaceChildren();
    opener?.focus({ preventScroll: true });
    opener = undefined;
  });

  function openDetails(event, panel) {
    // Let standard link shortcuts and the original inline details still work.
    if (!panel || event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || popup.open) return;
    const content = panel.cloneNode(true);
    const title = content.querySelector('h2, h3');
    if (!title) return;
    event.preventDefault();

    content.removeAttribute('id');
    title.id = 'event-popup-title';
    if (content.hasAttribute('aria-labelledby')) content.setAttribute('aria-labelledby', title.id);
    body.replaceChildren(content);
    opener = event.currentTarget;
    popup.showModal();
    popup.scrollTop = 0;
  }

  for (const summary of document.querySelectorAll('.event-disclosure > summary')) {
    summary.setAttribute('aria-haspopup', 'dialog');
    summary.addEventListener('click', event => openDetails(event, summary.nextElementSibling));
  }

  const templates = new Map(Array.from(document.querySelectorAll('template[data-event-panel]'), template => [
    template.dataset.eventPanel, template.content.firstElementChild
  ]));
  for (const link of document.querySelectorAll('.update-card--event > a')) {
    const panel = templates.get(link.hash.slice(1));
    if (!panel) continue;
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', event => openDetails(event, panel));
  }
}

