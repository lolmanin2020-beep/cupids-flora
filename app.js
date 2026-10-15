(function () {
  'use strict';

  const C = window.CONTENT;
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const UNLOCK_KEY = 'anniversary-unlocked';
  const PAGES = ['menu', 'letter', 'flowers', 'song', 'memories'];
  // Add ?motion=full to the address to preview every animation on a device set to reduce motion.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    !/[?&]motion=full\b/.test(location.search);
  document.documentElement.classList.toggle('reduce-motion', reduceMotion);

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const thumbOf = (src) => src.replace(/^photos\//, 'thumbs/');

  function isUnlocked() {
    try { return sessionStorage.getItem(UNLOCK_KEY) === '1'; } catch (e) { return false; }
  }
  function rememberUnlock() {
    try { sessionStorage.setItem(UNLOCK_KEY, '1'); } catch (e) { /* private mode: ask again next time */ }
  }

  /* Scenes */
  const onEnter = {};
  const onLeave = {};
  let current = null;

  function show(id) {
    const next = document.getElementById(id);
    if (!next || next === current) return;
    const prev = current;
    current = next;
    if (prev) {
      prev.classList.remove('is-active');
      if (onLeave[prev.id]) onLeave[prev.id]();
      setTimeout(() => { if (current !== prev) prev.hidden = true; }, 460);
    }
    next.hidden = false;
    next.scrollTop = 0;
    void next.offsetWidth;
    next.classList.add('is-active');
    if (onEnter[id]) onEnter[id]();
    petals.pace(PETAL_PACE[id]);
  }

  function route() {
    // Locked: the heart comes first, then the code. Stay put if she is already on one of them.
    if (!isUnlocked()) { if (!current) show('heart'); return; }
    const page = location.hash.slice(1);
    show(PAGES.includes(page) ? page : 'menu');
  }

  /* 0. Heart: fills while it is held, drains slowly when let go */
  function initHeart() {
    const wrap = $('.heart');
    const button = $('#heart-button');
    const liquid = $('#heart-level');
    const art = $('svg', button);
    const cue = $('#heart-cue');
    const FILL = 2600;   // ms of holding to fill it
    const DRAIN = 7000;  // ms to empty again, slow enough that short presses still add up
    let amount = 0;
    let holding = false;
    let done = false;
    let last = 0;
    let frame = 0;

    function paint() {
      liquid.style.transform = 'translateY(' + (188 - amount * 196).toFixed(1) + 'px)';
      art.style.transform = 'scale(' + (1 + amount * .06).toFixed(3) + ')';
    }

    function finish() {
      done = true;
      holding = false;
      frame = 0;
      wrap.classList.remove('is-holding');
      wrap.classList.add('is-full');
      cue.textContent = C.heart.full;
      petals.burst(26);
      setTimeout(() => show('gate'), 1500);
    }

    function tick(now) {
      // Capped so a stalled frame cannot fill it in one jump, but loose enough that a slow phone keeps time.
      const step = Math.min(now - last, 250);
      last = now;
      amount = Math.max(0, Math.min(1, amount + (holding ? step / FILL : -step / DRAIN)));
      paint();
      if (amount >= 1) { finish(); return; }
      frame = holding || amount > 0 ? requestAnimationFrame(tick) : 0;
    }

    function press() {
      if (done) return;
      holding = true;
      wrap.classList.add('is-holding');
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    }
    function release() {
      holding = false;
      wrap.classList.remove('is-holding');
    }

    button.addEventListener('pointerdown', (e) => {
      try { button.setPointerCapture(e.pointerId); } catch (err) { /* not a real pointer */ }
      press();
    });
    ['pointerup', 'pointercancel', 'lostpointercapture', 'blur'].forEach((type) => button.addEventListener(type, release));
    button.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) press(); });
    button.addEventListener('keyup', release);
    button.addEventListener('contextmenu', (e) => e.preventDefault());

    onEnter.heart = () => {
      amount = 0;
      done = false;
      wrap.classList.remove('is-full', 'is-holding');
      cue.textContent = C.heart.cue;
      paint();
    };
  }

  /* 1. Lock */
  function initGate() {
    const wrap = $('#code');
    const input = $('#code-input');
    const boxes = $$('.code__box', wrap);
    const msg = $('#gate-msg');
    $('#gate-hint').textContent = 'Hint: ' + C.hint;

    function paint() {
      const value = input.value;
      const focused = document.activeElement === input;
      boxes.forEach((box, i) => {
        box.textContent = value[i] || '';
        box.classList.toggle('is-next', focused && i === Math.min(value.length, boxes.length - 1));
      });
    }

    function check() {
      if (input.value === String(C.passcode)) {
        wrap.classList.add('is-right');
        input.blur();
        rememberUnlock();
        setTimeout(() => show('envelope'), 700);
        return;
      }
      wrap.classList.add('is-wrong');
      msg.textContent = "Not quite. Try day, month, year.";
      setTimeout(() => {
        wrap.classList.remove('is-wrong');
        input.value = '';
        paint();
      }, 500);
    }

    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(0, boxes.length);
      if (input.value) msg.textContent = '';
      paint();
      if (input.value.length === boxes.length) check();
    });
    input.addEventListener('focus', paint);
    input.addEventListener('blur', paint);

    onEnter.gate = () => {
      wrap.classList.remove('is-right');
      input.value = '';
      paint();
    };
  }

  /* 2. Envelope */
  function initEnvelope() {
    const env = $('#env');
    const wrap = env.parentElement;
    $('#envelope-to').textContent = 'For ' + C.to;

    if (C.sealInitials) {
      $('#seal-initials').textContent = C.sealInitials;
      $('#seal-heart').setAttribute('display', 'none');
    }

    env.addEventListener('click', () => {
      if (wrap.classList.contains('is-open')) return;
      wrap.classList.add('is-open');
      // Once the letter is out, roses bloom from it and cover the screen.
      const box = env.getBoundingClientRect();
      setTimeout(() => roseCover.bloom(box.left + box.width / 2, box.top + box.height * .3, () => show('reveal')), 1500);
    });

    onEnter.envelope = () => wrap.classList.remove('is-open');
  }

  /* 3. Reveal */
  const petals = (function () {
    const COLORS = ['#a51e27', '#c9434c', '#e9aeb0', '#f3e6cb', '#c9a356'];
    const field = $('#petal-field');
    let timer = null;

    function spawn() {
      const petal = document.createElement('div');
      petal.className = 'petal';
      const size = 10 + Math.random() * 18;
      const rotateStart = Math.random() * 360;
      const spin = (Math.random() * 360 + 180) * (Math.random() < 0.5 ? -1 : 1);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      petal.style.setProperty('--start-x', Math.random() * 100 + 'vw');
      petal.style.setProperty('--drift', Math.random() * 160 - 80 + 'px');
      petal.style.setProperty('--duration', 8 + Math.random() * 7 + 's');
      petal.style.setProperty('--rotate-start', rotateStart + 'deg');
      petal.style.setProperty('--rotate-end', rotateStart + spin + 'deg');
      petal.style.width = size + 'px';
      petal.style.height = size + 'px';
      petal.innerHTML =
        '<svg viewBox="0 0 16 16" width="100%" height="100%">' +
        '<path d="M8,0 C14,4 14,12 8,16 C2,12 2,4 8,0 Z" fill="' + color + '"/></svg>';
      field.appendChild(petal);
      petal.addEventListener('animationend', () => petal.remove());
    }

    return {
      // Milliseconds between petals; nothing (or a device set to reduce motion) means none.
      pace(gap) {
        clearInterval(timer);
        timer = null;
        if (gap && !reduceMotion) timer = setInterval(spawn, gap);
      },
      burst(count) {
        if (reduceMotion) return;
        for (let i = 0; i < count; i++) setTimeout(spawn, i * 70);
      }
    };
  })();
  // Thick during the reveal, a light drift on every page after it, none before the envelope opens.
  const PETAL_PACE = { reveal: 260, menu: 520, letter: 900, flowers: 520, song: 520, memories: 900 };

  function initReveal() {
    const wrap = $('#reveal-inner');
    const svg = $('#reveal-script');
    const lines = C.reveal.lines;
    const LETTER_GAP = 95;
    const LINE_HEIGHT = 112;
    let letters = 0;
    let doneTimer = null;

    svg.setAttribute('aria-label', lines.join(' '));
    lines.forEach((line, row) => {
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('x', '0');
      text.setAttribute('y', String(row * LINE_HEIGHT));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'url(#gold-ink)');
      Array.from(line).forEach((ch) => {
        const span = document.createElementNS(SVG_NS, 'tspan');
        span.textContent = ch;
        span.style.animationDelay = letters * LETTER_GAP + 'ms';
        letters++;
        text.appendChild(span);
      });
      svg.appendChild(text);
    });
    $('#reveal-sub').textContent = C.reveal.sub;
    $('#reveal-dates').textContent = C.reveal.dates;

    function fit() {
      const box = svg.getBBox();
      if (!box.width) return;
      svg.setAttribute('viewBox', [box.x - 16, box.y - 8, box.width + 32, box.height + 16].join(' '));
    }

    function write() {
      fit();
      wrap.classList.remove('is-waiting');
      if (reduceMotion) { wrap.classList.add('is-done'); return; }
      wrap.classList.add('is-writing');
      petals.burst(34);
      doneTimer = setTimeout(() => wrap.classList.add('is-done'), letters * LETTER_GAP + 1300);
    }

    onEnter.reveal = () => {
      wrap.classList.remove('is-writing', 'is-done');
      wrap.classList.add('is-waiting');
      let started = false;
      const start = () => { if (!started && current && current.id === 'reveal') { started = true; write(); } };
      // The script face must be in before the letters are measured and drawn.
      if (document.fonts && document.fonts.load) {
        document.fonts.load('100px "Pinyon Script"').then(start, start);
        setTimeout(start, 1500);
      } else {
        start();
      }
    };
    onLeave.reveal = () => clearTimeout(doneTimer);

    $('#reveal-next').addEventListener('click', () => {
      if (location.hash === '#menu') show('menu'); else location.hash = 'menu';
    });
  }

  /* 4. Menu */
  function initMenu() {
    $('#gift-bouquet').innerHTML = bouquetMarkup(0);

    const snaps = $('#gift-snaps');
    C.letter.photos.slice(0, 2).forEach((src) => {
      const img = document.createElement('img');
      img.src = thumbOf(src);
      img.alt = '';
      snaps.appendChild(img);
    });

    $('#replay').addEventListener('click', () => {
      history.replaceState(null, '', location.pathname + location.search);
      show('envelope');
    });
  }

  /* 5. Letter */
  function initLetter() {
    const photos = C.letter.photos;
    const strip = $('#letter-photos');
    photos.forEach((src, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'snap';
      btn.setAttribute('aria-label', 'Enlarge photo ' + (i + 1) + ' of ' + photos.length);
      const img = document.createElement('img');
      img.src = thumbOf(src);
      img.alt = '';
      btn.appendChild(img);
      btn.addEventListener('click', () => lightbox.open(photos, i));
      strip.appendChild(btn);
    });

    $('#letter-greeting').textContent = C.letter.greeting;
    const body = $('#letter-body');
    C.letter.paragraphs.forEach((para) => {
      const p = document.createElement('p');
      p.textContent = para;
      body.appendChild(p);
    });
    $('#letter-signoff').textContent = C.letter.signoff;
    $('#letter-name').textContent = C.from;
  }

  /* 6. Flowers: a dome of red roses in black paper, drawn in code */
  const ROSE_COUNT = 124;
  const DOME = { cx: 170, cy: 150, rx: 132, ry: 104 };

  // Same "random" bouquet on every visit.
  function seeded(seed) {
    return function () {
      seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // One rose seen from above: rings of overlapping petals, darker at the heart, lit on the rolled edges.
  function roseImage(variant) {
    const PETAL = 'M-25 7 C-32 -14 -19 -31 0 -33 C19 -31 32 -14 25 7 C14 15 -14 15 -25 7 Z';
    const LIP = 'M-23 -6 C-21 -23 -11 -31 0 -32 C11 -31 21 -23 23 -6';
    const rings = [
      { n: 5 + (variant % 2), dist: 19, size: 1 },
      { n: 5, dist: 14.5, size: .8 },
      { n: 4, dist: 10, size: .62 },
      { n: 3, dist: 6.5, size: .46 },
      { n: 3, dist: 3.5, size: .31 }
    ];
    let petals = '';
    let turn = variant * 41;
    rings.forEach((ring, r) => {
      for (let i = 0; i < ring.n; i++) {
        petals += '<g transform="rotate(' + (turn + i * 360 / ring.n).toFixed(1) + ') translate(0 ' + -ring.dist + ') scale(' + ring.size + ')">' +
          '<path d="' + PETAL + '" fill="url(#p' + (r % 2) + ')" stroke="#1a0003" stroke-opacity=".7" stroke-width="' + (1.3 / ring.size).toFixed(2) + '"/>' +
          '<path d="' + LIP + '" fill="none" stroke="#ff8a9a" stroke-opacity="' + (.5 - r * .05) + '" stroke-width="' + (1.5 / ring.size).toFixed(2) + '" stroke-linecap="round"/></g>';
      }
      turn += 180 / ring.n + 13;
    });
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="108" height="108" viewBox="-54 -54 108 108"><defs>' +
      '<linearGradient id="p0" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3a0007"/><stop offset=".55" stop-color="#a50d22"/><stop offset="1" stop-color="#e21d3b"/></linearGradient>' +
      '<linearGradient id="p1" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2e0005"/><stop offset=".6" stop-color="#8f0a1c"/><stop offset="1" stop-color="#cb1531"/></linearGradient>' +
      '<radialGradient id="lit" cx=".36" cy=".3" r=".75"><stop offset="0" stop-color="#ffd9d9" stop-opacity=".2"/><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></radialGradient>' +
      '</defs><circle r="47" fill="#3a0007"/>' + petals +
      '<circle r="5" fill="#1a0003" opacity=".75"/>' +
      '<path d="M-3.5 1 C-3.5 -4.5 3.5 -4.5 3.5 0 C3.5 3 -1 3.5 -1 1" fill="none" stroke="#a80f27" stroke-width="1.4" stroke-linecap="round"/>' +
      '<circle r="52" fill="url(#lit)"/></svg>';
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }
  const ROSES = [roseImage(0), roseImage(1), roseImage(2)];

  /* Roses bloom out of the envelope until they cover the screen; a tap parts them again.
     Drawn on one canvas so a hundred-odd roses stay smooth on a phone. */
  const roseCover = (function () {
    const cover = $('#rose-cover');
    const canvas = $('canvas', cover);
    const ctx = canvas.getContext('2d');
    const BLOOM = 760;    // ms for one rose to open
    const SPREAD = 1350;  // ms for the bloom to travel from the envelope to the farthest corner
    const PART = 520;     // ms for one rose to close when the cover parts
    // Big screens (PC, iPad) get the same pixel load as a phone, so the bloom stays smooth everywhere.
    const MAX_PIXELS = 2.4e6;
    const SPRITE = 512;
    const sprites = ROSES.map((uri) => {
      const sprite = document.createElement('canvas');
      sprite.width = sprite.height = SPRITE;
      const img = new Image();
      img.onload = () => {
        sprite.getContext('2d').drawImage(img, 0, 0, SPRITE, SPRITE);
        sprite.ready = true;
      };
      img.src = uri;
      return sprite;
    });
    // Roses that have finished opening are painted once onto this layer instead of every frame.
    const settled = document.createElement('canvas');
    const settledCtx = settled.getContext('2d');
    let settledCount = 0;
    let roses = [];
    let width = 0;
    let height = 0;
    let started = 0;
    let parting = false;
    let frame = 0;

    function plant(originX, originY) {
      const rand = seeded(1022);
      width = window.innerWidth;
      height = window.innerHeight;
      const scale = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(MAX_PIXELS / (width * height)));
      [canvas, settled].forEach((c) => {
        c.width = Math.round(width * scale);
        c.height = Math.round(height * scale);
      });
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      settledCtx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.imageSmoothingQuality = settledCtx.imageSmoothingQuality = 'medium';
      settledCount = 0;

      const step = Math.max(54, Math.min(width, height) / 6.5);
      const far = Math.hypot(Math.max(originX, width - originX), Math.max(originY, height - originY));
      roses = [];
      for (let row = 0, y = -step / 2; y < height + step; row++, y += step * .86) {
        for (let x = row % 2 ? 0 : -step / 2; x < width + step; x += step) {
          const px = x + (rand() - .5) * step * .45;
          const py = y + (rand() - .5) * step * .45;
          roses.push({
            x: px,
            y: py,
            size: step * (1.9 + rand() * .7),
            turn: rand() * Math.PI * 2,
            reach: Math.hypot(px - originX, py - originY) / far,
            jitter: rand() * 160,
            sprite: sprites[Math.floor(rand() * sprites.length)]
          });
        }
      }
      // Later roses sit on top of earlier ones, so the bloom piles outward from the envelope.
      roses.sort((a, b) => (a.reach * SPREAD + a.jitter) - (b.reach * SPREAD + b.jitter));
    }

    function progress(rose, elapsed) {
      const delay = rose.reach * (parting ? SPREAD * .7 : SPREAD) + rose.jitter;
      return Math.min(1, Math.max(0, (elapsed - delay) / (parting ? PART : BLOOM)));
    }

    // Opening overshoots a touch, like a bud springing; closing just folds away.
    // With reduce motion on, the roses fade in and out where they lie instead.
    function paintRose(c, rose, p) {
      const open = reduceMotion ? 1 : parting ? 1 - p * p : 1 + 2.2 * Math.pow(p - 1, 3) + 1.2 * Math.pow(p - 1, 2);
      const alpha = reduceMotion ? (parting ? 1 - p : p) : 1;
      if (open <= 0.01 || alpha <= 0.01) return;
      c.save();
      c.globalAlpha = alpha;
      c.translate(rose.x, rose.y);
      c.rotate(rose.turn - (1 - open) * 1.1);
      c.scale(open, open);
      c.drawImage(rose.sprite, -rose.size / 2, -rose.size / 2, rose.size, rose.size);
      c.restore();
    }

    function draw(now) {
      const elapsed = now - started;
      let moving = false;
      ctx.clearRect(0, 0, width, height);
      if (!parting) {
        // Roses finish in the same order they start, so finished ones can be baked onto the settled layer.
        while (settledCount < roses.length && progress(roses[settledCount], elapsed) >= 1) {
          paintRose(settledCtx, roses[settledCount], 1);
          settledCount++;
        }
        if (settledCount) ctx.drawImage(settled, 0, 0, width, height);
        for (let i = settledCount; i < roses.length; i++) {
          const p = progress(roses[i], elapsed);
          moving = true;
          if (p <= 0) break;
          paintRose(ctx, roses[i], p);
        }
      } else {
        roses.forEach((rose) => {
          const p = progress(rose, elapsed);
          if (p < 1) moving = true;
          paintRose(ctx, rose, p);
        });
      }
      if (moving) frame = requestAnimationFrame(draw);
    }

    function run() {
      cancelAnimationFrame(frame);
      started = performance.now();
      draw(started);
    }

    // Turning the phone while the roses are up: replant them for the new screen, fully open.
    window.addEventListener('resize', () => {
      if (!cover.classList.contains('is-full')) return;
      plant(window.innerWidth / 2, window.innerHeight / 2);
      started = performance.now() - 60000;
      draw(performance.now());
    });

    return {
      // Blooms from (originX, originY). onReveal runs when the cover is tapped.
      bloom(originX, originY, onReveal) {
        if (!sprites.every((sprite) => sprite.ready)) { onReveal(); return; }
        plant(originX, originY);
        parting = false;
        cover.classList.remove('is-full');
        cover.hidden = false;
        run();
        setTimeout(() => {
          cover.classList.add('is-full');
          cover.focus({ preventScroll: true });
        }, SPREAD + BLOOM + 260);

        cover.onclick = () => {
          if (!cover.classList.contains('is-full')) return;
          cover.classList.remove('is-full');
          cover.blur();
          parting = true;
          run();
          onReveal();
          setTimeout(() => { cover.hidden = true; }, SPREAD * .7 + PART + 260);
        };
      }
    };
  })();

  // Roses spread like sunflower seeds, then wrapped over a half-sphere so the edge ones turn away.
  function domeRoses(batches) {
    const rand = seeded(2210);
    const roses = [];
    for (let i = 0; i < ROSE_COUNT; i++) {
      const spread = Math.sqrt((i + .5) / ROSE_COUNT);
      const tilt = spread * 1.42;
      const reach = Math.sin(tilt) / Math.sin(1.42);
      const around = i * 2.39996;
      const x = DOME.cx + DOME.rx * reach * Math.cos(around);
      const y = DOME.cy + DOME.ry * reach * Math.sin(around);
      roses.push({
        reach: reach,
        batch: batches ? Math.floor(rand() * batches) : -1,
        delay: Math.round(rand() * 450),
        markup: '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' +
          (Math.atan2(y - DOME.cy, x - DOME.cx) * 180 / Math.PI).toFixed(1) + ') scale(' +
          (.5 + .5 * Math.cos(tilt)).toFixed(2) + ' 1) rotate(' + Math.round(rand() * 360) + ')">'
      });
      roses[i].image = '<image href="' + ROSES[Math.floor(rand() * ROSES.length)] + '" x="-19" y="-19" width="38" height="38"/></g></g>';
    }
    // Edge roses first, so the ones facing you sit on top.
    return roses.sort((a, b) => b.reach - a.reach).map((rose) =>
      rose.markup + '<g class="bloom' + (rose.batch < 0 ? '' : ' is-bud') + '" data-batch="' + rose.batch +
      '" style="transition-delay:' + rose.delay + 'ms">' + rose.image).join('');
  }

  // batches > 0: roses start as buds and open one batch at a time. 0: fully open.
  let bouquets = 0;
  function bouquetMarkup(batches) {
    const uid = 'bq' + (++bouquets) + '-';
    const sheet = ' stroke="#fff" stroke-opacity=".1" stroke-width=".8" stroke-linejoin="round"';
    const leaves = [200, 222, 246, 270, 294, 318, 342, 20, 160, 138].map((deg) => {
      const a = deg * Math.PI / 180;
      const x = (DOME.cx + (DOME.rx - 4) * Math.cos(a)).toFixed(1);
      const y = (DOME.cy - (DOME.ry - 4) * Math.sin(a)).toFixed(1);
      return '<ellipse cx="' + x + '" cy="' + y + '" rx="9" ry="20" fill="#1d3a22" transform="rotate(' + (90 - deg) + ' ' + x + ' ' + y + ')"/>';
    }).join('');

    return '<svg viewBox="0 0 340 400" aria-hidden="true"><defs>' +
      '<linearGradient id="' + uid + 'wrap-back" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b2b30"/><stop offset=".5" stop-color="#0b0b0d"/><stop offset="1" stop-color="#1c1c20"/></linearGradient>' +
      '<linearGradient id="' + uid + 'wrap-front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34343a"/><stop offset=".35" stop-color="#131316"/><stop offset="1" stop-color="#050506"/></linearGradient>' +
      '<linearGradient id="' + uid + 'satin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a81b2c"/><stop offset=".5" stop-color="#6a0d18"/><stop offset="1" stop-color="#8c1422"/></linearGradient>' +
      '<radialGradient id="' + uid + 'dome-shade" cx=".42" cy=".34" r=".72"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0a0002" stop-opacity=".62"/></radialGradient>' +
      '</defs>' +
      // paper behind the roses
      '<g fill="url(#' + uid + 'wrap-back)"' + sheet + '>' +
      '<path d="M22 190 L4 100 L48 38 L118 34 L170 150 Z"/><path d="M62 54 L108 6 L178 22 L170 150 Z"/>' +
      '<path d="M166 26 L238 2 L280 44 L170 150 Z"/><path d="M226 30 L298 42 L338 104 L318 190 L170 150 Z"/>' +
      '<path d="M2 150 L0 232 L60 262 L170 150 Z"/><path d="M338 150 L340 232 L280 262 L170 150 Z"/></g>' +
      '<ellipse cx="' + DOME.cx + '" cy="' + DOME.cy + '" rx="' + DOME.rx + '" ry="' + DOME.ry + '" fill="#33040a"/>' +
      leaves + domeRoses(batches) +
      '<ellipse cx="' + DOME.cx + '" cy="' + DOME.cy + '" rx="' + (DOME.rx + 14) + '" ry="' + (DOME.ry + 12) + '" fill="url(#' + uid + 'dome-shade)" pointer-events="none"/>' +
      // paper in front: a collar hugging the lower roses, gathered to the tie, then a skirt
      '<g fill="url(#' + uid + 'wrap-front)"' + sheet + '>' +
      '<path d="M124 300 L216 300 L262 372 L236 400 L196 384 L170 400 L140 384 L104 400 L78 372 Z"/>' +
      '<path d="M18 170 C56 216 108 238 170 238 C232 238 284 216 322 170 L338 196 L318 250 L268 262 L222 302 L118 302 L72 262 L22 250 L2 196 Z"/></g>' +
      '<path d="M18 170 L2 196 L22 250 L72 262 L58 214 Z" fill="#fff" opacity=".05"/>' +
      '<path d="M322 170 L338 196 L318 250 L268 262 L282 214 Z" fill="#000" opacity=".3"/>' +
      '<g fill="none" stroke="#fff" stroke-opacity=".09" stroke-width=".8">' +
      '<path d="M58 214 L72 262 L118 302"/><path d="M110 234 L146 302"/><path d="M230 234 L194 302"/><path d="M282 214 L268 262 L222 302"/>' +
      '<path d="M150 302 L140 384"/><path d="M190 302 L196 384"/><path d="M124 300 L78 372"/><path d="M216 300 L262 372"/></g>' +
      // satin bow: tails, drooping loops, upper loops with their shadowed insides, knot
      '<g stroke="#3d0610" stroke-width=".7" stroke-linejoin="round">' +
      '<g fill="#5c0a14"><path d="M166 308 L146 396 L156 400 L172 310 Z"/><path d="M174 308 L196 396 L186 400 L168 310 Z"/></g>' +
      '<g fill="url(#' + uid + 'satin)">' +
      '<path d="M164 306 L126 388 L138 394 L170 312 Z"/><path d="M176 306 L214 388 L202 394 L170 312 Z"/>' +
      '<path d="M168 308 L164 400 L174 396 L174 308 Z"/>' +
      '<path d="M170 306 C150 312 122 332 132 346 C144 354 162 326 170 306 Z"/>' +
      '<path d="M170 306 C190 312 218 332 208 346 C196 354 178 326 170 306 Z"/>' +
      '<path d="M170 304 C150 274 110 270 106 296 C104 316 146 316 170 304 Z"/>' +
      '<path d="M170 304 C190 274 230 270 234 296 C236 316 194 316 170 304 Z"/></g>' +
      '<g fill="#3d0610" stroke="none"><path d="M160 301 C146 287 122 285 119 297 C119 307 146 307 160 301 Z"/>' +
      '<path d="M180 301 C194 287 218 285 221 297 C221 307 194 307 180 301 Z"/></g>' +
      '<rect x="161" y="295" width="18" height="16" rx="5" fill="url(#' + uid + 'satin)"/></g>' +
      '<g fill="none" stroke="#f0667c" stroke-opacity=".5" stroke-width="1.1" stroke-linecap="round">' +
      '<path d="M112 290 C116 278 138 276 158 292"/><path d="M228 290 C224 278 202 276 182 292"/><path d="M165 299 L175 299"/></g>' +
      '</svg>';
  }

  const COUNT_WORDS = ['None', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];

  function initFlowers() {
    const reasons = C.reasons;
    const holder = $('#bouquet');
    const list = $('#reasons');
    const button = $('#reason-next');
    const count = $('#reason-count');
    let opened = 0;

    holder.innerHTML = bouquetMarkup(reasons.length);
    count.textContent = 'Every reason I love you opens more of them.';

    button.addEventListener('click', () => {
      if (opened >= reasons.length) return;
      $$('.bloom[data-batch="' + opened + '"]', holder).forEach((rose) => rose.classList.remove('is-bud'));
      petals.burst(24);

      // Newest note goes on top, so the button never scrolls away between taps.
      const note = document.createElement('li');
      note.className = 'reason';
      note.textContent = reasons[opened];
      list.prepend(note);
      opened++;
      count.textContent = COUNT_WORDS[opened] + ' of ' + COUNT_WORDS[reasons.length].toLowerCase();

      if (opened === reasons.length) {
        button.hidden = true;
        if (C.reasonsClosing) {
          count.textContent = C.reasonsClosing;
          count.classList.add('flowers__count--closing');
        }
      }
    });
  }

  /* 7. Song */
  function initSong() {
    const song = C.song;
    const frame = $('#song-frame');
    const deck = $('#deck');
    const link = String(song.link || '');
    const youtube = link.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/);
    const spotify = link.match(/open\.spotify\.com\/(?:[\w-]+\/)?(track|album|playlist)\/(\w+)/);
    let player = null;
    let mounted = false;

    $('#song-title').textContent = song.title || 'Our song';
    $('#song-artist').textContent = song.artist;
    $('#song-note').textContent = song.note;
    // Printed on the record's label
    $('#label-title').textContent = song.title || 'Our song';
    $('#label-artist').textContent = song.artist;
    $('#label-line').textContent = song.labelLine || '';

    function mountYouTube(id) {
      window.onYouTubeIframeAPIReady = () => {
        player = new window.YT.Player('song-player', {
          videoId: id,
          playerVars: { playsinline: 1, rel: 0 },
          events: {
            onStateChange: (e) => deck.classList.toggle('is-playing', e.data === window.YT.PlayerState.PLAYING)
          }
        });
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(script);
    }

    // Spotify's embed script reports play and pause, so the record can spin with the music.
    function mountSpotify(kind, id) {
      frame.classList.add('song__frame--spotify');
      window.onSpotifyIframeApiReady = (api) => {
        api.createController($('#song-player'), { uri: 'spotify:' + kind + ':' + id, width: '100%', height: 152 }, (controller) => {
          player = controller;
          controller.addListener('playback_update', (e) =>
            deck.classList.toggle('is-playing', !e.data.isPaused && !e.data.isBuffering));
        });
      };
      const script = document.createElement('script');
      script.src = 'https://open.spotify.com/embed/iframe-api/v1';
      // If the script is blocked, a plain player still works; the record just stays still.
      script.onerror = () => {
        frame.innerHTML = '<iframe title="Our song on Spotify" allow="encrypted-media" src="https://open.spotify.com/embed/' +
          kind + '/' + id + '"></iframe>';
      };
      document.head.appendChild(script);
    }

    onEnter.song = () => {
      if (mounted) return;
      mounted = true;
      if (youtube) {
        mountYouTube(youtube[1]);
      } else if (spotify) {
        mountSpotify(spotify[1], spotify[2]);
      } else {
        frame.classList.add('song__frame--empty');
        frame.textContent = 'The song plays here once its link is added.';
      }
    };
    onLeave.song = () => {
      if (!player) return;
      if (player.pauseVideo) player.pauseVideo();
      else if (player.pause) player.pause();
      deck.classList.remove('is-playing');
    };
  }

  /* 8. Memories */
  function initMemories() {
    const tabs = $('#tabs');
    const wall = $('#wall');
    const empty = $('#wall-empty');
    let albums = null;
    let active = null;

    function renderWall() {
      const album = albums.find((a) => a.category === active);
      wall.innerHTML = '';
      album.photos.forEach((src, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'shot';
        btn.setAttribute('aria-label', album.label + ', photo ' + (i + 1) + ' of ' + album.photos.length);
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = '';
        img.src = thumbOf(src);
        img.addEventListener('error', () => { if (img.src.indexOf(src) === -1) img.src = src; });
        btn.appendChild(img);
        btn.addEventListener('click', () => lightbox.open(album.photos, i));
        wall.appendChild(btn);
      });
    }

    function renderTabs() {
      tabs.innerHTML = '';
      albums.forEach((album) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tab';
        btn.textContent = album.label;
        btn.setAttribute('aria-pressed', String(album.category === active));
        btn.addEventListener('click', () => {
          active = album.category;
          renderTabs();
          renderWall();
        });
        tabs.appendChild(btn);
      });
    }

    onEnter.memories = () => {
      if (albums) return;
      fetch('photos-manifest.json', { cache: 'no-cache' })
        .then((r) => r.json())
        .then((data) => {
          const order = C.memories.order;
          const rank = (a) => { const i = order.indexOf(a.category); return i === -1 ? order.length : i; };
          albums = data.slice().sort((a, b) => rank(a) - rank(b));
          if (!albums.length) throw new Error('no photos');
          active = albums[0].category;
          renderTabs();
          renderWall();
        })
        .catch(() => { empty.hidden = false; });
    };
  }

  /* Enlarged photo, shared by the letter and the memories */
  const lightbox = (function () {
    const box = $('#lightbox');
    const img = $('#lightbox-img');
    let photos = [];
    let index = 0;
    let opener = null;
    let touchX = null;

    function paint() {
      img.src = photos[index];
      img.alt = 'Photo ' + (index + 1) + ' of ' + photos.length;
    }
    function step(delta) {
      index = (index + delta + photos.length) % photos.length;
      paint();
    }
    function close() {
      box.hidden = true;
      img.removeAttribute('src');
      if (opener) opener.focus();
    }

    $('#lightbox-close').addEventListener('click', close);
    $('#lightbox-prev').addEventListener('click', () => step(-1));
    $('#lightbox-next').addEventListener('click', () => step(1));
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    box.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', (e) => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
    });
    document.addEventListener('keydown', (e) => {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });
    window.addEventListener('hashchange', () => { if (!box.hidden) close(); });

    return {
      open(list, start) {
        photos = list;
        index = start;
        opener = document.activeElement;
        const single = photos.length < 2;
        $('#lightbox-prev').hidden = single;
        $('#lightbox-next').hidden = single;
        paint();
        box.hidden = false;
        $('#lightbox-close').focus();
      }
    };
  })();

  initHeart();
  initGate();
  initEnvelope();
  initReveal();
  initMenu();
  initLetter();
  initFlowers();
  initSong();
  initMemories();

  window.addEventListener('hashchange', route);
  route();
})();
