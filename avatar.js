(function () {
  const context = document.body.dataset.avatarContext || 'home';

  const PHRASES = {
    home: [
      "You clicked me! That tickles 💗",
      "Hi hi! I'm keeping this place cozy for you.",
      "Psst... have you visited the Memory Garden yet?",
      "Sending you a little hug from here 🌹",
      "I'll be right here if you need me!",
      "This place was made just for you."
    ],
    gallery: [
      "Every photo here has a little story.",
      "Take your time, I'll wait right here.",
      "I love looking through these with you.",
      "So many memories in one place!"
    ],
    game: [
      "Ready when you are!",
      "Ooh, what's the plan here?",
      "Take your time, no rush.",
      "This is fun, isn't it?"
    ]
  };

  const GAME_EVENT_PHRASES = {
    connected: ["Yay, you're both here! Let's play.", "Two players, ready to go!"],
    win: ["You won!! I'm so proud 🎉", "That's my favorite person right there!", "GG! You're amazing."],
    lose: ["Aww, so close! Next round?", "*pouts* rematch time.", "You'll get it next time!"],
    draw: ["A tie! Sneaky sneaky.", "Nobody wins this one, huh?"]
  };

  const FEMALE_SVG_MARKUP = `
    <svg viewBox="0 0 120 140" class="cupid-avatar-svg" aria-hidden="true">
      <ellipse cx="60" cy="128" rx="30" ry="6" fill="#000" opacity="0.08"></ellipse>
      <path class="cupid-body" d="M35,95 C35,78 46,68 60,68 C74,68 85,78 85,95 L88,128 L32,128 Z" fill="var(--avatar-outfit, #b23a4e)"></path>
      <path d="M32,52 C18,68 14,95 20,124 C24,128 30,126 32,120 C36,100 37,70 34,54 Z" fill="var(--avatar-hair, #2b1c14)"></path>
      <path d="M88,52 C102,68 106,95 100,124 C96,128 90,126 88,120 C84,100 83,70 86,54 Z" fill="var(--avatar-hair, #2b1c14)"></path>
      <circle class="cupid-head" cx="60" cy="46" r="32" fill="var(--avatar-skin, #f6cca6)"></circle>
      <path class="cupid-hair-back" d="M28,46 C28,20 44,6 60,6 C76,6 92,20 92,46 C92,54 90,60 88,64 C88,44 82,30 60,30 C38,30 32,44 32,64 C30,60 28,54 28,46 Z" fill="var(--avatar-hair, #2b1c14)"></path>
      <g class="cupid-eyes-open">
        <circle cx="49" cy="48" r="4.2" fill="#3a2418"></circle>
        <circle cx="71" cy="48" r="4.2" fill="#3a2418"></circle>
        <circle cx="50.3" cy="46.5" r="1.2" fill="#fff"></circle>
        <circle cx="72.3" cy="46.5" r="1.2" fill="#fff"></circle>
      </g>
      <g class="cupid-eyes-closed" style="display:none">
        <path d="M45,48 Q49,51 53,48" stroke="#3a2418" stroke-width="2" fill="none" stroke-linecap="round"></path>
        <path d="M67,48 Q71,51 75,48" stroke="#3a2418" stroke-width="2" fill="none" stroke-linecap="round"></path>
      </g>
      <circle cx="43" cy="58" r="5" fill="#f3a6a0" opacity="0.6"></circle>
      <circle cx="77" cy="58" r="5" fill="#f3a6a0" opacity="0.6"></circle>
      <path class="cupid-mouth" d="M54,60 Q60,65 66,60" stroke="#8a3f3f" stroke-width="2.2" fill="none" stroke-linecap="round"></path>
      <path class="cupid-hair-front" d="M28,46 C28,24 42,10 60,10 C78,10 92,24 92,46 C92,36 84,18 60,18 C36,18 28,36 28,46 Z" fill="var(--avatar-hair, #2b1c14)"></path>
      <path class="cupid-arm-left" d="M38,90 C30,94 26,102 28,110" stroke="var(--avatar-outfit, #b23a4e)" stroke-width="9" fill="none" stroke-linecap="round"></path>
      <path class="cupid-arm-right" d="M82,90 C90,94 94,102 92,110" stroke="var(--avatar-outfit, #b23a4e)" stroke-width="9" fill="none" stroke-linecap="round"></path>
    </svg>
  `;

  const MALE_SVG_MARKUP = `
    <svg viewBox="0 0 120 140" class="cupid-avatar-svg" aria-hidden="true">
      <ellipse cx="60" cy="128" rx="30" ry="6" fill="#000" opacity="0.08"></ellipse>
      <path class="cupid-body" d="M38,96 C38,80 47,70 60,70 C73,70 82,80 82,96 L84,128 L36,128 Z" fill="var(--avatar-outfit, #7a1f2b)"></path>
      <circle class="cupid-head" cx="60" cy="46" r="32" fill="var(--avatar-skin, #f3caa0)"></circle>
      <path class="cupid-hair-back" d="M27,40 C27,16 43,5 60,5 C77,5 93,16 93,40 C93,48 91,54 89,58 C89,38 80,26 60,26 C42,26 32,36 33,56 C29,52 27,46 27,40 Z" fill="var(--avatar-hair, #221812)"></path>
      <g class="cupid-eyebrows">
        <path d="M45,38 Q49,35 55,37" stroke="var(--avatar-hair, #221812)" stroke-width="2.6" fill="none" stroke-linecap="round"></path>
        <path d="M65,37 Q71,35 75,38" stroke="var(--avatar-hair, #221812)" stroke-width="2.6" fill="none" stroke-linecap="round"></path>
      </g>
      <g class="cupid-eyes-open">
        <circle cx="49" cy="48" r="4.2" fill="#3a2418"></circle>
        <circle cx="71" cy="48" r="4.2" fill="#3a2418"></circle>
        <circle cx="50.3" cy="46.5" r="1.2" fill="#fff"></circle>
        <circle cx="72.3" cy="46.5" r="1.2" fill="#fff"></circle>
      </g>
      <g class="cupid-eyes-closed" style="display:none">
        <path d="M45,48 Q49,51 53,48" stroke="#3a2418" stroke-width="2" fill="none" stroke-linecap="round"></path>
        <path d="M67,48 Q71,51 75,48" stroke="#3a2418" stroke-width="2" fill="none" stroke-linecap="round"></path>
      </g>
      <circle cx="43" cy="58" r="4" fill="#f3a6a0" opacity="0.4"></circle>
      <circle cx="77" cy="58" r="4" fill="#f3a6a0" opacity="0.4"></circle>
      <path class="cupid-mouth" d="M54,61 Q60,64 66,61" stroke="#8a4f3f" stroke-width="2.2" fill="none" stroke-linecap="round"></path>
      <path class="cupid-hair-front" d="M26,42 C24,22 34,9 52,7 C42,16 35,28 36,44 C33,50 30,48 26,42 Z" fill="var(--avatar-hair, #221812)"></path>
      <path d="M36,44 C40,26 54,13 78,14 C64,15 52,24 47,40 C53,32 64,27 76,29 C58,29 44,36 38,50 C36,48 36,46 36,44 Z" fill="var(--avatar-hair, #221812)"></path>
      <path d="M91,40 C93,22 84,12 71,11 C79,18 83,28 81,38 C86,36 89,37 91,40 Z" fill="var(--avatar-hair, #221812)"></path>
      <path class="cupid-arm-left" d="M40,92 C32,96 28,104 30,112" stroke="var(--avatar-outfit, #7a1f2b)" stroke-width="9" fill="none" stroke-linecap="round"></path>
      <path class="cupid-arm-right" d="M80,92 C88,96 92,104 90,112" stroke="var(--avatar-outfit, #7a1f2b)" stroke-width="9" fill="none" stroke-linecap="round"></path>
    </svg>
  `;

  const SVG_MARKUP = context === 'gallery' ? FEMALE_SVG_MARKUP : MALE_SVG_MARKUP;

  function buildAvatar() {
    const wrap = document.createElement('div');
    wrap.id = 'cupid-avatar';
    wrap.className = 'cupid-avatar cupid-avatar--' + context;
    wrap.innerHTML = SVG_MARKUP + '<div class="cupid-speech" id="cupid-speech"></div>';
    document.body.appendChild(wrap);
    return wrap;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function spawnHearts(x, y) {
    const hearts = ['❤', '💗', '✨'];
    for (let i = 0; i < 3; i++) {
      const heart = document.createElement('span');
      heart.className = 'heart-pop';
      heart.textContent = pick(hearts);
      heart.style.left = (x + (Math.random() * 40 - 20)) + 'px';
      heart.style.top = (y - 10) + 'px';
      heart.style.animationDelay = (i * 0.08) + 's';
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 1300);
    }
  }

  function initAvatar() {
    const el = buildAvatar();
    const speech = el.querySelector('#cupid-speech');
    const eyesOpen = el.querySelector('.cupid-eyes-open');
    const eyesClosed = el.querySelector('.cupid-eyes-closed');
    let speechTimer = null;

    function say(text, duration) {
      speech.textContent = text;
      speech.classList.add('cupid-speech--visible');
      clearTimeout(speechTimer);
      speechTimer = setTimeout(() => {
        speech.classList.remove('cupid-speech--visible');
      }, duration || 3200);
    }

    function blinkLoop() {
      eyesOpen.style.display = 'none';
      eyesClosed.style.display = '';
      setTimeout(() => {
        eyesOpen.style.display = '';
        eyesClosed.style.display = 'none';
      }, 150);
      setTimeout(blinkLoop, 2500 + Math.random() * 3000);
    }
    setTimeout(blinkLoop, 1800 + Math.random() * 2000);

    // Drag handling
    let dragging = false;
    let moved = false;
    let startX, startY, originLeft, originTop;

    function onPointerDown(e) {
      dragging = true;
      moved = false;
      el.classList.add('cupid-avatar--dragging');
      const rect = el.getBoundingClientRect();
      originLeft = rect.left;
      originTop = rect.top;
      startX = e.clientX;
      startY = e.clientY;
      el.style.left = originLeft + 'px';
      el.style.top = originTop + 'px';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true;
      let newLeft = originLeft + dx;
      let newTop = originTop + dy;
      newLeft = Math.max(4, Math.min(window.innerWidth - el.offsetWidth - 4, newLeft));
      newTop = Math.max(4, Math.min(window.innerHeight - el.offsetHeight - 4, newTop));
      el.style.left = newLeft + 'px';
      el.style.top = newTop + 'px';
    }

    function onPointerUp(e) {
      dragging = false;
      el.classList.remove('cupid-avatar--dragging');
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      if (!moved) {
        handleClick(e);
      }
    }

    function handleClick(e) {
      el.classList.remove('cupid-avatar--hop');
      void el.offsetWidth;
      el.classList.add('cupid-avatar--hop');
      const rect = el.getBoundingClientRect();
      spawnHearts(rect.left + rect.width / 2, rect.top);
      say(pick(PHRASES[context] || PHRASES.home));
    }

    el.addEventListener('pointerdown', onPointerDown);

    if (context === 'game') {
      window.addEventListener('cupid:connected', () => {
        el.classList.add('cupid-avatar--cheer');
        setTimeout(() => el.classList.remove('cupid-avatar--cheer'), 900);
        say(pick(GAME_EVENT_PHRASES.connected), 3500);
      });
      window.addEventListener('cupid:win', () => {
        el.classList.add('cupid-avatar--cheer');
        setTimeout(() => el.classList.remove('cupid-avatar--cheer'), 1200);
        const rect = el.getBoundingClientRect();
        spawnHearts(rect.left + rect.width / 2, rect.top);
        say(pick(GAME_EVENT_PHRASES.win), 4000);
      });
      window.addEventListener('cupid:lose', () => {
        el.classList.add('cupid-avatar--pout');
        setTimeout(() => el.classList.remove('cupid-avatar--pout'), 1200);
        say(pick(GAME_EVENT_PHRASES.lose), 4000);
      });
      window.addEventListener('cupid:draw', () => {
        say(pick(GAME_EVENT_PHRASES.draw), 3500);
      });
    }

    if (context === 'gallery') {
      window.addEventListener('cupid:category', (e) => {
        const label = (e.detail && e.detail.label) || 'these';
        say(`Ooh, the ${label} memories!`, 3500);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAvatar);
  } else {
    initAvatar();
  }
})();
