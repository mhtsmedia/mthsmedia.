/* ── Pakker og priser ─────────────────────────
   All package data lives here. services.html renders the cards from it and
   contact.html uses it for the package picker, so a price only needs to be
   changed in one place. Prices are whole kroner.
   Extras: `qty: true` gives a -/+ stepper (price is per unit), otherwise a
   checkbox. */
const PAKKER = {
  foto: {
    title: 'Foto og drone',
    items: [
      {
        id: 'foto-liten', name: 'Liten', desc: 'Bilder som passer til Instagram og sosiale medier.',
        price: 2990, unit: 'inkl. mva.',
        includes: ['10–15 redigerte bilder', 'Inntil 1 time fotografering', 'Tilpasset Instagram (4:5 og 9:16)', 'Levering innen 3–7 virkedager'],
        extras: ['drone', 'kveld', 'ekstrabilde']
      },
      {
        id: 'foto-medium', name: 'Medium', desc: 'Bilder som passer til nettsiden din.',
        price: 3990, unit: 'inkl. mva.',
        includes: ['20–25 redigerte bilder', 'Inntil 2 timer fotografering', 'Liggende og stående format til nettside', 'Levering innen 3–7 virkedager'],
        extras: ['drone', 'kveld', 'ekstrabilde']
      },
      {
        id: 'foto-stor', name: 'Stor', desc: 'Bilder til nettside, sosiale medier og markedsføring.',
        price: 4600, unit: 'inkl. mva.',
        includes: ['30–40 redigerte bilder', 'Inntil 3 timer fotografering', 'Formater til nettside og sosiale medier', 'Levering innen 3–7 virkedager'],
        extras: ['drone', 'kveld', 'ekstrabilde']
      }
    ]
  },
  film: {
    title: 'Reklamefilm',
    items: [
      {
        id: 'film-liten', name: 'Liten', desc: 'En kort film til sosiale medier.',
        price: 4990, unit: 'inkl. mva.',
        includes: ['Film på opptil 30 sekunder', 'Inntil 2 timer opptak', 'Klipp, fargekorrigering og lisensfri musikk', 'Levert i 16:9 eller 9:16', '1 revisjonsrunde'],
        extras: ['dronefilm', 'teksting']
      },
      {
        id: 'film-medium', name: 'Medium', desc: 'En film til nettsiden og sosiale medier.',
        price: 6990, unit: 'inkl. mva.',
        includes: ['Film på opptil 60 sekunder', 'Inntil 3 timer opptak', 'Klipp, fargekorrigering og lisensfri musikk', 'Levert i 16:9 og 9:16', '2 revisjonsrunder'],
        extras: ['dronefilm', 'teksting']
      },
      {
        id: 'film-stor', name: 'Stor', desc: 'En lengre film om bedriften din.',
        price: 8990, unit: 'inkl. mva.',
        includes: ['Film på opptil 90 sekunder', 'Inntil 5 timer opptak', 'Klipp, fargekorrigering og lisensfri musikk', 'Levert i 16:9 og 9:16', '2 revisjonsrunder'],
        extras: ['dronefilm', 'teksting']
      }
    ]
  },
  mnd: {
    title: 'Månedlig innhold',
    items: [
      {
        id: 'mnd-liten', name: 'Liten', desc: 'For deg som vil komme i gang.',
        price: 3000, unit: 'per måned',
        includes: ['5–10 bilder', '3 videoer', 'Tilpasset Instagram og TikTok', 'Planlegging av innhold'],
        extras: []
      },
      {
        id: 'mnd-medium', name: 'Medium', desc: 'For deg som vil poste flere ganger i uka.',
        price: 5000, unit: 'per måned',
        includes: ['10–20 bilder', '6 videoer', 'Tilpasset Instagram og TikTok', 'Planlegging av innhold'],
        extras: []
      },
      {
        id: 'mnd-stor', name: 'Stor', desc: 'For deg som vil ha innhold nesten hver dag.',
        price: 12000, unit: 'per måned',
        includes: ['30–40 bilder', '10 videoer', 'Tilpasset Instagram og TikTok', 'Planlegging av innhold'],
        extras: []
      }
    ]
  }
};

const TILLEGG = {
  drone:       { name: 'Dronebilder 5–7 stk.', price: 1900 },
  kveld:       { name: 'Kveldsbilder 6–8 stk.', price: 3300 },
  ekstrabilde: { name: 'Ekstra bilder', price: 150, qty: true, per: 'per bilde' },
  dronefilm:   { name: 'Dronefilm', price: 1500 },
  teksting:    { name: 'Undertekster', price: 500 }
};

