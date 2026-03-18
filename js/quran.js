// js/quran.js
// Al-Qur'an — Quran reader module with reading progress tracking.
// Loads Tanzil Simple Plain XML and renders surahs with proper Arabic font.

window.QuranModule = (function () {
  'use strict';

  const STORAGE_KEY   = () => 'quran_' + window.AppState.username;
  const FIREBASE_PATH = () => 'quran/' + window.AppState.username;

  /* ── Surah metadata (index, Arabic name, English name, ayah count) ── */
  const SURAHS = [
    { index: 1,   name: 'الفاتحة',     ename: 'Al-Fatihah',       ayahs: 7 },
    { index: 2,   name: 'البقرة',       ename: 'Al-Baqarah',      ayahs: 286 },
    { index: 3,   name: 'آل عمران',     ename: 'Ali \'Imran',     ayahs: 200 },
    { index: 4,   name: 'النساء',       ename: 'An-Nisa',         ayahs: 176 },
    { index: 5,   name: 'المائدة',      ename: 'Al-Ma\'idah',     ayahs: 120 },
    { index: 6,   name: 'الأنعام',      ename: 'Al-An\'am',       ayahs: 165 },
    { index: 7,   name: 'الأعراف',      ename: 'Al-A\'raf',       ayahs: 206 },
    { index: 8,   name: 'الأنفال',      ename: 'Al-Anfal',        ayahs: 75 },
    { index: 9,   name: 'التوبة',       ename: 'At-Tawbah',       ayahs: 129 },
    { index: 10,  name: 'يونس',         ename: 'Yunus',            ayahs: 109 },
    { index: 11,  name: 'هود',          ename: 'Hud',              ayahs: 123 },
    { index: 12,  name: 'يوسف',         ename: 'Yusuf',            ayahs: 111 },
    { index: 13,  name: 'الرعد',        ename: 'Ar-Ra\'d',        ayahs: 43 },
    { index: 14,  name: 'ابراهيم',      ename: 'Ibrahim',          ayahs: 52 },
    { index: 15,  name: 'الحجر',        ename: 'Al-Hijr',         ayahs: 99 },
    { index: 16,  name: 'النحل',        ename: 'An-Nahl',         ayahs: 128 },
    { index: 17,  name: 'الإسراء',      ename: 'Al-Isra',         ayahs: 111 },
    { index: 18,  name: 'الكهف',        ename: 'Al-Kahf',         ayahs: 110 },
    { index: 19,  name: 'مريم',         ename: 'Maryam',           ayahs: 98 },
    { index: 20,  name: 'طه',           ename: 'Taha',             ayahs: 135 },
    { index: 21,  name: 'الأنبياء',     ename: 'Al-Anbiya',       ayahs: 112 },
    { index: 22,  name: 'الحج',         ename: 'Al-Hajj',         ayahs: 78 },
    { index: 23,  name: 'المؤمنون',     ename: 'Al-Mu\'minun',    ayahs: 118 },
    { index: 24,  name: 'النور',        ename: 'An-Nur',           ayahs: 64 },
    { index: 25,  name: 'الفرقان',      ename: 'Al-Furqan',       ayahs: 77 },
    { index: 26,  name: 'الشعراء',      ename: 'Ash-Shu\'ara',    ayahs: 227 },
    { index: 27,  name: 'النمل',        ename: 'An-Naml',         ayahs: 93 },
    { index: 28,  name: 'القصص',        ename: 'Al-Qasas',        ayahs: 88 },
    { index: 29,  name: 'العنكبوت',     ename: 'Al-Ankabut',      ayahs: 69 },
    { index: 30,  name: 'الروم',        ename: 'Ar-Rum',           ayahs: 60 },
    { index: 31,  name: 'لقمان',        ename: 'Luqman',           ayahs: 34 },
    { index: 32,  name: 'السجدة',       ename: 'As-Sajdah',       ayahs: 30 },
    { index: 33,  name: 'الأحزاب',      ename: 'Al-Ahzab',        ayahs: 73 },
    { index: 34,  name: 'سبإ',          ename: 'Saba',             ayahs: 54 },
    { index: 35,  name: 'فاطر',         ename: 'Fatir',            ayahs: 45 },
    { index: 36,  name: 'يس',           ename: 'Ya-Sin',           ayahs: 83 },
    { index: 37,  name: 'الصافات',      ename: 'As-Saffat',       ayahs: 182 },
    { index: 38,  name: 'ص',            ename: 'Sad',              ayahs: 88 },
    { index: 39,  name: 'الزمر',        ename: 'Az-Zumar',        ayahs: 75 },
    { index: 40,  name: 'غافر',         ename: 'Ghafir',           ayahs: 85 },
    { index: 41,  name: 'فصلت',         ename: 'Fussilat',         ayahs: 54 },
    { index: 42,  name: 'الشورى',       ename: 'Ash-Shura',       ayahs: 53 },
    { index: 43,  name: 'الزخرف',       ename: 'Az-Zukhruf',      ayahs: 89 },
    { index: 44,  name: 'الدخان',       ename: 'Ad-Dukhan',       ayahs: 59 },
    { index: 45,  name: 'الجاثية',      ename: 'Al-Jathiyah',     ayahs: 37 },
    { index: 46,  name: 'الأحقاف',      ename: 'Al-Ahqaf',        ayahs: 35 },
    { index: 47,  name: 'محمد',         ename: 'Muhammad',         ayahs: 38 },
    { index: 48,  name: 'الفتح',        ename: 'Al-Fath',         ayahs: 29 },
    { index: 49,  name: 'الحجرات',      ename: 'Al-Hujurat',      ayahs: 18 },
    { index: 50,  name: 'ق',            ename: 'Qaf',              ayahs: 45 },
    { index: 51,  name: 'الذاريات',     ename: 'Adh-Dhariyat',    ayahs: 60 },
    { index: 52,  name: 'الطور',        ename: 'At-Tur',          ayahs: 49 },
    { index: 53,  name: 'النجم',        ename: 'An-Najm',         ayahs: 62 },
    { index: 54,  name: 'القمر',        ename: 'Al-Qamar',        ayahs: 55 },
    { index: 55,  name: 'الرحمن',       ename: 'Ar-Rahman',       ayahs: 78 },
    { index: 56,  name: 'الواقعة',      ename: 'Al-Waqi\'ah',     ayahs: 96 },
    { index: 57,  name: 'الحديد',       ename: 'Al-Hadid',        ayahs: 29 },
    { index: 58,  name: 'المجادلة',     ename: 'Al-Mujadilah',    ayahs: 22 },
    { index: 59,  name: 'الحشر',        ename: 'Al-Hashr',        ayahs: 24 },
    { index: 60,  name: 'الممتحنة',     ename: 'Al-Mumtahanah',   ayahs: 13 },
    { index: 61,  name: 'الصف',         ename: 'As-Saff',         ayahs: 14 },
    { index: 62,  name: 'الجمعة',       ename: 'Al-Jumu\'ah',     ayahs: 11 },
    { index: 63,  name: 'المنافقون',    ename: 'Al-Munafiqun',    ayahs: 11 },
    { index: 64,  name: 'التغابن',      ename: 'At-Taghabun',     ayahs: 18 },
    { index: 65,  name: 'الطلاق',       ename: 'At-Talaq',        ayahs: 12 },
    { index: 66,  name: 'التحريم',      ename: 'At-Tahrim',       ayahs: 12 },
    { index: 67,  name: 'الملك',        ename: 'Al-Mulk',         ayahs: 30 },
    { index: 68,  name: 'القلم',        ename: 'Al-Qalam',        ayahs: 52 },
    { index: 69,  name: 'الحاقة',       ename: 'Al-Haqqah',       ayahs: 52 },
    { index: 70,  name: 'المعارج',      ename: 'Al-Ma\'arij',     ayahs: 44 },
    { index: 71,  name: 'نوح',          ename: 'Nuh',              ayahs: 28 },
    { index: 72,  name: 'الجن',         ename: 'Al-Jinn',         ayahs: 28 },
    { index: 73,  name: 'المزمل',       ename: 'Al-Muzzammil',    ayahs: 20 },
    { index: 74,  name: 'المدثر',       ename: 'Al-Muddaththir',  ayahs: 56 },
    { index: 75,  name: 'القيامة',      ename: 'Al-Qiyamah',      ayahs: 40 },
    { index: 76,  name: 'الانسان',      ename: 'Al-Insan',        ayahs: 31 },
    { index: 77,  name: 'المرسلات',     ename: 'Al-Mursalat',     ayahs: 50 },
    { index: 78,  name: 'النبإ',        ename: 'An-Naba',         ayahs: 40 },
    { index: 79,  name: 'النازعات',     ename: 'An-Nazi\'at',     ayahs: 46 },
    { index: 80,  name: 'عبس',          ename: '\'Abasa',         ayahs: 42 },
    { index: 81,  name: 'التكوير',      ename: 'At-Takwir',       ayahs: 29 },
    { index: 82,  name: 'الإنفطار',     ename: 'Al-Infitar',      ayahs: 19 },
    { index: 83,  name: 'المطففين',     ename: 'Al-Mutaffifin',   ayahs: 36 },
    { index: 84,  name: 'الإنشقاق',     ename: 'Al-Inshiqaq',     ayahs: 25 },
    { index: 85,  name: 'البروج',       ename: 'Al-Buruj',        ayahs: 22 },
    { index: 86,  name: 'الطارق',       ename: 'At-Tariq',        ayahs: 17 },
    { index: 87,  name: 'الأعلى',       ename: 'Al-A\'la',        ayahs: 19 },
    { index: 88,  name: 'الغاشية',      ename: 'Al-Ghashiyah',    ayahs: 26 },
    { index: 89,  name: 'الفجر',        ename: 'Al-Fajr',         ayahs: 30 },
    { index: 90,  name: 'البلد',        ename: 'Al-Balad',        ayahs: 20 },
    { index: 91,  name: 'الشمس',        ename: 'Ash-Shams',       ayahs: 15 },
    { index: 92,  name: 'الليل',        ename: 'Al-Layl',         ayahs: 21 },
    { index: 93,  name: 'الضحى',        ename: 'Ad-Duha',         ayahs: 11 },
    { index: 94,  name: 'الشرح',        ename: 'Ash-Sharh',       ayahs: 8 },
    { index: 95,  name: 'التين',        ename: 'At-Tin',          ayahs: 8 },
    { index: 96,  name: 'العلق',        ename: 'Al-Alaq',         ayahs: 19 },
    { index: 97,  name: 'القدر',        ename: 'Al-Qadr',         ayahs: 5 },
    { index: 98,  name: 'البينة',       ename: 'Al-Bayyinah',     ayahs: 8 },
    { index: 99,  name: 'الزلزلة',      ename: 'Az-Zalzalah',     ayahs: 8 },
    { index: 100, name: 'العاديات',     ename: 'Al-Adiyat',       ayahs: 11 },
    { index: 101, name: 'القارعة',      ename: 'Al-Qari\'ah',     ayahs: 11 },
    { index: 102, name: 'التكاثر',      ename: 'At-Takathur',     ayahs: 8 },
    { index: 103, name: 'العصر',        ename: 'Al-Asr',          ayahs: 3 },
    { index: 104, name: 'الهمزة',       ename: 'Al-Humazah',      ayahs: 9 },
    { index: 105, name: 'الفيل',        ename: 'Al-Fil',          ayahs: 5 },
    { index: 106, name: 'قريش',         ename: 'Quraysh',          ayahs: 4 },
    { index: 107, name: 'الماعون',      ename: 'Al-Ma\'un',       ayahs: 7 },
    { index: 108, name: 'الكوثر',       ename: 'Al-Kawthar',      ayahs: 3 },
    { index: 109, name: 'الكافرون',     ename: 'Al-Kafirun',      ayahs: 6 },
    { index: 110, name: 'النصر',        ename: 'An-Nasr',         ayahs: 3 },
    { index: 111, name: 'المسد',        ename: 'Al-Masad',        ayahs: 5 },
    { index: 112, name: 'الإخلاص',      ename: 'Al-Ikhlas',       ayahs: 4 },
    { index: 113, name: 'الفلق',        ename: 'Al-Falaq',        ayahs: 5 },
    { index: 114, name: 'الناس',        ename: 'An-Nas',          ayahs: 6 },
  ];

  /* ── State ───────────────────────────────────────────────────── */
  var SURAH_AL_FATIHAH = 1;   // Bismillah is the first ayah itself
  var SURAH_AT_TAWBAH  = 9;   // No bismillah at the start
  let _xmlDoc     = null;   // parsed XML document
  let _progress   = {};     // { surahIndex: { lastAyah, completed, timestamp } }
  let _view       = 'index'; // 'index' | 'reader'
  let _currentSurah = 1;

  /* ── Arabic numeral converter ────────────────────────────────── */
  function toArabicNum(n) {
    var arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(n).replace(/[0-9]/g, function (d) { return arabicDigits[+d]; });
  }

  /* ── XML loading ─────────────────────────────────────────────── */
  async function loadXML() {
    if (_xmlDoc) return _xmlDoc;
    var resp = await fetch('assets/quran-simple-plain.xml');
    var text = await resp.text();
    var parser = new DOMParser();
    _xmlDoc = parser.parseFromString(text, 'text/xml');
    return _xmlDoc;
  }

  function getSurahAyahs(doc, surahIndex) {
    var surahEl = doc.querySelector('sura[index="' + surahIndex + '"]');
    if (!surahEl) return [];
    var ayaNodes = surahEl.querySelectorAll('aya');
    var ayahs = [];
    for (var i = 0; i < ayaNodes.length; i++) {
      ayahs.push({
        index: parseInt(ayaNodes[i].getAttribute('index'), 10),
        text:  ayaNodes[i].getAttribute('text'),
        bismillah: ayaNodes[i].getAttribute('bismillah') || ''
      });
    }
    return ayahs;
  }

  /* ── Progress persistence ────────────────────────────────────── */
  async function loadProgress() {
    try {
      var data = await firebaseGet(FIREBASE_PATH());
      if (data) {
        _progress = data;
        localStorage.setItem(STORAGE_KEY(), JSON.stringify(_progress));
      } else {
        _progress = JSON.parse(localStorage.getItem(STORAGE_KEY())) || {};
      }
    } catch (e) {
      console.warn('Firebase read failed, using localStorage:', e);
      _progress = JSON.parse(localStorage.getItem(STORAGE_KEY())) || {};
    }
  }

  async function saveProgress() {
    localStorage.setItem(STORAGE_KEY(), JSON.stringify(_progress));
    try {
      await firebasePut(FIREBASE_PATH(), _progress);
    } catch (e) {
      console.warn('Firebase write failed:', e);
    }
  }

  function markSurahProgress(surahIndex, lastAyah, completed) {
    var surah = SURAHS.find(function (s) { return s.index === surahIndex; });
    var total = surah ? surah.ayahs : lastAyah;
    _progress[surahIndex] = {
      lastAyah:  lastAyah,
      completed: completed || lastAyah >= total,
      timestamp: getKolkataTimestamp()
    };
    saveProgress();
  }

  /* ── Render entry point ──────────────────────────────────────── */
  function render() {
    _view = 'index';
    _currentSurah = 1;
    renderIndex();
    loadProgress().then(function () {
      renderIndex();
    });
  }

  /* ── Surah index view ────────────────────────────────────────── */
  function renderIndex() {
    _view = 'index';
    var totalRead = 0;
    for (var i = 0; i < SURAHS.length; i++) {
      var p = _progress[SURAHS[i].index];
      if (p && p.completed) totalRead++;
    }

    var html = '<div class="quran-container fade-in">';
    html += '<div class="quran-header">';
    html += '<h2 class="quran-title">﷽</h2>';
    html += '<h3 class="quran-subtitle">Al-Qur\'an</h3>';
    html += '<p class="quran-progress-summary">' + totalRead + ' of 114 Surahs completed</p>';
    html += '</div>';

    html += '<div class="quran-search-bar">';
    html += '<input type="text" id="quran-search" class="quran-search-input" placeholder="Search surah by name or number..." />';
    html += '</div>';

    html += '<div class="quran-surah-list" id="quran-surah-list">';
    for (var i = 0; i < SURAHS.length; i++) {
      var s = SURAHS[i];
      var p = _progress[s.index];
      var completed = p && p.completed;
      var inProgress = p && !p.completed && p.lastAyah > 0;
      var pct = 0;
      if (p) pct = Math.round((p.lastAyah / s.ayahs) * 100);
      if (completed) pct = 100;

      var statusClass = completed ? 'completed' : (inProgress ? 'in-progress' : '');

      html += '<div class="quran-surah-card ' + statusClass + '" data-surah="' + s.index + '">';
      html += '<div class="quran-surah-num">';
      html += '<span class="quran-surah-diamond">' + toArabicNum(s.index) + '</span>';
      html += '</div>';
      html += '<div class="quran-surah-info">';
      html += '<span class="quran-surah-name-ar">' + s.name + '</span>';
      html += '<span class="quran-surah-name-en">' + s.ename + '</span>';
      html += '</div>';
      html += '<div class="quran-surah-meta">';
      html += '<span class="quran-surah-ayahs">' + s.ayahs + ' Ayahs</span>';
      if (completed) {
        html += '<span class="quran-surah-status quran-done">✓</span>';
      } else if (inProgress) {
        html += '<span class="quran-surah-status quran-partial">' + pct + '%</span>';
      }
      html += '</div>';
      html += '</div>';
    }
    html += '</div>';
    html += '</div>';

    document.getElementById('app').innerHTML = html;

    // Attach event listeners
    var cards = document.querySelectorAll('.quran-surah-card');
    for (var i = 0; i < cards.length; i++) {
      cards[i].addEventListener('click', function () {
        var idx = parseInt(this.getAttribute('data-surah'), 10);
        openSurah(idx);
      });
    }

    var searchInput = document.getElementById('quran-search');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        filterSurahs(this.value.trim().toLowerCase());
      });
    }
  }

  function filterSurahs(query) {
    var cards = document.querySelectorAll('.quran-surah-card');
    for (var i = 0; i < cards.length; i++) {
      var idx = parseInt(cards[i].getAttribute('data-surah'), 10);
      var s = SURAHS[idx - 1];
      var match = !query
        || String(s.index) === query
        || s.name.indexOf(query) !== -1
        || s.ename.toLowerCase().indexOf(query) !== -1;
      cards[i].style.display = match ? '' : 'none';
    }
  }

  /* ── Surah reader view ───────────────────────────────────────── */
  async function openSurah(surahIndex) {
    _view = 'reader';
    _currentSurah = surahIndex;

    var s = SURAHS[surahIndex - 1];
    document.getElementById('app').innerHTML =
      '<div class="quran-container fade-in">'
      + '<div class="quran-reader-loading">'
      + '<p>Loading Surah ' + s.ename + '...</p>'
      + '</div></div>';

    var doc = await loadXML();
    var ayahs = getSurahAyahs(doc, surahIndex);
    renderReader(surahIndex, ayahs);
  }

  function renderReader(surahIndex, ayahs) {
    var s = SURAHS[surahIndex - 1];
    var prev = surahIndex > 1 ? surahIndex - 1 : null;
    var next = surahIndex < 114 ? surahIndex + 1 : null;
    var p = _progress[surahIndex];
    var lastRead = (p && p.lastAyah) ? p.lastAyah : 0;

    var html = '<div class="quran-container fade-in">';

    /* ── Top navigation bar ── */
    html += '<div class="quran-reader-nav">';
    html += '<button class="quran-nav-btn" id="quran-back-btn" title="Back to index">↩ Surahs</button>';
    html += '<div class="quran-reader-nav-title">';
    html += '<span class="quran-reader-surah-name">' + s.name + '</span>';
    html += '<span class="quran-reader-surah-ename">' + s.ename + ' — ' + s.ayahs + ' Ayahs</span>';
    html += '</div>';
    html += '<div class="quran-nav-arrows">';
    if (prev) {
      html += '<button class="quran-nav-btn" id="quran-prev-btn" title="' + SURAHS[prev - 1].ename + '">→</button>';
    }
    if (next) {
      html += '<button class="quran-nav-btn" id="quran-next-btn" title="' + SURAHS[next - 1].ename + '">←</button>';
    }
    html += '</div>';
    html += '</div>';

    /* ── Bismillah ── */
    // Surah 1 (Al-Fatihah): bismillah is the first ayah itself
    // Surah 9 (At-Tawbah): no bismillah
    // All others: show bismillah from the first ayah's bismillah attribute
    if (surahIndex !== SURAH_AL_FATIHAH && surahIndex !== SURAH_AT_TAWBAH && ayahs[0] && ayahs[0].bismillah) {
      html += '<div class="quran-bismillah">' + ayahs[0].bismillah + '</div>';
    }

    /* ── Ayah text ── */
    html += '<div class="quran-ayah-body" id="quran-ayah-body">';
    for (var i = 0; i < ayahs.length; i++) {
      var a = ayahs[i];
      var isRead = lastRead >= a.index;
      html += '<span class="quran-ayah' + (isRead ? ' quran-ayah-read' : '') + '" '
        + 'data-ayah="' + a.index + '">'
        + a.text
        + ' <span class="quran-ayah-number">' + toArabicNum(a.index) + '</span> '
        + '</span>';
    }
    html += '</div>';

    /* ── Bottom controls ── */
    html += '<div class="quran-reader-controls">';
    html += '<div class="quran-bookmark-bar">';
    if (lastRead > 0 && lastRead < s.ayahs) {
      html += '<span class="quran-bookmark-info">Bookmarked at Ayah ' + lastRead + ' of ' + s.ayahs + '</span>';
    } else if (p && p.completed) {
      html += '<span class="quran-bookmark-info quran-bookmark-done">✓ Completed</span>';
    }
    html += '</div>';

    html += '<div class="quran-reader-actions">';
    html += '<button class="quran-action-btn quran-mark-btn" id="quran-mark-read-btn">Mark Surah as Read</button>';
    html += '</div>';

    /* ── Prev/Next at bottom ── */
    html += '<div class="quran-reader-pager">';
    if (prev) {
      html += '<button class="quran-pager-btn" id="quran-prev-bottom">';
      html += '→ ' + SURAHS[prev - 1].name + ' (' + SURAHS[prev - 1].ename + ')';
      html += '</button>';
    } else {
      html += '<span></span>';
    }
    if (next) {
      html += '<button class="quran-pager-btn" id="quran-next-bottom">';
      html += SURAHS[next - 1].name + ' (' + SURAHS[next - 1].ename + ') ←';
      html += '</button>';
    } else {
      html += '<span></span>';
    }
    html += '</div>';
    html += '</div>';
    html += '</div>';

    document.getElementById('app').innerHTML = html;
    attachReaderListeners(surahIndex, ayahs);

    // Scroll to bookmarked ayah if resuming
    if (lastRead > 0 && lastRead < s.ayahs) {
      var target = document.querySelector('.quran-ayah[data-ayah="' + lastRead + '"]');
      if (target) {
        setTimeout(function () { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 200);
      }
    }
  }

  function attachReaderListeners(surahIndex, ayahs) {
    var s = SURAHS[surahIndex - 1];

    // Back to index
    var backBtn = document.getElementById('quran-back-btn');
    if (backBtn) backBtn.addEventListener('click', renderIndex);

    // Previous surah
    var prevBtn = document.getElementById('quran-prev-btn');
    if (prevBtn) prevBtn.addEventListener('click', function () { openSurah(surahIndex - 1); });
    var prevBottom = document.getElementById('quran-prev-bottom');
    if (prevBottom) prevBottom.addEventListener('click', function () { openSurah(surahIndex - 1); });

    // Next surah
    var nextBtn = document.getElementById('quran-next-btn');
    if (nextBtn) nextBtn.addEventListener('click', function () { openSurah(surahIndex + 1); });
    var nextBottom = document.getElementById('quran-next-bottom');
    if (nextBottom) nextBottom.addEventListener('click', function () { openSurah(surahIndex + 1); });

    // Mark complete
    var markBtn = document.getElementById('quran-mark-read-btn');
    if (markBtn) {
      markBtn.addEventListener('click', function () {
        markSurahProgress(surahIndex, s.ayahs, true);
        // Highlight all ayahs
        var els = document.querySelectorAll('.quran-ayah');
        for (var j = 0; j < els.length; j++) els[j].classList.add('quran-ayah-read');
        // Update bookmark bar
        var bar = document.querySelector('.quran-bookmark-bar');
        if (bar) bar.innerHTML = '<span class="quran-bookmark-info quran-bookmark-done">✓ Completed</span>';
        showAlert('quran-alert-zone', 'Surah marked as read', 'success');
      });
    }

    // Tap ayah to bookmark
    var ayahEls = document.querySelectorAll('.quran-ayah');
    for (var i = 0; i < ayahEls.length; i++) {
      ayahEls[i].addEventListener('click', function () {
        var ayahIdx = parseInt(this.getAttribute('data-ayah'), 10);
        markSurahProgress(surahIndex, ayahIdx, ayahIdx >= s.ayahs);

        // Update read highlights
        var all = document.querySelectorAll('.quran-ayah');
        for (var j = 0; j < all.length; j++) {
          var idx = parseInt(all[j].getAttribute('data-ayah'), 10);
          if (idx <= ayahIdx) {
            all[j].classList.add('quran-ayah-read');
          } else {
            all[j].classList.remove('quran-ayah-read');
          }
        }

        // Update bookmark bar
        var bar = document.querySelector('.quran-bookmark-bar');
        if (bar) {
          if (ayahIdx >= s.ayahs) {
            bar.innerHTML = '<span class="quran-bookmark-info quran-bookmark-done">✓ Completed</span>';
          } else {
            bar.innerHTML = '<span class="quran-bookmark-info">Bookmarked at Ayah ' + ayahIdx + ' of ' + s.ayahs + '</span>';
          }
        }
      });
    }
  }

  return { render: render };
}());
