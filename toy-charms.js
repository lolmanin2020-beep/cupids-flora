(function () {
  function makeDraggable(el) {
    let dragging = false;
    let moved = false;
    let startX, startY, originLeft, originTop;

    function onPointerDown(e) {
      dragging = true;
      moved = false;
      el.classList.add('toy-charm--dragging');
      const rect = el.getBoundingClientRect();
      originLeft = rect.left;
      originTop = rect.top;
      startX = e.clientX;
      startY = e.clientY;
      el.style.left = originLeft + 'px';
      el.style.top = originTop + 'px';
      el.style.right = 'auto';
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) moved = true;
      const newLeft = Math.max(4, Math.min(window.innerWidth - el.offsetWidth - 4, originLeft + dx));
      const newTop = Math.max(4, Math.min(window.innerHeight - el.offsetHeight - 4, originTop + dy));
      el.style.left = newLeft + 'px';
      el.style.top = newTop + 'px';
    }

    function onPointerUp() {
      dragging = false;
      el.classList.remove('toy-charm--dragging');
      if (moved) el.dataset.justDragged = '1';
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    }

    el.addEventListener('pointerdown', onPointerDown);
  }

  document.querySelectorAll('.toy-charm').forEach(makeDraggable);

  function startIdleWiggles() {
    document.querySelectorAll('.toy-charm').forEach((el) => {
      const loop = () => {
        el.classList.remove('toy-charm--wiggle');
        void el.offsetWidth;
        el.classList.add('toy-charm--wiggle');
        setTimeout(loop, 6000 + Math.random() * 8000);
      };
      setTimeout(loop, 1500 + Math.random() * 6000);
    });
  }
  startIdleWiggles();
})();
