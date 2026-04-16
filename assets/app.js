(function () {
  const lectureTabs = document.querySelectorAll('[data-lecture-tab]');
  const lecturePanels = document.querySelectorAll('[data-lecture-panel]');
  const jumpLinks = document.querySelectorAll('.jump-grid a[href^="#"]');

  function syncLectureTabs() {
    const hash = window.location.hash || '#lecture-11-multimodal';
    let activePanel = null;

    lecturePanels.forEach((panel) => {
      if (hash === '#' + panel.id || hash.startsWith('#' + panel.id + '-')) {
        activePanel = panel.id;
      }
    });

    if (!activePanel && lecturePanels.length > 0) {
      activePanel = lecturePanels[0].id;
    }

    lectureTabs.forEach((tab) => {
      const isActive = tab.dataset.lectureTab === activePanel;
      tab.classList.toggle('active', isActive);
      tab.classList.toggle('inactive', !isActive);
      if (isActive) {
        tab.setAttribute('aria-current', 'page');
      } else {
        tab.removeAttribute('aria-current');
      }
    });
  }

  function syncJumpLinks() {
    if (!('IntersectionObserver' in window) || jumpLinks.length === 0) {
      return;
    }

    const targets = [...jumpLinks]
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    if (targets.length === 0) {
      return;
    }

    const linkById = new Map();
    jumpLinks.forEach((link) => {
      const id = link.getAttribute('href').slice(1);
      linkById.set(id, link);
    });

    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible.length === 0) {
        return;
      }

      const currentId = visible[0].target.id;
      jumpLinks.forEach((link) => {
        const isCurrent = link.getAttribute('href') === '#' + currentId;
        link.classList.toggle('current', isCurrent);
        if (isCurrent) {
          link.setAttribute('aria-current', 'location');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }, {
      rootMargin: '-18% 0px -55% 0px',
      threshold: [0.2, 0.45, 0.7]
    });

    targets.forEach((target) => observer.observe(target));
  }

  window.addEventListener('hashchange', syncLectureTabs);
  syncLectureTabs();
  syncJumpLinks();
}());
