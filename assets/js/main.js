/* Vitrerie Belleville Inox — JavaScript vanilla */
document.documentElement.classList.add('js');
(function () {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* Navigation : transparente puis pleine au scroll + burger */
  const nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
  const onScroll = () => nav.classList.toggle('solid', scrollY > 40);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    menu.classList.toggle('open', open); nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
  });
  $$('#menu a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('open'); menu.classList.remove('open'); nav.classList.remove('menu-open'); }));

  /* Reveal au scroll */
  const io = new IntersectionObserver((es) => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15 });
  $$('.rv').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 90 + 'ms'; io.observe(el); });

  /* Compteurs animés */
  const co = new IntersectionObserver((es) => es.forEach(e => {
    if (!e.isIntersecting) return; co.unobserve(e.target);
    const end = +e.target.dataset.count, t0 = performance.now();
    (function step(t) {
      const p = Math.min((t - t0) / 1600, 1);
      e.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (p === 1 ? '+' : '');
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => co.observe(el));

  /* Parallax léger du hero */
  const bg = $('[data-parallax]');
  if (bg && !matchMedia('(prefers-reduced-motion:reduce)').matches)
    addEventListener('scroll', () => { if (scrollY < innerHeight) bg.style.transform = 'translateY(' + scrollY * .25 + 'px)'; }, { passive: true });

  /* Slider roulant automatique */
  const sl = $('#slider');
  if (sl) {
    const track = $('.track', sl), slides = $$('.slide', sl), dotsBox = $('.dots', sl);
    let idx = 0, timer, hover = false;
    const perView = () => innerWidth >= 1024 ? 3 : innerWidth >= 768 ? 2 : 1;
    const maxIdx = () => Math.max(0, slides.length - perView());
    const build = () => { dotsBox.innerHTML = ''; for (let i = 0; i <= maxIdx(); i++) { const b = document.createElement('button'); b.setAttribute('aria-label', 'Diapositive ' + (i + 1)); b.onclick = () => go(i, true); dotsBox.appendChild(b); } };
    const go = (i, manual) => {
      idx = i > maxIdx() ? 0 : i < 0 ? maxIdx() : i;
      const w = slides[0].offsetWidth + 19.2;
      track.style.transform = 'translateX(' + (-idx * w) + 'px)';
      $$('button', dotsBox).forEach((d, k) => d.classList.toggle('on', k === idx));
      slides.forEach((s, k) => { const v = $('video', s); if (v) (k >= idx && k < idx + perView()) ? v.play().catch(() => {}) : v.pause(); });
      if (manual) restart();
    };
    const restart = () => { clearInterval(timer); timer = setInterval(() => { if (!hover) go(idx + 1); }, 3500); };
    $('.prev', sl).onclick = () => go(idx - 1, true); $('.next', sl).onclick = () => go(idx + 1, true);
    sl.addEventListener('mouseenter', () => hover = true); sl.addEventListener('mouseleave', () => hover = false);
    let x0 = null; // balayage tactile
    sl.addEventListener('touchstart', e => x0 = e.touches[0].clientX, { passive: true });
    sl.addEventListener('touchend', e => { if (x0 === null) return; const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) go(idx + (d < 0 ? 1 : -1), true); x0 = null; });
    addEventListener('resize', () => { build(); go(0); });
    build(); go(0); restart();
  }

  /* Slider du header (hero) : fondu automatique */
  const hsl = $$('#heroSlides .hs');
  if (hsl.length) {
    const dots = $('#hdots'); let h = 0, ht, hpaused = matchMedia('(prefers-reduced-motion: reduce)').matches;
    hsl.forEach((_, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', 'Image ' + (i + 1)); b.onclick = () => hgo(i, true); dots.appendChild(b); });
    const hgo = (i, manual) => {
      h = (i + hsl.length) % hsl.length;
      hsl.forEach((s, k) => s.classList.toggle('on', k === h));
      $$('button', dots).forEach((d, k) => d.classList.toggle('on', k === h));
      if (manual) { clearInterval(ht); if (!hpaused) ht = setInterval(() => hgo(h + 1), 5000); }
    };
    $('#hprev').onclick = () => hgo(h - 1, true); $('#hnext').onclick = () => hgo(h + 1, true);
    hgo(0);
    const hp = $('#hpause');
    const setP = p => { hpaused = p; clearInterval(ht); if (!p) ht = setInterval(() => hgo(h + 1), 5000);
      if (hp) { hp.setAttribute('aria-label', p ? 'Relancer le diaporama' : 'Mettre le diaporama en pause'); hp.querySelector('use').setAttribute('href', p ? '#i-play' : '#i-pause'); } };
    if (hp) hp.addEventListener('click', () => setP(!hpaused));
    setP(hpaused);
  }

  /* Filtres de la galerie + lecture vidéo au survol */
  const fl = $('#filters');
  if (fl) fl.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', fl).forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
    $$('#gal [data-t]').forEach(g => g.classList.toggle('hide', b.dataset.f !== 'all' && g.dataset.t !== b.dataset.f));
  });
  $$('.gi video, .slide video').forEach(v => { v.parentElement.addEventListener('mouseenter', () => v.play().catch(() => {})); });

  /* Validation du formulaire de contact */
  const f = $('#cform');
  if (f) f.addEventListener('submit', e => {
    let ok = true;
    const rules = { nom: v => v.trim().length >= 2, tel: v => /^[0-9 +().-]{8,20}$/.test(v), email: v => !v || /^\S+@\S+\.\S+$/.test(v), message: v => v.trim().length >= 10 };
    Object.keys(rules).forEach(n => { const el = f.elements[n]; const good = rules[n](el.value); el.classList.toggle('field-err', !good); el.setAttribute('aria-invalid', !good); const er = $('#e-' + n); if (er) er.hidden = good; if (!good) ok = false; });
    if (!ok) { e.preventDefault(); $('.field-err', f).focus(); }
  });
  if (f) f.addEventListener('input', e => { const el = e.target; if (el.classList.contains('field-err')) { el.classList.remove('field-err'); el.removeAttribute('aria-invalid'); const er = $('#e-' + el.name); if (er) er.hidden = true; } });
})();

/* Galerie défilante : défilement continu infini (requestAnimationFrame) + balayage au doigt / glissé à la souris */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.marquee').forEach(function (root) {
    const track = root.querySelector('.mtrack');
    const orig = Array.from(track.children);
    if (!orig.length) return;
    orig.forEach((el, i) => { el.dataset.i = i; });   // repère pour l'agrandissement
    const dir = +root.dataset.dir || -1, speed = reduce ? 0 : (+root.dataset.speed || 38);
    let held = false, setW = 0, x = 0, vx = 0, drag = false, moved = false, visible = true, lastT = 0;
    let startX = 0, startPos = 0, lastX = 0, lastTm = 0, v = 0;

    const wrap = () => { if (!setW) return; x = x % setW; if (x > 0) x -= setW; };   // x reste dans ]-setW ; 0]
    const paint = () => { track.style.transform = 'translate3d(' + x + 'px,0,0)'; };

    function build() {                       // duplique les cartes pour que la piste ne soit jamais vide
      track.querySelectorAll('[data-clone]').forEach(n => n.remove());
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      setW = orig.reduce((a, el) => a + el.getBoundingClientRect().width + gap, 0);
      if (!setW) return;
      const copies = Math.ceil(root.clientWidth * 2 / setW) + 1;
      for (let c = 0; c < copies; c++) orig.forEach(el => {
        const n = el.cloneNode(true); n.dataset.clone = '1'; n.setAttribute('aria-hidden', 'true'); n.removeAttribute('tabindex'); n.removeAttribute('role'); n.removeAttribute('aria-label'); track.appendChild(n);
      });
      wrap(); paint();
    }

    function frame(t) {
      if (!lastT) lastT = t;
      const dt = Math.min((t - lastT) / 1000, 0.05); lastT = t;
      if (visible && !drag && setW && !window.mqPaused && !held) {
        x += (dir * speed + vx) * dt;          // vitesse auto + élan du dernier balayage
        vx *= Math.pow(0.03, dt);              // l'élan s'éteint en douceur, sans à-coup
        if (Math.abs(vx) < 1) vx = 0;
        wrap(); paint();
      }
      requestAnimationFrame(frame);
    }

    root.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      drag = true; moved = false; startX = lastX = e.clientX; startPos = x; lastTm = performance.now(); v = 0; vx = 0;
    });
    root.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; root.classList.add('grab'); try { root.setPointerCapture(e.pointerId); } catch (_) {} }
      if (!moved) return;
      x = startPos + dx; wrap(); paint();
      const now = performance.now(), d = (now - lastTm) / 1000;
      if (d > 0.016) { v = (e.clientX - lastX) / d; lastX = e.clientX; lastTm = now; }
    });
    const end = () => {
      if (!drag) return; drag = false; root.classList.remove('grab');
      if (moved) vx = Math.max(-2500, Math.min(2500, v - dir * speed));   // raccord sans saut avec la vitesse auto
    };
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => root.addEventListener(ev, end));
    root.addEventListener('dragstart', e => e.preventDefault());
    root.addEventListener('focusin', e => {          // navigation au clavier : on arrête le défilement et on ramène la carte dans le cadre
      const c = e.target.closest('.mcard'); if (!c) return;
      try { if (!e.target.matches(':focus-visible')) return; } catch (_) {}
      held = true; root.scrollLeft = 0;
      const rr = root.getBoundingClientRect(), cr = c.getBoundingClientRect();
      if (cr.left < rr.left) x += rr.left - cr.left + 8; else if (cr.right > rr.right) x -= cr.right - rr.right + 8;
      wrap(); paint();
    });
    root.addEventListener('focusout', () => { held = false; });
    root.addEventListener('click', e => { if (moved && e.detail !== 0) return; const c = e.target.closest('.mcard'); if (c && window.openLightbox) window.openLightbox(root, c); });

    new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(root);
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 150); });
    build(); requestAnimationFrame(frame);
  });
})();

