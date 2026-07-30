(function () {
    "use strict";

    // Check if the browser is Internet Explorer
    function initDIE() {
        const ua = window.navigator.userAgent;
        const isIE = /MSIE|Trident/.test(ua);

        if (isIE) {
            document.documentElement.classList.add('ie');
            const alertHTML = `
                <div class="browser-alert">
                    <div class="close"><i class="icon-close"></i></div>
                    <h2>This browser is no longer supported.</h2>
                    <p>For a better user experience, please use one of the following supported browsers:</p>
                    <div class="browser-list">
                        <a href="https://www.mozilla.org/en-US/firefox/download/thanks/" target="_blank">Firefox</a>
                        <a href="https://www.google.com/chrome/" target="_blank">Chrome</a>
                        <a href="https://www.microsoft.com/edge" target="_blank">Edge</a>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML('beforeend', alertHTML);

            document.querySelector('.browser-alert .close').addEventListener('click', () => {
                document.querySelector('.browser-alert').classList.toggle('closed');
            });
        }
    }

    // Wrap tables in a responsive container
    function tableWrap() {
        document.querySelectorAll('table').forEach(table => {
            const wrapper = document.createElement('div');
            wrapper.className = 'responsive-table';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
    }

    // Toggle navigation and search menus
    function toggleMenu() {
        document.querySelector('.nav-toggle').addEventListener('click', () => {
            document.body.classList.toggle('nav-open');
            document.body.classList.remove('search-open');
        });

        document.querySelector('.search-toggle').addEventListener('click', () => {
            document.body.classList.toggle('search-open');
            document.body.classList.remove('nav-open');
            document.querySelector('.site-search input').focus();
        });

        document.querySelector('.nav-close').addEventListener('click', () => {
            document.body.classList.remove('nav-open', 'search-open');
        });

        document.querySelector('.filter-toggle').addEventListener('click', () => {
            document.body.classList.toggle('filter-open');
        });
    }

    // Toggle sections for mobile
    function toggleSection() {
        document.querySelectorAll('.nav-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const content = toggle.nextElementSibling;
                const height = content.scrollHeight;
                toggle.classList.toggle('open');
                content.style.maxHeight = toggle.classList.contains('open') ? `${height + 35}px` : '0';
            });
        });

        document.querySelectorAll('.parent').forEach(parent => {
            parent.addEventListener('click', () => {
                parent.classList.toggle('open');
            });
        });
    }

    // Add class to header when scrolled
    function headerScroll() {
        const header = document.querySelector('.header');
        const headerHeight = header.offsetHeight;

        window.addEventListener('scroll', () => {
            if (window.scrollY >= headerHeight) {
                document.body.classList.add('scroll');
            } else {
                document.body.classList.remove('scroll');
            }
        });
    }

    // Smooth scrolling for anchor links
    function initSmoothScroll() {
        document.querySelectorAll('a[href*="#"]:not([href="#"]):not([href="#0"])').forEach(link => {
            link.addEventListener('click', event => {
                const target = document.querySelector(link.hash);
                if (target) {
                    event.preventDefault();
                    window.scrollTo({
                        top: target.offsetTop - 150,
                        behavior: 'smooth'
                    });
                    target.setAttribute('tabindex', '-1');
                    target.focus();
                }
            });
        });
    }

    // Add a class to active page links
    (function initActiveLinks() {
        'use strict';

        function normalizePath(path) {
            path = path
                .replace(/index\.html$/, '')
                .replace(/\/$/, '');

            return path || '/';
        }

        const currentPath = normalizePath(window.location.pathname);

        document.querySelectorAll('a[href]').forEach((link) => {
            const href = link.getAttribute('href');

            // Ignore external and utility links.
            if (
                !href ||
                href.startsWith('#') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                href.startsWith('javascript:') ||
                /^https?:\/\//i.test(href)
            ) {
                return;
            }

            const url = new URL(href, window.location.origin);
            const linkPath = normalizePath(url.pathname);

            if (linkPath === currentPath) {
                link.classList.add('is-active');
                link.closest('li')?.classList.add('is-active');
            }
        });
    })();


    // Add class to external links
    function externalLinks() {
        document.querySelectorAll('a[href*="//"]').forEach(link => {
            if (!link.href.includes(document.location.hostname)) {
                link.setAttribute('target', '_blank');
                link.classList.add('external');
            }
        });
    }

    // Initialize all functions on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
        initDIE();
        initSmoothScroll();
        toggleMenu();
        toggleSection();
        externalLinks();
    });
})(); 
