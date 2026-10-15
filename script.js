const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const heroGrid = document.querySelector('.hero-grid');

if (heroGrid) {
  const cellSize = 20;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let lastPointer = null;

  const hero = heroGrid.closest('.hero');
  const lightCell = (column, row) => {
    const cell = document.createElement('span');
    cell.className = 'hero-grid-cell';
    cell.setAttribute('aria-hidden', 'true');
    cell.style.left = `${column * cellSize + 1}px`;
    cell.style.top = `${row * cellSize + 1}px`;
    heroGrid.append(cell);
    if (motionPreference.matches) {
      window.setTimeout(() => cell.remove(), 550);
    } else {
      cell.addEventListener('animationend', () => cell.remove(), { once: true });
    }
  };

  hero.addEventListener('pointermove', (event) => {
    if (!canHover) return;

    const bounds = heroGrid.getBoundingClientRect();
    const columns = Math.ceil(bounds.width / cellSize);
    const rows = Math.ceil(bounds.height / cellSize);
    const currentCell = {
      column: Math.max(0, Math.min(columns - 1, Math.floor((event.clientX - bounds.left) / cellSize))),
      row: Math.max(0, Math.min(rows - 1, Math.floor((event.clientY - bounds.top) / cellSize))),
    };

    if (lastPointer) {
      const steps = Math.max(
        Math.abs(currentCell.column - lastPointer.column),
        Math.abs(currentCell.row - lastPointer.row),
      );

      for (let step = 1; step <= steps; step += 1) {
        const progress = step / steps;
        lightCell(
          Math.round(lastPointer.column + (currentCell.column - lastPointer.column) * progress),
          Math.round(lastPointer.row + (currentCell.row - lastPointer.row) * progress),
        );
      }
    } else {
      lightCell(currentCell.column, currentCell.row);
    }

    lastPointer = currentCell;
  }, { passive: true });
  hero.addEventListener('pointerleave', () => {
    lastPointer = null;
  });
}

if (!motionPreference.matches && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let lastPointer = null;

  document.addEventListener('pointermove', (event) => {
    if (event.target.closest('.hero')) {
      lastPointer = null;
      return;
    }

    const start = lastPointer ?? { x: event.clientX, y: event.clientY };
    const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y);
    if (distance < 5 && lastPointer) return;
    const steps = Math.max(1, Math.min(20, Math.ceil(distance / 6)));

    for (let step = 1; step <= steps; step += 1) {
      const progress = step / steps;
      const pixel = document.createElement('span');
      pixel.className = 'pixel-trail';
      pixel.setAttribute('aria-hidden', 'true');
      pixel.style.left = `${start.x + (event.clientX - start.x) * progress}px`;
      pixel.style.top = `${start.y + (event.clientY - start.y) * progress}px`;
      pixel.style.setProperty('--pixel-size', `${3 + Math.random() * 3}px`);
      pixel.style.setProperty('--pixel-opacity', `${0.12 + progress * 0.38}`);
      document.body.append(pixel);
      pixel.addEventListener('animationend', () => pixel.remove(), { once: true });
    }

    lastPointer = { x: event.clientX, y: event.clientY };
  }, { passive: true });
}
