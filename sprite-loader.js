fetch('sprite.svg')
  .then((r) => r.text())
  .then((svg) => {
    const holder = document.createElement('div');
    holder.style.display = 'none';
    holder.innerHTML = svg;
    document.body.prepend(holder);
  });
