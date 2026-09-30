(() => {
  'use strict';
  const intro = document.getElementById('intro');
  const skip = document.getElementById('skip-intro');
  const replay = document.getElementById('replay-intro');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timers = [];
  let returnFocus = null;

  function markSeen() {
    try { sessionStorage.setItem('tf-intro-seen-v2', '1'); } catch (_) { /* Storage may be disabled. */ }
  }
  function clearTimers() {
    timers.forEach(window.clearTimeout);
    timers = [];
  }
  function finishIntro(immediate = false) {
    clearTimers();
    markSeen();
    document.documentElement.classList.remove('intro-pending');
    document.body.classList.remove('intro-active');
    document.querySelectorAll('[data-intro-inert]').forEach(element => {
      element.inert = false;
      element.removeAttribute('data-intro-inert');
    });
    intro.classList.add('leaving');
    const hide = () => {
      intro.hidden = true;
      intro.classList.remove('leaving');
      if (returnFocus) returnFocus.focus({preventScroll: true});
      else if (intro.contains(document.activeElement)) document.getElementById('main').focus({preventScroll: true});
      returnFocus = null;
    };
    if (immediate || reducedMotion.matches) hide();
    else timers.push(window.setTimeout(hide, 350));
  }
  function playIntro(manual = false) {
    clearTimers();
    returnFocus = manual ? document.activeElement : null;
    if (reducedMotion.matches) { finishIntro(true); return; }
    intro.hidden = false;
    intro.classList.remove('leaving');
    document.body.classList.add('intro-active');
    document.documentElement.classList.add('intro-pending');
    for (const element of document.body.children) {
      if (element !== intro && !element.inert) {
        element.inert = true;
        element.setAttribute('data-intro-inert', '');
      }
    }
    skip.focus({preventScroll: true});
    timers.push(window.setTimeout(() => finishIntro(), 2700));
  }
  skip.addEventListener('click', () => finishIntro());
  replay.addEventListener('click', () => playIntro(true));
  reducedMotion.addEventListener('change', event => {
    if (event.matches && !intro.hidden) finishIntro(true);
  });
  if (document.documentElement.classList.contains('intro-pending')) playIntro();
  else if (document.body.classList.contains('home-page')) markSeen();

  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');
  function closeMenu() {
    menu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    menu.querySelector('.menu-label').textContent = 'MENU';
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    menu.querySelector('.menu-label').textContent = open ? 'CLOSE' : 'MENU';
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (!intro.hidden) finishIntro();
    if (menu.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menu.focus();
    }
  });
  document.querySelector('.print-button')?.addEventListener('click', () => window.print());

  // The artwork is decorative. No research results or model calculations are represented.
  if ('IntersectionObserver' in window && document.body.classList.contains('home-page')) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        nav.querySelectorAll('a').forEach(link => {
          const active = link.hash === '#' + entry.target.id;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, {rootMargin: '-15% 0px -50% 0px'});
    document.querySelectorAll('.section[id]').forEach(section => observer.observe(section));
  }
})();
