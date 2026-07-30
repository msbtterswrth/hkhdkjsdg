(function () {
  'use strict';

  function toggleAccordion(title) {
    const accordion = title.closest('.base__accordions');
    const content = title.nextElementSibling;

    if (!accordion || !content) {
      return;
    }

    const isOpening = !title.classList.contains('open');

    // Close the other accordion items in this group.
    accordion.querySelectorAll('.accordion-title.open').forEach((item) => {
      item.classList.remove('open');
      item.setAttribute('aria-expanded', 'false');

      const itemContent = item.nextElementSibling;

      if (itemContent) {
        itemContent.style.maxHeight = '0';
      }
    });

    if (isOpening) {
      title.classList.add('open');
      title.setAttribute('aria-expanded', 'true');
      content.style.maxHeight = `${content.scrollHeight + 40}px`;
    } else {
      title.classList.remove('open');
      title.setAttribute('aria-expanded', 'false');
      content.style.maxHeight = '0';
    }
  }

  function initializeAccordions() {
    document
      .querySelectorAll('.base__accordions .accordion-title')
      .forEach((title) => {
        // Prevent duplicate event listeners if initialization runs again.
        if (title.dataset.accordionInitialized === 'true') {
          return;
        }

        title.dataset.accordionInitialized = 'true';
        title.setAttribute(
          'aria-expanded',
          title.classList.contains('open') ? 'true' : 'false'
        );

        title.addEventListener('click', () => {
          toggleAccordion(title);
        });

        title.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleAccordion(title);
          }
        });
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAccordions);
  } else {
    initializeAccordions();
  }
})();