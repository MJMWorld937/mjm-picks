// Progressive Enhancement: Scroll-Reveals + Karten-Tilt.
// Ohne JS bleibt alles sichtbar (Gate über html.js), Reduced Motion wird respektiert.
document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

// Scroll-Reveals
const targets = document.querySelectorAll('.io');
if (!reduceMotion && 'IntersectionObserver' in window && targets.length > 0) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  targets.forEach((el) => io.observe(el));
} else {
  targets.forEach((el) => el.classList.add('in-view'));
}

// 3D-Tilt + Cursor-Glow (nur Maus, nie bei Reduced Motion)
if (finePointer && !reduceMotion) {
  const MAX_TILT = 5; // Grad
  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--ry', `${(px - 0.5) * 2 * MAX_TILT}deg`);
      card.style.setProperty('--rx', `${(0.5 - py) * 2 * MAX_TILT}deg`);
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}
