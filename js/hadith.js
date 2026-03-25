// js/hadith.js
// Hadith reader module.
// Loads JSON data generated from Sahih Bukhari SQLite db.

const HadithModule = (function () {
  'use strict';

  let _categories = [];
  let _view = 'index'; // 'index' | 'reader'
  let _currentCat = null;
  
  function toArabicNum(n) {
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(n).replace(/[0-9]/g, function (d) { return arabicDigits[+d]; });
  }

  async function loadIndex() {
    if (_categories.length > 0) return _categories;
    try {
      const resp = await fetch('assets/hadith/index.json');
      if (!resp.ok) throw new Error('Network response was not ok');
      _categories = await resp.json();
      return _categories;
    } catch (error) {
      console.error('Failed to load Hadith index:', error);
      throw error;
    }
  }

  async function loadCategory(id) {
    try {
      const resp = await fetch('assets/hadith/cat_' + id + '.json');
      if (!resp.ok) throw new Error('Network response was not ok');
      return await resp.json();
    } catch (error) {
      console.error('Failed to load Hadith category ' + id + ':', error);
      throw error;
    }
  }

  /* ── Render entry point ──────────────────────────────────────── */
  async function render() {
    _view = 'index';
    _currentCat = null;
    
    document.getElementById('app').innerHTML = 
      '<div class="hadith-container fade-in">'
      + '<div class="hadith-loading"><p>Loading Hadith Collections...</p></div>'
      + '</div>';
      
    try {
      await loadIndex();
      renderIndex();
    } catch (e) {
      document.getElementById('app').innerHTML =
        '<div class="hadith-container fade-in" style="padding: 2rem; text-align: center;">'
        + '<h3 style="color: var(--color-danger); margin-bottom: 1rem;">Failed to load Hadith data</h3>'
        + '<p style="color: var(--text-muted); margin-bottom: 2rem;">' + escapeHtml(e.message) + '</p>'
        + '<button class="btn btn-primary" onclick="window.HadithModule.render()">Try Again</button>'
        + '</div>';
    }
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ── Index view ────────────────────────────────────────── */
  function renderIndex() {
    _view = 'index';
    let html = '<div class="hadith-container fade-in">';
    html += '<div class="hadith-header">';
    html += '<h2 class="hadith-title">صحيح البخاري</h2>';
    html += '<h3 class="hadith-subtitle">Sahih Bukhari</h3>';
    html += '<p class="quran-progress-summary">' + _categories.length + ' Books</p>';
    html += '</div>';

    html += '<div class="hadith-search-bar">';
    html += '<input type="text" id="hadith-search" class="quran-search-input" placeholder="Search book..." />';
    html += '</div>';

    html += '<div class="hadith-cat-list" id="hadith-cat-list">';
    for (let i = 0; i < _categories.length; i++) {
      const c = _categories[i];
      html += '<div class="hadith-cat-card" data-cat="' + c.id + '">';
      html += '<div class="hadith-cat-num"><span class="hadith-cat-diamond">' + c.id + '</span></div>';
      html += '<div class="hadith-cat-info">';
      html += '<span class="hadith-cat-name-ur">' + c.name + '</span>';
      html += '</div>';
      html += '<div class="hadith-cat-meta">';
      html += '<span class="hadith-count">' + c.count + ' Hadiths</span>';
      html += '</div>';
      html += '</div>';
    }
    html += '</div></div>';

    document.getElementById('app').innerHTML = html;

    const cards = document.querySelectorAll('.hadith-cat-card');
    for (let i = 0; i < cards.length; i++) {
      cards[i].addEventListener('click', function () {
        const id = this.getAttribute('data-cat');
        openCategory(id);
      });
    }

    const searchInput = document.getElementById('hadith-search');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        const q = this.value.trim().toLowerCase();
        for (let i = 0; i < cards.length; i++) {
          const cName = _categories[i].name.toLowerCase();
          const cId = String(_categories[i].id);
          const match = !q || cName.indexOf(q) !== -1 || cId === q;
          cards[i].style.display = match ? '' : 'none';
        }
      });
    }
  }

  /* ── Reader view ───────────────────────────────────────── */
  async function openCategory(catId) {
    _view = 'reader';
    _currentCat = catId;

    const catMeta = _categories.find(c => String(c.id) === String(catId));
    if (!catMeta) return;

    document.getElementById('app').innerHTML =
      '<div class="hadith-container fade-in">'
      + '<div class="hadith-loading"><p>Loading Book...</p></div>'
      + '</div>';

    try {
      const hadiths = await loadCategory(catId);
      renderReader(catMeta, hadiths);
    } catch (e) {
      document.getElementById('app').innerHTML =
        '<div class="hadith-container fade-in" style="padding: 2rem; text-align: center;">'
        + '<h3 style="color: var(--color-danger); margin-bottom: 1rem;">Failed to load Book</h3>'
        + '<p style="color: var(--text-muted); margin-bottom: 2rem;">' + escapeHtml(e.message) + '</p>'
        + '<button class="btn btn-primary" onclick="window.HadithModule.render()">Go Back</button>'
        + '</div>';
    }
  }

  function renderReader(catMeta, hadiths) {
    const idx = _categories.findIndex(c => String(c.id) === String(catMeta.id));
    const prev = idx > 0 ? _categories[idx - 1] : null;
    const next = idx < _categories.length - 1 ? _categories[idx + 1] : null;

    let html = '<div class="hadith-container fade-in">';

    /* Top navigation bar */
    html += '<div class="hadith-reader-nav">';
    html += '<button class="quran-nav-btn" id="hadith-back-btn" title="Back to books">↩ Books</button>';
    html += '<div class="hadith-reader-nav-title">';
    html += '<span class="hadith-reader-cat-name">' + catMeta.name + '</span>';
    html += '</div>';
    html += '<div class="quran-nav-arrows">';
    if (prev) {
      html += '<button class="quran-nav-btn" id="hadith-prev-btn" title="Previous Book">→</button>';
    }
    if (next) {
      html += '<button class="quran-nav-btn" id="hadith-next-btn" title="Next Book">←</button>';
    }
    html += '</div>';
    html += '</div>';

    /* Hadiths body */
    html += '<div class="hadith-body">';
    for (let i = 0; i < hadiths.length; i++) {
      const h = hadiths[i];
      html += '<div class="hadith-card">';
      html += '<div class="hadith-header-info">';
      html += '<span class="hadith-number">' + h.no + '</span>';
      html += '</div>';
      html += '<div class="hadith-text-ur">' + h.text.replace(/\n/g, '<br>') + '</div>';
      html += '</div>';
    }
    html += '</div>';

    /* Prev/Next at bottom */
    html += '<div class="quran-reader-pager" style="margin: 1.5rem .5rem 0;">';
    if (prev) {
      html += '<button class="quran-pager-btn" id="hadith-prev-bottom" style="font-family: \'Jameel Noori Nastaleeq\', serif; font-size: 1.1rem; padding: .6rem;">';
      html += '→ ' + prev.name;
      html += '</button>';
    } else {
      html += '<span></span>';
    }
    if (next) {
      html += '<button class="quran-pager-btn" id="hadith-next-bottom" style="font-family: \'Jameel Noori Nastaleeq\', serif; font-size: 1.1rem; padding: .6rem;">';
      html += next.name + ' ←';
      html += '</button>';
    } else {
      html += '<span></span>';
    }
    html += '</div>';

    html += '</div>';
    
    document.getElementById('app').innerHTML = html;
    window.scrollTo(0, 0);

    attachReaderListeners(catMeta, prev, next);
  }

  function attachReaderListeners(catMeta, prev, next) {
    const backBtn = document.getElementById('hadith-back-btn');
    if (backBtn) backBtn.addEventListener('click', renderIndex);

    if (prev) {
      document.getElementById('hadith-prev-btn')?.addEventListener('click', () => openCategory(prev.id));
      document.getElementById('hadith-prev-bottom')?.addEventListener('click', () => openCategory(prev.id));
    }
    if (next) {
      document.getElementById('hadith-next-btn')?.addEventListener('click', () => openCategory(next.id));
      document.getElementById('hadith-next-bottom')?.addEventListener('click', () => openCategory(next.id));
    }
  }

  return { render };
}());

export { HadithModule };
