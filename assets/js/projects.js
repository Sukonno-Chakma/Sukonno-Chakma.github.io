// /assets/js/projects.js
(function initAllReportImageSliders() {
  const containers = Array.from(document.querySelectorAll('.report-images'));
  if (!containers.length) return;

  containers.forEach((container) => {
    // Skip if this container is already initialized
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
    slides.forEach(s => track.appendChild(s));

    // Controls
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
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'dots';

    // Mount
    container.innerHTML = '';
    container.appendChild(track);
    container.appendChild(prevBtn);
    container.appendChild(nextBtn);
    container.appendChild(dotsWrap);
    container.dataset.sliderInit = '1';

    // Logic
    let index = 0;
    let isAnimating = false;

    function goTo(n, behavior = 'smooth') {
      index = (n + slides.length) % slides.length;
      const left = slides[index].offsetLeft;
      isAnimating = true;
      track.scrollTo({ left, behavior });
      updateDots();
      setTimeout(() => (isAnimating = false), 400);
    }

    function updateDots() {
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const d = document.createElement('span');
        d.className = 'dot' + (i === index ? ' active' : '');
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
      });
    }

    const next = () => { if (!isAnimating) goTo(index + 1); };
    const prev = () => { if (!isAnimating) goTo(index - 1); };

    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    // Keyboard focus per container
    container.tabIndex = 0;
    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });

    // Resize keeps alignment
    window.addEventListener('resize', () => goTo(index, 'auto'));

    // Touch/drag
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
