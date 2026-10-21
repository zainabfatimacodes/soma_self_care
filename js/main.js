/* SOMA — shared behaviour: theme, header, footer, reveal, tilt, tabs, counters, checklists */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem('soma-' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('soma-' + k, JSON.stringify(v)); } catch (e) {} }
  };
  window.SOMA = { $, $$, store };

  /* theme */
  const root = document.documentElement;
  const setTheme = t => { root.dataset.theme = t; store.set('theme', t); window.dispatchEvent(new Event('themechange')); };
  if (!root.dataset.theme) root.dataset.theme = store.get('theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  root.dataset.aud = store.get('aud', 'all');

  /* pages */
  const PAGES = [
    ['home', 'index.html', 'Home', 'var(--c-home)'],
    ['skin', 'skin.html', 'Skin & Beauty', 'var(--c-skin)'],
    ['fit', 'fitness.html', 'Fitness', 'var(--c-fit)'],
    ['health', 'health.html', 'Health', 'var(--c-health)'],
    ['groom', 'grooming.html', 'Grooming', 'var(--c-groom)'],
    ['tools', 'tools.html', 'Tools', 'var(--c-tools)'],
    ['journal', 'journal.html', 'Journal', 'var(--c-journal)']
  ];
  const cur = document.body.dataset.page;
  const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const mark = '<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15" stroke="currentColor" stroke-width="1.4"/><path d="M16 4c-6 5-6 19 0 24 6-5 6-19 0-24Z" fill="var(--accent)"/><path d="M4 16c5 6 19 6 24 0" stroke="currentColor" stroke-width="1.4"/></svg>';

  const hdr = $('#site-header');
  if (hdr) {
    hdr.className = 'hdr';
    hdr.innerHTML = `<nav class="nav" aria-label="Main">
      <a class="logo" href="index.html" aria-label="Soma home">${mark}<span>Soma<i>.</i></span></a>
      <div class="links">${PAGES.slice(1).map(p => `<a href="${p[1]}" style="--dot:${p[3]}" class="${p[0] === cur ? 'on' : ''}">${p[2]}</a>`).join('')}</div>
      <div class="nav-r">
        <button class="ico" id="theme" aria-label="Toggle light and dark mode"><svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg><svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/></svg></button>
        <a class="btn btn-p" href="tools.html">Build my ritual ${arrow}</a>
        <button class="ico burger" id="burger" aria-label="Menu" aria-expanded="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 9h16M4 15h16"/></svg></button>
      </div></nav>
      <div class="mm" id="mm" style="pointer-events:auto">${PAGES.map((p, i) => `<a href="${p[1]}" style="--dot:${p[3]}">${p[2]}<small>0${i + 1}</small></a>`).join('')}</div>`;
    $('#theme').onclick = () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    const mm = $('#mm'), bg = $('#burger');
    bg.onclick = () => { const o = mm.classList.toggle('open'); bg.setAttribute('aria-expanded', o); document.body.style.overflow = o ? 'hidden' : ''; };
    $$('a', mm).forEach(a => a.onclick = () => { mm.classList.remove('open'); document.body.style.overflow = ''; });
    addEventListener('scroll', () => hdr.classList.toggle('sm', scrollY > 40), { passive: true });
  }

  const ftr = $('#site-footer');
  if (ftr) {
    ftr.className = 'ftr';
    ftr.innerHTML = `<div class="wrap">
      <div class="ftr-top">
        <div><p class="ftr-lead">Small rituals. <em>Real</em> results.</p></div>
        <div><h4>Chapters</h4>${PAGES.slice(1, 5).map(p => `<a href="${p[1]}">${p[2]}</a>`).join('')}</div>
        <div><h4>Use</h4><a href="tools.html">Skin quiz</a><a href="tools.html#tracker">Habit tracker</a><a href="tools.html#calc">Calculators</a><a href="fitness.html#timer">Workout timer</a></div>
        <div><h4>Soma</h4><a href="journal.html">Journal</a><a href="journal.html#contact">Contact</a><a href="journal.html#faq">FAQ</a></div>
      </div>
      <div class="word" aria-hidden="true">Soma</div>
      <div class="disc"><span>© 2026 Soma. Made with care.</span><span>Soma shares general wellness information, not medical advice. See a qualified professional for personal health concerns.</span></div></div>`;
  }

  /* audience switch */
  $$('.aud-switch').forEach(sw => {
    const sync = () => $$('button', sw).forEach(b => b.classList.toggle('on', b.dataset.aud === root.dataset.aud));
    $$('button', sw).forEach(b => b.onclick = () => { root.dataset.aud = b.dataset.aud; store.set('aud', b.dataset.aud); $$('.aud-switch').forEach(s => $$('button', s).forEach(x => x.classList.toggle('on', x.dataset.aud === root.dataset.aud))); });
    sync();
  });

  /* reveal */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach(el => io.observe(el));

  /* tilt */
  if (matchMedia('(hover:hover)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    $$('.tilt').forEach(el => {
      const max = +(el.dataset.tilt || 7);
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.classList.add('hot');
        el.style.transform = `perspective(1000px) rotateX(${(.5 - y) * max}deg) rotateY(${(x - .5) * max}deg) translateZ(0)`;
        el.style.setProperty('--mx', x * 100 + '%'); el.style.setProperty('--my', y * 100 + '%');
      });
      el.addEventListener('pointerleave', () => { el.classList.remove('hot'); el.style.transform = ''; });
    });
  }

  /* tabs */
  $$('[data-tabs]').forEach(box => {
    const btns = $$('[data-tab]', box), panels = $$('[data-panel]', box);
    const show = id => { btns.forEach(b => { const on = b.dataset.tab === id; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); }); panels.forEach(p => p.classList.toggle('on', p.dataset.panel === id)); };
    btns.forEach(b => b.onclick = () => show(b.dataset.tab));
    show(btns[0].dataset.tab);
  });

  /* flip cards */
  $$('.flip').forEach(f => { f.tabIndex = 0; f.onclick = () => f.classList.toggle('on'); f.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f.classList.toggle('on'); } }; });

  /* counters */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, suf = el.dataset.suf || '', t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / 1600), v = 1 - Math.pow(1 - k, 4); el.textContent = Math.round(to * v).toLocaleString() + suf; if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .5 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* checklists with progress ring */
  $$('[data-checklist]').forEach(list => {
    const key = 'chk-' + list.dataset.checklist, day = new Date().toDateString();
    let st = store.get(key, {}); if (st.day !== day) st = { day, done: {} };
    const boxes = $$('input[type=checkbox]', list), ring = $(`.ring[data-for="${list.dataset.checklist}"]`);
    const paint = () => { const n = boxes.filter(b => b.checked).length, p = Math.round(n / boxes.length * 100); if (ring) { ring.style.setProperty('--p', p); $('b', ring).textContent = p + '%'; } };
    boxes.forEach((b, i) => { b.checked = !!st.done[i]; b.onchange = () => { st.done[i] = b.checked; store.set(key, st); paint(); }; });
    paint();
  });

  /* newsletter */
  $$('.news form').forEach(f => f.onsubmit = e => { e.preventDefault(); f.style.display = 'none'; const ok = f.parentNode.querySelector('.ok'); if (ok) ok.style.display = 'block'; });

  /* smooth anchor offset */
  if (location.hash) setTimeout(() => { const t = $(location.hash); if (t) t.scrollIntoView(); }, 60);
})();