const pakkeFmt = n => n.toLocaleString('nb-NO').replace(/\s/g, ' ') + ',-';

function finnPakke(id) {
  for (const g of Object.values(PAKKER)) {
    const p = g.items.find(i => i.id === id);
    if (p) return p;
  }
  return null;
}

/* Builds the extras list for one package. `state` is { extraId: count }. */
function tilleggHTML(pakke, state, idPrefix) {
  if (!pakke.extras.length) return '';
  return '<div class="pkg__extras-title">Tillegg</div><ul class="pkg__extras">' +
    pakke.extras.map(key => {
      const t = TILLEGG[key];
      const n = state[key] || 0;
      const label = t.name + ' <span class="pkg__extra-price">(' + pakkeFmt(t.price) + (t.per ? ' ' + t.per : '') + ')</span>';
      if (t.qty) {
        return '<li class="pkg__extra pkg__extra--qty">' +
          '<span class="pkg__stepper">' +
            '<button type="button" class="pkg__step" data-step="-1" data-extra="' + key + '" aria-label="Færre: ' + t.name + '">−</button>' +
            '<span class="pkg__count" aria-live="polite">' + n + '</span>' +
            '<button type="button" class="pkg__step" data-step="1" data-extra="' + key + '" aria-label="Flere: ' + t.name + '">+</button>' +
          '</span><span>' + label + '</span></li>';
      }
      const id = idPrefix + '-' + key;
      return '<li class="pkg__extra"><input type="checkbox" id="' + id + '" data-extra="' + key + '"' + (n ? ' checked' : '') + '>' +
        '<label for="' + id + '">' + label + '</label></li>';
    }).join('') + '</ul>';
}

function pakkeTotal(pakke, state) {
  return pakke.price + pakke.extras.reduce((sum, key) => sum + TILLEGG[key].price * (state[key] || 0), 0);
}

/* Wires checkbox + stepper clicks inside `root` to `state`, then calls onChange. */
function kobleTillegg(root, state, onChange) {
  root.addEventListener('change', e => {
    const key = e.target.dataset.extra;
    if (!key || e.target.type !== 'checkbox') return;
    state[key] = e.target.checked ? 1 : 0;
    onChange();
  });
  root.addEventListener('click', e => {
    const btn = e.target.closest('.pkg__step');
    if (!btn) return;
    const key = btn.dataset.extra;
    state[key] = Math.max(0, Math.min(99, (state[key] || 0) + Number(btn.dataset.step)));
    btn.parentElement.querySelector('.pkg__count').textContent = state[key];
    onChange();
  });
}

function pakkeLenke(pakke, state) {
  const params = new URLSearchParams({ pakke: pakke.id });
  const valgt = pakke.extras.filter(k => state[k]).map(k => TILLEGG[k].qty ? k + ':' + state[k] : k);
  if (valgt.length) params.set('tillegg', valgt.join(','));
  return 'contact.html?' + params.toString();
}

/* ── services.html: render the package cards ── */
(function () {
  document.querySelectorAll('[data-pakker]').forEach(root => {
    const group = PAKKER[root.dataset.pakker];
    if (!group) return;
    root.innerHTML = group.items.map(p =>
      '<article class="pkg" data-id="' + p.id + '">' +
        '<div class="pkg__head"><h3 class="pkg__name">' + p.name + '</h3><p class="pkg__desc">' + p.desc + '</p></div>' +
        '<div class="pkg__price"><span class="pkg__approx">ca.</span><span class="pkg__amount">' + pakkeFmt(p.price) + '</span><span class="pkg__unit">' + p.unit + '</span></div>' +
        '<ul class="pkg__list">' + p.includes.map(i => '<li>' + i + '</li>').join('') + '</ul>' +
        '<div class="pkg__extras-wrap">' + tilleggHTML(p, {}, p.id) + '</div>' +
        '<div class="pkg__foot">' +
          (p.extras.length ? '<div class="pkg__total">Estimert totalt <strong>' + pakkeFmt(p.price) + '</strong></div>' : '') +
          '<a class="srv-tile__btn pkg__btn" href="' + pakkeLenke(p, {}) + '">Velg pakke</a>' +
        '</div>' +
      '</article>'
    ).join('');

    root.querySelectorAll('.pkg').forEach(card => {
      const pakke = finnPakke(card.dataset.id);
      const state = {};
      const total = card.querySelector('.pkg__total strong');
      const btn = card.querySelector('.pkg__btn');
      kobleTillegg(card, state, () => {
        if (total) total.textContent = pakkeFmt(pakkeTotal(pakke, state));
        btn.href = pakkeLenke(pakke, state);
      });
    });
  });
})();

