<script>
(function () {
  function makeSlider(root, { autoplayMs = 3000 } = {}) {
    // gather images
    const imgs = Array.from(root.querySelectorAll(":scope > img"));
    if (imgs.length <= 1) return; // nothing to slide

    // build structure: track + slides
    const track = document.createElement("div");
    track.className = "carousel__track";

    imgs.forEach(img => {
      const slide = document.createElement("div");
      slide.className = "carousel__slide";
      slide.appendChild(img);
      track.appendChild(slide);
    });
    root.appendChild(track);

    // arrows
    const prev = document.createElement("button");
    prev.className = "carousel__btn carousel__btn--prev";
    prev.type = "button";
    prev.setAttribute("aria-label", "Previous slide");
    prev.textContent = "‹";

    const next = document.createElement("button");
    next.className = "carousel__btn carousel__btn--next";
    next.type = "button";
    next.setAttribute("aria-label", "Next slide");
    next.textContent = "›";

    root.appendChild(prev);
    root.appendChild(next);

    // dots
    const dots = document.createElement("div");
    dots.className = "carousel__dots";
    const dotBtns = imgs.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Go to slide " + (i + 1));
      dots.appendChild(b);
      return b;
    });
    root.appendChild(dots);

    // state
    let index = 0;
    let timer = null;
    const count = imgs.length;

    function go(i) {
      index = (i + count) % count;
      track.style.transform = `translateX(-${index * 100}%)`;
      dotBtns.forEach((b, j) => {
        if (j === index) b.setAttribute("aria-current", "true");
        else b.removeAttribute("aria-current");
      });
    }

    function startAuto() {
      stopAuto();
      timer = setInterval(() => go(index + 1), autoplayMs);
    }
    function stopAuto() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    // events
    prev.addEventListener("click", () => { go(index - 1); startAuto(); });
    next.addEventListener("click", () => { go(index + 1); startAuto(); });
    dotBtns.forEach((b, i) => b.addEventListener("click", () => { go(i); startAuto(); }));

    // swipe
    let startX = 0, dragging = false;
    track.addEventListener("pointerdown", (e) => { dragging = true; startX = e.clientX; stopAuto(); });
    window.addEventListener("pointerup", () => { if (dragging) { dragging = false; startAuto(); } });
    track.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 40) {
        dragging = false;
        if (dx < 0) go(index + 1); else go(index - 1);
      }
    });

    // init
    go(0);
    startAuto();
  }

  // initialize every .carousel independently
  document.querySelectorAll(".carousel").forEach(el => makeSlider(el, { autoplayMs: 3000 }));
})();
</script>
