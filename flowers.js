document.addEventListener('click', (e) => {
  const flower = e.target.closest('.flower, .toy-charm');
  if (!flower) return;
  if (flower.dataset.justDragged) {
    delete flower.dataset.justDragged;
    return;
  }
  const hearts = ['❤', '💗', '🌹'];
  for (let i = 0; i < 3; i++) {
    const heart = document.createElement('span');
    heart.className = 'heart-pop';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = (e.clientX + (Math.random() * 40 - 20)) + 'px';
    heart.style.top = (e.clientY - 10) + 'px';
    heart.style.animationDelay = (i * 0.08) + 's';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1300);
  }
});