/* Agrandissement d'une photo : toucher / cliquer, flèches, balayage, Échap */
(function () {
  let box, img, cap, list = [], idx = 0, x0 = null, opener = null;
  function build() {
    box = document.createElement('div'); box.className = 'lb'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Agrandissement de la photo');
    box.innerHTML = '<button class="lb-x" aria-label="Fermer">&times;</button><button class="lb-p" aria-label="Précédente">&#8249;</button><figure><img alt=""><figcaption></figcaption></figure><button class="lb-n" aria-label="Suivante">&#8250;</button>';
    document.body.appendChild(box); img = box.querySelector('img'); cap = box.querySelector('figcaption');
    box.addEventListener('click', e => { if (e.target.closest('.lb-p')) go(-1); else if (e.target.closest('.lb-n')) go(1); else if (!e.target.closest('img')) close(); });
    box.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', e => { if (x0 === null) return; const d = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(d) > 50) go(d < 0 ? 1 : -1); });
    document.addEventListener('keydown', e => { if (box.hidden) return; if (e.key === 'Escape') close();
      if (e.key === 'Tab') { const fs = Array.from(box.querySelectorAll('button')), i = fs.indexOf(document.activeElement); e.preventDefault(); fs[(i + (e.shiftKey ? -1 : 1) + fs.length) % fs.length].focus(); } if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); });
  }
  function show() {
    const c = list[idx], im = c.querySelector('img'), b = c.querySelector('b'), s = c.querySelector('span');
    img.src = c.dataset.full || im.src; img.alt = im.alt;
    cap.textContent = (b ? b.textContent : '') + (s ? ' · ' + s.textContent : '');
  }
  function go(d) { idx = (idx + d + list.length) % list.length; show(); }
  function close() { box.hidden = true; document.body.style.overflow = ''; img.removeAttribute('src'); if (opener && opener.focus) { try { opener.focus({ preventScroll: true }); } catch (_) {} } opener = null; }
  window.openLightbox = function (group, card) {
    if (!box) build();
    list = Array.from(group.querySelectorAll('.mcard:not([data-clone])')).filter(c => !c.classList.contains('hide'));
    idx = card.dataset.i ? +card.dataset.i : list.indexOf(card); if (idx < 0) idx = 0;
    opener = document.activeElement; show(); box.hidden = false; document.body.style.overflow = 'hidden'; box.querySelector('.lb-x').focus();
  };
  document.addEventListener('click', e => { const c = e.target.closest('.mstatic .mcard, .mgrid .mcard'); if (c) window.openLightbox(c.parentElement, c); });
})();

/* Accessibilité et mesure : activation des cartes au clavier, pause du défilement, suivi des clics */
(function () {
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const c = e.target.closest && e.target.closest('.mcard'); if (!c) return;
    e.preventDefault(); c.click();
  });
  const mp = document.getElementById('mpause');
  if (mp) {
    const label = mp.querySelector('span'), use = mp.querySelector('use');
    const set = p => { window.mqPaused = p; label.textContent = p ? 'Lecture' : 'Pause'; use.setAttribute('href', p ? '#i-play' : '#i-pause');
      mp.setAttribute('aria-label', p ? 'Relancer le défilement des photos' : 'Mettre en pause le défilement des photos'); };
    mp.addEventListener('click', () => set(!window.mqPaused));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) set(true);
  }
  /* Suivi : envoie l'événement à l'outil de mesure s'il est installé (Plausible, Umami ou Google Analytics), sinon ne fait rien */
  window.vbTrack = function (name) {
    try { if (window.plausible) window.plausible(name); else if (window.umami) window.umami.track(name); else if (window.gtag) window.gtag('event', name); } catch (_) {}
  };
  document.addEventListener('click', e => { const t = e.target.closest('[data-track]'); if (t) window.vbTrack(t.dataset.track); });
})();