/* ── contact.html: package picker prefilled from the URL ── */
(function () {
  const root = document.getElementById('pakkeVelger');
  if (!root) return;
  const select = root.querySelector('#pakkeField');
  const extrasBox = root.querySelector('.pkg-pick__extras');
  const totalBox = root.querySelector('.pkg-pick__total');
  const hidTillegg = root.querySelector('[name="tillegg"]');
  const hidPris = root.querySelector('[name="estimert_pris"]');

  select.innerHTML = '<option value="">Ingen pakke / vet ikke ennå</option>' +
    Object.values(PAKKER).map(g =>
      '<optgroup label="' + g.title + '">' +
      g.items.map(p => '<option value="' + p.name + ' (' + g.title + ')" data-id="' + p.id + '">' + p.name + ' – ' + pakkeFmt(p.price) + (p.unit === 'per måned' ? ' / mnd.' : '') + '</option>').join('') +
      '</optgroup>').join('');

  const state = {};

  function current() {
    const opt = select.selectedOptions[0];
    return opt && opt.dataset.id ? finnPakke(opt.dataset.id) : null;
  }
  function update() {
    const p = current();
    if (!p) { hidTillegg.value = ''; hidPris.value = ''; totalBox.hidden = true; return; }
    const sum = pakkeTotal(p, state);
    hidTillegg.value = p.extras.filter(k => state[k])
      .map(k => TILLEGG[k].name + (TILLEGG[k].qty ? ' × ' + state[k] : '')).join(', ');
    hidPris.value = pakkeFmt(sum) + ' ' + p.unit;
    totalBox.hidden = false;
    totalBox.innerHTML = 'Estimert pris <strong>' + pakkeFmt(sum) + '</strong> <span>' + p.unit + '</span>';
  }
  function render() {
    const p = current();
    extrasBox.innerHTML = p ? tilleggHTML(p, state, 'kontakt') : '';
    update();
  }

  // kobleTillegg keeps a reference to `state`, so clear it in place
  function clearState() { Object.keys(state).forEach(k => delete state[k]); }

  kobleTillegg(extrasBox, state, update);
  select.addEventListener('change', () => { clearState(); render(); });

  const params = new URLSearchParams(location.search);
  const fraUrl = finnPakke(params.get('pakke') || '');
  if (fraUrl) {
    const opt = select.querySelector('option[data-id="' + fraUrl.id + '"]');
    if (opt) opt.selected = true;
    (params.get('tillegg') || '').split(',').forEach(part => {
      const [key, n] = part.split(':');
      if (fraUrl.extras.includes(key)) state[key] = Math.max(0, Math.min(99, parseInt(n || '1', 10) || 0));
    });
  }
  render();

  const form = root.closest('form');
  if (form) form.addEventListener('reset', () => setTimeout(() => { clearState(); render(); }, 0));
})();

/* ── services.html: show one price group at a time ──
   The tabs and the "Se priser" buttons on the service tiles switch group.
   Clicking anywhere on a tile does the same, except on its "Les mer" link. */
(function () {
  const tabs = Array.from(document.querySelectorAll('.pricing__tab'));
  if (!tabs.length) return;

  function vis(panelId, scroll) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    tabs.forEach(t => {
      const on = t.getAttribute('aria-controls') === panelId;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    document.querySelectorAll('.srv-tile[data-vis-pris]').forEach(tile => {
      tile.classList.toggle('is-active', 'priser-' + tile.dataset.visPris === panelId);
    });
    if (scroll) document.getElementById('priser').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => vis(t.getAttribute('aria-controls')));
    t.addEventListener('keydown', e => {
      const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      const next = tabs[(i + step + tabs.length) % tabs.length];
      next.focus();
      vis(next.getAttribute('aria-controls'));
    });
  });

  document.querySelectorAll('.srv-tile[data-vis-pris]').forEach(tile => {
    tile.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      vis('priser-' + tile.dataset.visPris, true);
    });
  });

  function fraHash() {
    const id = location.hash.slice(1);
    return id.indexOf('priser-') === 0 && document.getElementById(id) ? id : null;
  }
  window.addEventListener('hashchange', () => { if (fraHash()) vis(fraHash(), true); });
  vis(fraHash() || tabs[0].getAttribute('aria-controls'));
})();
