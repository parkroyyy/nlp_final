(function () {
  const lectureTabs = [...document.querySelectorAll('[data-lecture-tab]')];
  const lecturePanels = [...document.querySelectorAll('[data-lecture-panel]')];
  const allJumpLinks = [...document.querySelectorAll('.jump-grid a[href^="#"]')];
  let jumpObserver = null;

  function getHashId() {
    return decodeURIComponent((window.location.hash || '').replace(/^#/, ''));
  }

  function getActivePanelId() {
    const hashId = getHashId();
    if (!hashId) {
      return lecturePanels[0] ? lecturePanels[0].id : null;
    }

    const directPanel = lecturePanels.find((panel) => panel.id === hashId);
    if (directPanel) {
      return directPanel.id;
    }

    const target = document.getElementById(hashId);
    if (target) {
      const parentPanel = target.closest('[data-lecture-panel]');
      if (parentPanel) {
        return parentPanel.id;
      }
    }

    return lecturePanels[0] ? lecturePanels[0].id : null;
  }

  function setCurrentJumpLink(links, currentId) {
    links.forEach((link) => {
      const isCurrent = currentId && link.getAttribute('href') === '#' + currentId;
      link.classList.toggle('current', Boolean(isCurrent));
      if (isCurrent) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function syncJumpLinks(activePanelId) {
    if (jumpObserver) {
      jumpObserver.disconnect();
      jumpObserver = null;
    }

    setCurrentJumpLink(allJumpLinks, null);

    const activePanel = document.getElementById(activePanelId);
    if (!activePanel) {
      return;
    }

    const activeJumpLinks = [...activePanel.querySelectorAll('.jump-grid a[href^="#"]')];
    const hashId = getHashId();
    setCurrentJumpLink(activeJumpLinks, hashId);

    if (!('IntersectionObserver' in window) || activeJumpLinks.length === 0) {
      return;
    }

    const targets = activeJumpLinks
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    if (targets.length === 0) {
      return;
    }

    jumpObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (visible.length === 0) {
        return;
      }

      setCurrentJumpLink(activeJumpLinks, visible[0].target.id);
    }, {
      rootMargin: '-18% 0px -55% 0px',
      threshold: [0.2, 0.45, 0.7]
    });

    targets.forEach((target) => jumpObserver.observe(target));
  }

  function syncLecturePanels() {
    const activePanelId = getActivePanelId();

    lectureTabs.forEach((tab) => {
      const isActive = tab.dataset.lectureTab === activePanelId;
      tab.classList.toggle('active', isActive);
      tab.classList.toggle('inactive', !isActive);
      if (isActive) {
        tab.setAttribute('aria-current', 'page');
      } else {
        tab.removeAttribute('aria-current');
      }
    });

    lecturePanels.forEach((panel) => {
      panel.hidden = panel.id !== activePanelId;
    });

    syncJumpLinks(activePanelId);
  }

  window.addEventListener('hashchange', syncLecturePanels);
  syncLecturePanels();
}());
