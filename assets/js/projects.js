(function () {
  function makeSlider(root, { autoplayMs = 3000 } = {}) {
    const imgs = Array.from(root.querySelectorAll(":scope > img"));
    if (imgs.length <= 1) return;

    const track = document.createElement("div");
    track.className = "carousel__track";
    imgs.forEach(img => {
      const slide = document.createElement("div");
      slide.className = "carousel__slide";
      slide.appendChild(img);
      track.appendChild(slide);
    });
    root.appendChild(track);

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

    const dots = document.createElement("div");
    dots.className = "carousel__dots";
    const dotBtns = imgs.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Go to slide " + (i + 1));
      dots.appendChild(b);
      return b;
    });

    root.appendChild(prev);
    root.appendChild(next);
    root.appendChild(dots);

    let index = 0, timer = null;
    const count = imgs.length;

    function go(i) {
      index = (i + count) % count;
      track.style.transform = `translateX(-${index * 100}%)`;
      dotBtns.forEach((b, j) => j === index ? b.setAttribute("aria-current","true") : b.removeAttribute("aria-current"));
    }
    function startAuto() { stopAuto(); timer = setInterval(() => go(index + 1), autoplayMs); }
    function stopAuto()  { if (timer) clearInterval(timer); timer = null; }

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
        dx < 0 ? go(index + 1) : go(index - 1);
      }
    });

    go(0);
    startAuto();
  }

  // safer to wait until the DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".carousel").forEach(el => makeSlider(el, { autoplayMs: 3000 }));
  });
})();
