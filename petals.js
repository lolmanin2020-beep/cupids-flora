(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const COLORS = ['#b23a4e', '#e58ba0', '#f3c9d3', '#c9a24b', '#d94f66'];

  const field = document.createElement('div');
  field.id = 'petal-field';
  document.body.appendChild(field);

  function spawnPetal() {
    const petal = document.createElement('div');
    petal.className = 'petal';

    const size = 10 + Math.random() * 14;
    const startX = Math.random() * 100;
    const duration = 9 + Math.random() * 8;
    const drift = Math.random() * 160 - 80;
    const rotateStart = Math.random() * 360;
    const spin = (Math.random() * 360 + 180) * (Math.random() < 0.5 ? -1 : 1);
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];

    petal.style.setProperty('--start-x', startX + 'vw');
    petal.style.setProperty('--drift', drift + 'px');
    petal.style.setProperty('--duration', duration + 's');
    petal.style.setProperty('--rotate-start', rotateStart + 'deg');
    petal.style.setProperty('--rotate-end', (rotateStart + spin) + 'deg');
    petal.style.width = size + 'px';
    petal.style.height = size + 'px';
    petal.innerHTML =
      '<svg viewBox="0 0 16 16" width="100%" height="100%">' +
      '<path d="M8,0 C14,4 14,12 8,16 C2,12 2,4 8,0 Z" fill="' + color + '" opacity="0.75"/>' +
      '</svg>';

    field.appendChild(petal);
    petal.addEventListener('animationend', () => petal.remove());
  }

  for (let i = 0; i < 5; i++) {
    setTimeout(spawnPetal, i * 400);
  }
  setInterval(spawnPetal, 1000);
})();
