(function () {
  const tabsEl = document.getElementById('gallery-tabs');
  const gridEl = document.getElementById('gallery-grid');
  const emptyEl = document.getElementById('gallery-empty');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let manifest = [];
  let activeCategory = null;
  let activeIndex = 0;

  function renderTabs() {
    tabsEl.innerHTML = '';
    manifest.forEach((cat) => {
      const btn = document.createElement('button');
      btn.className = 'gallery-tab' + (cat.category === activeCategory ? ' active' : '');
      btn.textContent = `${cat.label} (${cat.photos.length})`;
      btn.addEventListener('click', () => {
        activeCategory = cat.category;
        renderTabs();
        renderGrid();
        window.dispatchEvent(new CustomEvent('cupid:category', { detail: { label: cat.label } }));
      });
      tabsEl.appendChild(btn);
    });
  }

  function currentPhotos() {
    const cat = manifest.find((c) => c.category === activeCategory);
    return cat ? cat.photos : [];
  }

  function renderGrid() {
    const photos = currentPhotos();
    gridEl.innerHTML = '';
    photos.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.loading = 'lazy';
      img.alt = 'A memory';
      img.addEventListener('click', () => openLightbox(i));
      gridEl.appendChild(img);
    });
  }

  function openLightbox(index) {
    activeIndex = index;
    const photos = currentPhotos();
    lightboxImg.src = photos[activeIndex];
    lightbox.classList.remove('hidden');
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
  }

  function navigate(delta) {
    const photos = currentPhotos();
    activeIndex = (activeIndex + delta + photos.length) % photos.length;
    lightboxImg.src = photos[activeIndex];
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => navigate(-1));
  lightboxNext.addEventListener('click', () => navigate(1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  fetch('photos-manifest.json')
    .then((r) => r.json())
    .then((data) => {
      manifest = data;
      if (!manifest.length) {
        emptyEl.classList.remove('hidden');
        return;
      }
      emptyEl.classList.add('hidden');
      activeCategory = manifest[0].category;
      renderTabs();
      renderGrid();
    })
    .catch(() => {
      emptyEl.classList.remove('hidden');
    });
})();
