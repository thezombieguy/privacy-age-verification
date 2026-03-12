/* AgeRelay — main.js */

(function () {
  'use strict';

  /* ── Mobile nav ── */
  function initMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('open');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        toggle.setAttribute('aria-expanded', 'false');
        menu.classList.remove('open');
      }
    });
  }

  /* ── Smooth scroll ── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        var offset = document.querySelector('.site-nav').offsetHeight + 8;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
        history.pushState(null, '', this.getAttribute('href'));
      });
    });
  }

  /* ── Active nav highlighting ── */
  function initNavHighlight() {
    var sections = document.querySelectorAll('section[id]');
    var links = document.querySelectorAll('.nav-links a');
    if (!sections.length || !links.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('active'); });
          var active = document.querySelector('.nav-links a[href="#' + entry.target.id + '"]');
          if (active) active.classList.add('active');
        }
      });
    }, { rootMargin: '-20% 0px -75% 0px' });

    sections.forEach(function (s) { observer.observe(s); });
  }

  /* ── Mermaid init ── */
  function initMermaid() {
    if (typeof mermaid === 'undefined') return;
    mermaid.initialize({
      startOnLoad: true,
      theme: 'neutral',
      securityLevel: 'loose',
      flowchart: { useMaxWidth: true, htmlLabels: true },
      sequence: { useMaxWidth: true }
    });
  }

  /* ── Boot ── */
  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initSmoothScroll();
    initNavHighlight();
    initMermaid();
  });
})();
