<script>
  (function makeReportImagesSlider() {
    const container = document.querySelector('.report-images');
    if (!container) return;

    // 1) Collect existing <img> tags
    const imgs = Array.from(container.querySelectorAll('img'));
    if (!imgs.length) return;

    // 2) Build DOM: track, slides, controls, dots
    const track = document.createElement('div');
    track.className = 'slider-track';

    const slides = imgs.map((img) => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      slide.appendChild(img); // move existing <img> inside slide
      return slide;
    });

    slides.forEach(s => track.appendChild(s));

    // Controls
    const mkBtn = (cls, pathD) => {
      const btn = document.createElement('button');
      btn.className = `ctrl ${cls}`;
      btn.setAttribute('aria-label', cls === 'prev' ? 'Previous slide' : 'Next slide');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="${pathD}"/>
        </svg>`;
      return btn;
    };
    const prevBtn = mkBtn('prev', 'M15 18l-6-6 6-6'); // chevron-left
    const nextBtn = mkBtn('next', 'M9 6l6 6-6 6');   // chevron-right

    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'dots';

    // 3) Mount new structure
    // Clear the container and append the slider pieces
    container.innerHTML = '';
    container.appendChild(track);
    container.appendChild(prevBtn);
    container.appendChild(nextBtn);
    container.appendChild(dotsWrap);

    // 4) Slider logic
    let index = 0;
    let isAnimating = false;

    function goTo(n, opts = { behavior: 'smooth' }) {
      index = (n + slides.length) % slides.length;
      const targetLeft = slides[index].offsetLeft;
      isAnimating = true;
      track.scrollTo({ left: targetLeft, behavior: opts.behavior });
      updateDots();
      // end animation guard
      setTimeout(() => (isAnimating = false), 400);
    }

    // Dots
    function updateDots() {
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const d = document.createElement('span');
        d.className = 'dot' + (i === index ? ' active' : '');
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
      });
    }

    function next() { if (!isAnimating) goTo(index + 1); }
    function prev() { if (!isAnimating) goTo(index - 1); }

    nextBtn.addEventListener('click', next);
    prevBtn.addEventListener('click', prev);

    // Keyboard
    container.tabIndex = 0;
    container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });

    // Resize handler keeps alignment correct
    window.addEventListener('resize', () => goTo(index, { behavior: 'auto' }));

    // Touch/drag support
    let startX = 0, dx = 0, dragging = false;

    function onStart(clientX) {
      dragging = true;
      startX = clientX;
      dx = 0;
    }
    function onMove(clientX) {
      if (!dragging) return;
      dx = clientX - startX;
    }
    function onEnd() {
      if (!dragging) return;
      dragging = false;
      const threshold = Math.max(50, container.clientWidth * 0.08); // swipe threshold
      if (dx > threshold) prev();
      else if (dx < -threshold) next();
      else goTo(index); // snap back
    }

    // Pointer events (mouse + touch unified)
    track.addEventListener('pointerdown', (e) => { onStart(e.clientX); track.setPointerCapture(e.pointerId); });
    track.addEventListener('pointermove',  (e) => onMove(e.clientX));
    track.addEventListener('pointerup',    onEnd);
    track.addEventListener('pointercancel', onEnd);
    track.addEventListener('pointerleave',  () => dragging && onEnd());

    // Optional autoplay — enable by setting autoplay = true
    const autoplay = false;
    const intervalMs = 4500;
    let timer = null;

    function startAutoplay() {
      if (autoplay && !timer) timer = setInterval(() => next(), intervalMs);
    }
    function stopAutoplay() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', startAutoplay);

    // init
    updateDots();
    goTo(0, { behavior: 'auto' });
    startAutoplay();
  })();
</script>
