document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".fact-card .stat");

  const animateCounter = (element) => {
    if (element.dataset.animated) return;
    element.dataset.animated = "true";

    const target = parseFloat(element.textContent.replace(/,/g, ""));
    const isInteger = Number.isInteger(target);
    const duration = 1000;
    const start = performance.now();

    function update(timestamp) {
      const progress = Math.min((timestamp - start) / duration, 1);
      const current = target * progress;

      element.textContent = isInteger
        ? Math.round(current).toLocaleString("en-US")
        : current.toFixed(1).toLocaleString("en-US");

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = isInteger
          ? target.toLocaleString("en-US")
          : target.toLocaleString("en-US", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            });
      }
    }

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target); // Only animate once
        }
      });
    },
    {
      threshold: 0.1, // Trigger when 10% of the element is visible
    }
  );

  counters.forEach((counter) => observer.observe(counter));
});