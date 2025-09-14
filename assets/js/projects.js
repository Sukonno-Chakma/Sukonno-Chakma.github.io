// /assets/js/projects.js
(function initAllReportImageSliders() {
  const containers = Array.from(document.querySelectorAll('.report-images'));
  if (!containers.length) return;

  containers.forEach((container) => {
    if (container.dataset.sliderInit === '1') return;

    const imgs = Array.from(container.querySelectorAll('img'));
    if (!imgs.length) return;

    // Build DOM
    const track = document.createElement('div');
    track.className = 'slider-track';

    const slides = imgs.map((img) => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      slide.appendChild(img); // move existing <img> into slide
      return slide;
    });
    slides.forEach((s) => track.appendChild(s));

    // Controls (keep your SVGs)
    const mkBtn = (cls, d) => {
      const btn = document.createElement('button');
      btn.className = `ctrl ${cls}`;
      btn.setAttribute('aria-label', cls === 'prev' ? 'Previous slide' : 'Next slide');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="${d}"/>
        </svg>`;
      return btn;
    };
    const prevBtn = mkBtn('prev', 'M15 18l-6-6 6-6');
    const nextBtn = mkBtn('next', 'M9 6l6 6-6 6');

    // Dots (build once)
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'dots';
    const dots = slides.map((_, i) => {
      const d = document.createElement('span');
      d.className = 'dot';
      d.setAttribute('role', 'button');
      d.setAttribute('aria-label', `Go to slide ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
      return d;
    });

    // Mount
    container.innerHTML = '';
    container.appendChild(track);
    container.appendChild(prevBtn);
    container.appendChild(nextBtn);
    container.appendChild(dotsWrap);
    container.dataset.sliderInit = '1';
    container.tabIndex = 0; // keyboard focus

    // Logic
    let index = 0;
    let isAnimating = false;
    let ticking = false;

    function slideWidth() {
      // Width of a single slide (assumes 1-per-view; works with flex layouts)
      const first = slides[0];
      return first ? first.getBoundingClientRect().width : 0;
    }

    function clampIndex(n) {
      return (n + slides.length) % slides.length;
    }

    function updateDots() {
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }

    function goTo(n, behavior = 'smooth') {
      index = clampIndex(n);
      const w = slideWidth();
      // Fallback: if width 0 (hidden), just update dots
      if (w <= 0) return updateDots();
      isAnimating = true;
      track.scrollTo({ left: index * w, behavior });
      updateDots();
      // End the "animating" state after the browser likely finished smooth scroll
      setTimeout(() => (isAnimating = false), behavior === 'smooth' ? 400 : 0);
    }

    function syncFromScroll() {
      const w = slideWidth();
      if (w > 0) {
        const newIndex = Math.round(track.scrollLeft / w);
        if (newIndex !== index) {
          index = clampIndex(newIndex);
          updateDots();
        }
      }
    }

    const next = () => { if (!isAnimating) goTo(index + 1); };
    const prev = () => { if (!isAnimating) goTo(index - 1); };

    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    // Keyboard support per container
    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });

    // rAF-throttled scroll sync
    track.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        syncFromScroll();
        ticking = false;
      });
    });

    // Keep alignment on resize (no smooth to avoid jank)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => goTo(index, 'auto'), 100);
    });

    // Touch/drag swipe via Pointer Events
    let startX = 0, dx = 0, dragging = false;
    const threshold = () => Math.max(50, container.clientWidth * 0.08);

    function onStart(x, id) { dragging = true; startX = x; dx = 0; if (id) track.setPointerCapture(id); }
    function onMove(x) { if (dragging) dx = x - startX; }
    function onEnd() {
      if (!dragging) return;
      dragging = false;
      if (dx > threshold()) prev();
      else if (dx < -threshold()) next();
      else goTo(index);
    }

    track.addEventListener('pointerdown', (e) => onStart(e.clientX, e.pointerId));
    track.addEventListener('pointermove',  (e) => onMove(e.clientX));
    track.addEventListener('pointerup',    onEnd);
    track.addEventListener('pointercancel', onEnd);
    track.addEventListener('pointerleave',  onEnd);

    // Init
    updateDots();
    goTo(0, 'auto');
  });
})();
