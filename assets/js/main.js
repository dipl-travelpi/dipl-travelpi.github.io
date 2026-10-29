// TravelPi – Projekt-Website: Theme, Navigation, Cursor-Raster, Explosionsdarstellung, Meilensteine.
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  // ---------- Light / Dark ----------
  var themeBtn = document.querySelector('.theme-toggle');
  themeBtn.addEventListener('click', function () {
    var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // ---------- Navigation ----------
  var nav = document.querySelector('.nav');
  var menuBtn = document.querySelector('.menu-toggle');
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });

  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function updateNav() {
    nav.classList.toggle('is-scrolled', window.scrollY > 8);
    var current = -1;
    sections.forEach(function (s, i) {
      if (s && s.getBoundingClientRect().top < window.innerHeight * 0.4) current = i;
    });
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === current); });
  }

  // ---------- Karo-Raster folgt dem Cursor ----------
  var glow = document.querySelector('.grid-glow');
  if (!reduceMotion && matchMedia('(hover: hover)').matches) {
    var mx = 0, my = 0, glowQueued = false;
    window.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      glow.classList.add('is-on');
      if (!glowQueued) {
        glowQueued = true;
        requestAnimationFrame(function () {
          glow.style.setProperty('--mx', mx + 'px');
          glow.style.setProperty('--my', my + 'px');
          glowQueued = false;
        });
      }
    }, { passive: true });
    document.addEventListener('pointerleave', function () { glow.classList.remove('is-on'); });
  }

  // ---------- Explosionsdarstellung ----------
  // Versatz jedes Bauteils (in SVG-Einheiten) im zusammengeschobenen Zustand.
  // Explosion 1 = Ansicht wie am Plakat.
  var OFFSETS = {
    lid: [0, 190],
    // Schrauben sitzen im zusammengebauten Zustand genau in den Löchern des Deckels
    screws: [0, 309.3],
    board: [0, 0],
    sd: [72, 42],
    wifi: [-110, -63],
    case: [0, -150]
  };
  var MIN_EXPLODE = 0.3;
  var track = document.querySelector('.hero-track');
  var stage = document.querySelector('.pi-stage');
  var tilt = document.querySelector('.pi-tilt');
  var hint = document.querySelector('.scroll-hint');
  var svg = document.querySelector('.pi-svg');
  var parts = {};
  document.querySelectorAll('.pi-svg .part').forEach(function (g) {
    parts[g.getAttribute('class').replace('part part-', '')] = g;
  });
  var labels = document.querySelectorAll('.pi-svg .lbl');
  var screwClips = document.querySelectorAll('#screw-clip rect');
  var pinned = matchMedia('(min-width: 960px) and (min-height: 620px)');

  function scrollProgress() {
    if (reduceMotion) return 1;
    if (pinned.matches) {
      var r = track.getBoundingClientRect();
      return clamp(-r.top / (track.offsetHeight - window.innerHeight) * 1.25, 0, 1);
    }
    var s = stage.getBoundingClientRect();
    var center = s.top + s.height / 2;
    return clamp((window.innerHeight * 0.85 - center) / (window.innerHeight * 0.45), 0, 1);
  }

  var target = scrollProgress(), shown = target;
  function renderPi(p) {
    var e = MIN_EXPLODE + (1 - MIN_EXPLODE) * (1 - Math.pow(1 - p, 2));
    var k = 1 - e;
    Object.keys(OFFSETS).forEach(function (name) {
      var g = parts[name];
      if (g) g.setAttribute('transform', 'translate(' + (OFFSETS[name][0] * k).toFixed(1) + ' ' + (OFFSETS[name][1] * k).toFixed(1) + ')');
    });
    // Schraubenschaft unterhalb der Lochmitte ausblenden (steckt im Deckel)
    var sink = (OFFSETS.lid[1] - OFFSETS.screws[1]) * k;
    screwClips.forEach(function (r) {
      r.setAttribute('height', (+r.dataset.hole + sink - 300).toFixed(1));
    });
    if (parts.guides) parts.guides.style.opacity = clamp((e - 0.75) / 0.25, 0, 1);
    var labelOpacity = clamp((p - 0.7) / 0.3, 0, 1);
    labels.forEach(function (l) {
      var o = OFFSETS[l.dataset.part];
      l.setAttribute('transform', 'translate(' + (o[0] * k).toFixed(1) + ' ' + (o[1] * k).toFixed(1) + ')');
      l.style.opacity = labelOpacity;
    });
    if (hint) hint.style.opacity = 1 - clamp(p / 0.3, 0, 1);
    // zusammengebaut etwas größer, zum Zerlegen herauszoomen
    svg.style.setProperty('--zoom', (1.28 - 0.28 * p).toFixed(3));
  }

  var animating = false;
  function tick() {
    shown += (target - shown) * 0.14;
    if (Math.abs(target - shown) < 0.001) shown = target;
    renderPi(shown);
    if (shown !== target) requestAnimationFrame(tick);
    else animating = false;
  }
  // Karo in der Kontakt-Karte: 1 = Karte kommt unten ins Bild, 0 = ganz nach unten gescrollt (flach)
  var contact = document.querySelector('.contact');
  function updateParallax() {
    if (reduceMotion) return;
    var r = contact.getBoundingClientRect();
    if (r.top > window.innerHeight) return;
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var topAtEnd = r.top + window.scrollY - maxScroll;
    var p = clamp((window.innerHeight - r.top) / (window.innerHeight - topAtEnd), 0, 1);
    contact.style.setProperty('--p', (1 - p).toFixed(3));
  }

  function onScroll() {
    updateNav();
    updateParallax();
    target = scrollProgress();
    if (!animating) { animating = true; requestAnimationFrame(tick); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  renderPi(shown);
  updateNav();
  updateParallax();

  // Leichtes Mitneigen zum Cursor
  if (!reduceMotion && matchMedia('(hover: hover)').matches) {
    window.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var x = clamp((e.clientX - (r.left + r.width / 2)) / window.innerWidth, -0.5, 0.5);
      var y = clamp((e.clientY - (r.top + r.height / 2)) / window.innerHeight, -0.5, 0.5);
      tilt.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg');
      tilt.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
    }, { passive: true });
  }

  // ---------- Meilensteine ----------
  var items = Array.prototype.slice.call(document.querySelectorAll('.milestones li'));
  var done = items.filter(function (li) { return li.dataset.status === 'done'; }).length;
  var active = items.filter(function (li) { return li.dataset.status === 'active'; }).length;
  var total = items.length;
  var summary = document.querySelector('.ms-summary');
  summary.querySelector('.ms-done').textContent = done;
  summary.querySelector('.ms-total').textContent = '/ ' + total;
  var bar = summary.querySelector('.ms-bar');
  bar.setAttribute('aria-valuenow', done);
  bar.setAttribute('aria-valuemax', total);
  bar.style.setProperty('--done', (done / total * 100) + '%');
  bar.style.setProperty('--active', (active / total * 100) + '%');
  // Linie der Zeitleiste bis zum aktuellen Meilenstein füllen
  var lineTo = done + active > 0 ? (done + active - 0.5) / total : 0;
  document.querySelector('.milestones').style.setProperty('--line', (lineTo * 100) + '%');

  var next = items.filter(function (li) { return li.dataset.status !== 'done'; })[0];
  var nextBox = summary.querySelector('.ms-next');
  if (next) {
    var time = next.querySelector('time');
    var dateText = time.textContent;
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var days = Math.round((new Date(time.getAttribute('datetime') + 'T00:00:00') - today) / 86400000);
    if (days === 0) dateText += ' · heute';
    else if (days === 1) dateText += ' · morgen';
    else if (days > 1 && days <= 60) dateText += ' · in ' + days + ' Tagen';
    nextBox.querySelector('.ms-next-title').textContent = next.querySelector('.ms-title').textContent;
    nextBox.querySelector('.ms-next-date').textContent = dateText;
  } else {
    nextBox.hidden = true;
  }

  // ---------- Einblenden beim Scrollen ----------
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    // Geschwister nacheinander einblenden
    reveals.forEach(function (el) {
      var sib = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--d', Math.min(sib, 6) * 0.06 + 's');
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
