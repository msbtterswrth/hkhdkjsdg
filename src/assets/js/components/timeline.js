(function () {
  'use strict';

  function initializeTimelines() {
    $('.timeline .items').each(function () {
      const $slider = $(this);

      // Prevent duplicate initialization.
      if ($slider.hasClass('slick-initialized')) {
        return;
      }

      $slider.slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        variableWidth: true,
        rows: 0,
        prevArrow: $slider.next('.arrows').find('.prev-slide'),
        nextArrow: $slider.next('.arrows').find('.next-slide'),
        responsive: [
          {
            breakpoint: 1200,
            settings: {
              slidesToShow: 2
            }
          },
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 1
            }
          }
        ]
      });
    });
  }

  $(document).ready(function () {
    initializeTimelines();
  });

})();