(function (Drupal, once) {
  'use strict';

  // === Autoplay settings ===
  const AUTOPLAY_MS = 6000; // rotate interval
  const RESUME_DELAY_MS = 2500; // wait a bit after user interaction before resuming

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function setViewportHeight(viewport, slide) {
    if (!viewport || !slide) return;
    const h = Math.ceil(slide.getBoundingClientRect().height);
    viewport.style.height = `${h}px`;
  }

  function getActiveIndex(track, slides) {
    const left = track.scrollLeft;
    let best = 0;
    let bestDist = Infinity;

    slides.forEach((slide, i) => {
      const dist = Math.abs(slide.offsetLeft - left);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });

    return best;
  }

  function scrollToIndex(track, slides, index) {
    const slide = slides[index];
    if (!slide) return;
    track.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
  }

  function buildDots(dotsEl, count) {
    dotsEl.innerHTML = '';
    const buttons = [];

    for (let i = 0; i < count; i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'testimonial-dot';
      b.setAttribute('aria-label', `Go to slide ${i + 1}`);
      b.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      b.dataset.index = String(i);
      dotsEl.appendChild(b);
      buttons.push(b);
    }

    return buttons;
  }

  Drupal.behaviors.testimonials = {
    attach(context) {
      once('testimonials', '[data-testimonials]', context).forEach((slider) => {
        const viewport = slider.querySelector('[data-slider-viewport]');
        const track = slider.querySelector('[data-slider-track]');
        const dotsEl = slider.querySelector('[data-slider-dots]');
        if (!viewport || !track || !dotsEl) return;

        const slides = Array.from(track.children).filter((el) => el.nodeType === 1);
        if (slides.length === 0) return;

        // Only show dots if > 1 slide (matches Slick behavior).
        const buttons =
          slides.length > 1 ? buildDots(dotsEl, slides.length) : (dotsEl.innerHTML = '', []);

        const update = () => {
          const active = getActiveIndex(track, slides);
          if (buttons.length) {
            buttons.forEach((b, i) => {
              b.setAttribute('aria-selected', i === active ? 'true' : 'false');
            });
          }
          setViewportHeight(viewport, slides[active]);
        };

        // Initial sizing after layout.
        requestAnimationFrame(update);

        // === Autoplay (no plugin) ===
        let intervalId = null;
        let resumeTimeoutId = null;
        let paused = false;

        const pause = () => {
          paused = true;
        };

        const resume = () => {
          paused = false;
        };

        const scheduleResume = () => {
          if (resumeTimeoutId) window.clearTimeout(resumeTimeoutId);
          resumeTimeoutId = window.setTimeout(() => {
            resume();
          }, RESUME_DELAY_MS);
        };

        const tick = () => {
          if (paused) return;
          if (document.hidden) return;

          const active = getActiveIndex(track, slides);
          const next = (active + 1) % slides.length;
          scrollToIndex(track, slides, next);
        };

        const startAutoplay = () => {
          if (intervalId) return;
          if (slides.length <= 1) return;
          if (prefersReducedMotion()) return;
          intervalId = window.setInterval(tick, AUTOPLAY_MS);
        };

        // Pause when off-screen
        let io = null;
        if ('IntersectionObserver' in window) {
          io = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) pause();
                else resume();
              });
            },
            { threshold: 0.1 }
          );
          io.observe(slider);
        }

        // Pause on hover/focus (user intent)
        slider.addEventListener('mouseenter', pause);
        slider.addEventListener('mouseleave', resume);
        slider.addEventListener('focusin', pause);
        slider.addEventListener('focusout', resume);

        // Pause when tab hidden
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) pause();
          else resume();
        });

        // Treat manual interactions as “pause briefly, then resume”
        const userInteracted = () => {
          pause();
          scheduleResume();
        };

        // Dots click
        dotsEl.addEventListener('click', (e) => {
          const btn = e.target.closest('button.testimonial-dot');
          if (!btn) return;
          scrollToIndex(track, slides, Number(btn.dataset.index));
          userInteracted();
          // Ensure height updates even if scroll is throttled.
          window.setTimeout(update, 120);
        });

        // Scrolling by touch/trackpad/keyboard should pause briefly too
        track.addEventListener('scroll', Drupal.debounce(() => {
          update();
          userInteracted();
        }, 80));

        window.addEventListener('resize', Drupal.debounce(update, 150));

        startAutoplay();
      });
    },
  };
})(Drupal, once);
