// js/focus.js
// Focus Prep - C/C++ Concepts & Coding Interview Patterns Module for Ubiverse.
// Fetches data from assets/ and synchronizes user progress with Firebase + LocalStorage.

import { objectToArray } from './utils.js';

const FocusModule = (function () {
  'use strict';

  // Storage and Firebase Paths
  const STORAGE_KEY = () => 'focus_' + window.AppState.username;
  const FIREBASE_PATH = () => 'focus/' + window.AppState.username;

  // Module State
  let activeView = 'concepts'; // 'concepts' | 'patterns'
  let conceptsData = null;
  let patternsData = null;
  let activeChapterId = null; // null means dashboard
  let activeTab = 'learn'; // 'learn' | 'problems' | 'quiz'
  let searchQuery = '';

  let userProgress = {
    completedTopics: [],
    completedProblems: [],
    completedChapters: [],
    quizScores: {}
  };

  /* ── Render Entry Point ───────────────────────────────────── */
  async function render() {
    // Reset local module state
    activeChapterId = null;
    activeTab = 'learn';
    searchQuery = '';

    // Show initial loading skeleton inside app
    document.getElementById('app').innerHTML = `
      <div class="focus-container fade-in">
        <div class="focus-loading">
          <div class="skeleton-loader" style="height: 50px; margin-bottom: 20px;"></div>
          <div class="skeleton-loader" style="height: 400px;"></div>
        </div>
      </div>
    `;

    // Ensure data is loaded
    await fetchData();
    await loadProgress();

    // Render full layout
    renderLayout();
    showDashboard();
  }

  /* ── Fetch Data & Load Progress ───────────────────────────── */
  async function fetchData() {
    if (conceptsData && patternsData) return;
    try {
      const conceptsRes = await fetch('assets/cpp_concepts.json');
      conceptsData = await conceptsRes.json();

      const patternsRes = await fetch('assets/interview_patterns.json');
      patternsData = await patternsRes.json();
    } catch (e) {
      console.error('Error fetching Focus JSON data:', e);
      if (typeof window.showToast === 'function') {
        window.showToast('Error loading Focus knowledgebase assets.', 'error');
      }
    }
  }

  async function loadProgress() {
    try {
      const data = await window.firebaseGet(FIREBASE_PATH());
      if (data && typeof data === 'object') {
        userProgress = data;
        // Check for required arrays
        if (!userProgress.completedTopics) userProgress.completedTopics = [];
        if (!userProgress.completedProblems) userProgress.completedProblems = [];
        if (!userProgress.completedChapters) userProgress.completedChapters = [];
        if (!userProgress.quizScores) userProgress.quizScores = {};
        
        localStorage.setItem(STORAGE_KEY(), JSON.stringify(userProgress));
        return;
      }
    } catch (e) {
      console.warn('Firebase read failed, using localStorage:', e);
    }
    
    // Fallback to LocalStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY());
      if (saved) {
        userProgress = JSON.parse(saved);
        if (!userProgress.completedTopics) userProgress.completedTopics = [];
        if (!userProgress.completedProblems) userProgress.completedProblems = [];
        if (!userProgress.completedChapters) userProgress.completedChapters = [];
        if (!userProgress.quizScores) userProgress.quizScores = {};
      } else {
        resetProgressState();
      }
    } catch (_) {
      resetProgressState();
    }
  }

  function resetProgressState() {
    userProgress = {
      completedTopics: [],
      completedProblems: [],
      completedChapters: [],
      quizScores: {}
    };
  }

  async function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY(), JSON.stringify(userProgress));
      await window.firebasePut(FIREBASE_PATH(), userProgress);
      updateOverallProgress();
      if (typeof window.showToast === 'function') {
        window.showToast('Progress saved!', 'success');
      }
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }

  /* ── Layout Construction ───────────────────────────────────── */
  function renderLayout() {
    const container = document.getElementById('app');
    container.innerHTML = `
      <div class="focus-container fade-in">
        <!-- Top Toolbar Header -->
        <header class="focus-header">
          <div class="focus-brand">
            <h2>⚡ Focus Prep</h2>
            <span>Samsung R&D Interview Hub</span>
          </div>

          <div class="focus-view-toggle-container">
            <button id="focus-toggle-concepts" class="focus-toggle-btn active">
              <i data-lucide="book-open"></i> <span>Concepts</span>
            </button>
            <button id="focus-toggle-patterns" class="focus-toggle-btn">
              <i data-lucide="code-2"></i> <span>Patterns</span>
            </button>
          </div>

          <div class="focus-search-container">
            <i data-lucide="search" class="focus-search-icon"></i>
            <input type="text" id="focus-global-search" placeholder="Search topics, problems...">
            <button id="focus-clear-search" class="focus-clear-btn" style="display: none;">&times;</button>
          </div>

          <div class="focus-progress-card">
            <div class="focus-progress-info">
              <span>Overall Prep</span>
              <strong id="focus-overall-progress-text">0%</strong>
            </div>
            <div class="focus-progress-track">
              <div id="focus-overall-progress-bar" style="width: 0%;"></div>
            </div>
          </div>
        </header>

        <!-- Main Inner Workspace -->
        <div class="focus-workspace">
          <!-- Sidebar Navigation -->
          <aside class="focus-sidebar">
            <div class="focus-sidebar-header">
              <h3>Chapters</h3>
              <button id="focus-reset-btn" title="Reset all progress">
                <i data-lucide="rotate-ccw"></i> Reset
              </button>
            </div>
            <nav class="focus-chapter-list" id="focus-chapters-list"></nav>
          </aside>

          <!-- Main Viewport -->
          <main class="focus-main" id="focus-main-viewport"></main>
        </div>
      </div>
    `;

    // Bind Header Event Listeners
    document.getElementById('focus-toggle-concepts').addEventListener('click', () => switchView('concepts'));
    document.getElementById('focus-toggle-patterns').addEventListener('click', () => switchView('patterns'));
    
    const searchInput = document.getElementById('focus-global-search');
    searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    
    document.getElementById('focus-clear-search').addEventListener('click', clearSearch);
    document.getElementById('focus-reset-btn').addEventListener('click', resetAllProgress);

    // Initial Icons Draw
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  /* ── View Routing / Switching ──────────────────────────────── */
  function switchView(view) {
    if (view === activeView && activeChapterId !== null) return;
    
    activeView = view;
    activeChapterId = null;
    activeTab = 'learn';
    
    // Toggle active state classes
    document.getElementById('focus-toggle-concepts').classList.toggle('active', view === 'concepts');
    document.getElementById('focus-toggle-patterns').classList.toggle('active', view === 'patterns');
    
    clearSearch();
    renderSidebar();
    showDashboard();
    
    document.getElementById('focus-main-viewport').scrollTop = 0;
  }

  function renderSidebar() {
    const list = document.getElementById('focus-chapters-list');
    if (!list) return;
    list.innerHTML = '';

    const data = activeView === 'concepts' ? conceptsData : patternsData;
    if (!data) return;

    data.chapters.forEach(ch => {
      const itemKey = `${activeView}_${ch.id}`;
      const isCompleted = userProgress.completedChapters.includes(itemKey);
      const completionPct = calculateChapterCompletion(ch);

      const div = document.createElement('div');
      div.className = `focus-chapter-item ${activeChapterId === ch.id ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
      div.addEventListener('click', () => selectChapter(ch.id));

      div.innerHTML = `
        <div class="focus-chapter-left">
          <span class="focus-chapter-emoji">${ch.icon || '📚'}</span>
          <div class="focus-chapter-info">
            <span class="focus-chapter-title" title="${ch.title}">${ch.title}</span>
            <span class="focus-chapter-difficulty ${ch.difficulty}">${ch.difficulty}</span>
          </div>
        </div>
        <span class="focus-chapter-pct">${isCompleted ? '✓' : `${completionPct}%`}</span>
      `;
      list.appendChild(div);
    });
  }

  function calculateChapterCompletion(chapter) {
    if (activeView === 'concepts') {
      const topics = chapter.topics || [];
      if (topics.length === 0) return 0;
      let completed = 0;
      topics.forEach(t => {
        if (userProgress.completedTopics.includes(t.id)) completed++;
      });
      return Math.round((completed / topics.length) * 100);
    } else {
      const problems = chapter.problems || [];
      if (problems.length === 0) return 0;
      let completed = 0;
      problems.forEach(p => {
        if (userProgress.completedProblems.includes(p.id)) completed++;
      });
      return Math.round((completed / problems.length) * 100);
    }
  }

  /* ── Dashboard (Home) Rendering ───────────────────────────── */
  function showDashboard() {
    activeChapterId = null;
    renderSidebar();
    updateOverallProgress();

    const viewport = document.getElementById('focus-main-viewport');
    if (!viewport) return;

    viewport.innerHTML = `
      <div class="focus-dashboard">
        <!-- Hero section -->
        <div class="focus-hero-card">
          <span class="focus-hero-tag">Welcome, ${window.AppState.displayName || 'Developer'}</span>
          <h2>Resume C++ & Coding Preparation</h2>
          <p>Exhaustive C/C++ engineering and coding pattern guide designed for senior software developers aiming for Nvidia, Google, Qualcomm, Arista Networks, and Ericsson.</p>
          
          <div class="focus-dashboard-stats">
            <div class="focus-stat-card">
              <i data-lucide="book-marked"></i>
              <div class="focus-stat-text">
                <span id="dash-concepts-read">0/0</span>
                <span>Concepts Read</span>
              </div>
            </div>
            <div class="focus-stat-card">
              <i data-lucide="check-circle"></i>
              <div class="focus-stat-text">
                <span id="dash-problems-solved">0/0</span>
                <span>Problems Solved</span>
              </div>
            </div>
            <div class="focus-stat-card">
              <i data-lucide="award"></i>
              <div class="focus-stat-text">
                <span id="dash-quizzes-passed">0/0</span>
                <span>Quizzes Cleared</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard roadmap paths -->
        <div class="focus-dashboard-columns">
          <div class="focus-path-card">
            <h3><i data-lucide="graduation-cap"></i> C/C++ Systems Path</h3>
            <ul class="focus-path-list" id="dash-concepts-path"></ul>
          </div>
          <div class="focus-path-card">
            <h3><i data-lucide="terminal"></i> Coding Patterns Path</h3>
            <ul class="focus-path-list" id="dash-patterns-path"></ul>
          </div>
        </div>
      </div>
    `;

    renderDashboardPaths();
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  function renderDashboardPaths() {
    const conceptsList = document.getElementById('dash-concepts-path');
    const patternsList = document.getElementById('dash-patterns-path');
    if (!conceptsList || !patternsList) return;

    if (conceptsData) {
      conceptsData.chapters.forEach(ch => {
        const itemKey = `concepts_${ch.id}`;
        const isCompleted = userProgress.completedChapters.includes(itemKey);
        const compPct = calculateChapterCompletion(ch);
        const li = document.createElement('li');
        li.className = 'focus-path-item';
        li.addEventListener('click', () => {
          switchView('concepts');
          selectChapter(ch.id);
        });
        li.innerHTML = `
          <span>${ch.icon || '🎯'} ${ch.title}</span>
          <span class="focus-path-item-status ${isCompleted ? 'done' : ''}">${isCompleted ? 'Done ✓' : `${compPct}%`}</span>
        `;
        conceptsList.appendChild(li);
      });
    }

    if (patternsData) {
      patternsData.chapters.forEach(ch => {
        const itemKey = `patterns_${ch.id}`;
        const isCompleted = userProgress.completedChapters.includes(itemKey);
        const compPct = calculateChapterCompletion(ch);
        const li = document.createElement('li');
        li.className = 'focus-path-item';
        li.addEventListener('click', () => {
          switchView('patterns');
          selectChapter(ch.id);
        });
        li.innerHTML = `
          <span>${ch.icon || '🧩'} ${ch.title}</span>
          <span class="focus-path-item-status ${isCompleted ? 'done' : ''}">${isCompleted ? 'Done ✓' : `${compPct}%`}</span>
        `;
        patternsList.appendChild(li);
      });
    }

    updateDashboardCounters();
  }

  function updateDashboardCounters() {
    if (!conceptsData || !patternsData) return;

    let readCount = userProgress.completedTopics.length;
    let totalTopics = 0;
    conceptsData.chapters.forEach(ch => totalTopics += (ch.topics || []).length);

    let solvedCount = userProgress.completedProblems.length;
    let totalProblems = 0;
    patternsData.chapters.forEach(ch => totalProblems += (ch.problems || []).length);

    let passedQuizzes = Object.keys(userProgress.quizScores).length;
    let totalQuizzes = conceptsData.chapters.length + patternsData.chapters.length;

    const readEl = document.getElementById('dash-concepts-read');
    if (readEl) readEl.textContent = `${readCount}/${totalTopics}`;

    const solvedEl = document.getElementById('dash-problems-solved');
    if (solvedEl) solvedEl.textContent = `${solvedCount}/${totalProblems}`;

    const quizEl = document.getElementById('dash-quizzes-passed');
    if (quizEl) quizEl.textContent = `${passedQuizzes}/${totalQuizzes}`;
  }

  /* ── Chapter Navigation & Tab Control ─────────────────────── */
  function selectChapter(chapterId) {
    activeChapterId = chapterId;
    renderSidebar();

    const viewport = document.getElementById('focus-main-viewport');
    if (!viewport) return;

    const data = activeView === 'concepts' ? conceptsData : patternsData;
    const chapter = data.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const chapterKey = `${activeView}_${chapter.id}`;
    const isCompleted = userProgress.completedChapters.includes(chapterKey);

    // Setup active default tab
    if (activeView === 'concepts' && activeTab === 'problems') {
      activeTab = 'learn';
    } else if (activeView === 'patterns' && activeTab === 'learn') {
      activeTab = 'problems';
    }

    viewport.innerHTML = `
      <div class="focus-chapter-view">
        <!-- Header details card -->
        <header class="focus-chapter-header">
          <div class="focus-chapter-meta">
            <span class="focus-difficulty-badge ${chapter.difficulty}">${chapter.difficulty}</span>
            <span>Chapter ${chapter.id}</span>
          </div>
          <div class="focus-chapter-title-row">
            <h2>${chapter.icon || '📚'} ${chapter.title}</h2>
            <label class="focus-checkbox-container">
              <input type="checkbox" id="focus-chapter-complete-chk" ${isCompleted ? 'checked' : ''}>
              <span class="focus-checkmark"></span>
              <span>Complete</span>
            </label>
          </div>
          <p class="focus-chapter-desc">${chapter.description}</p>
          
          <!-- Patterns Overview (Only patterns view) -->
          ${activeView === 'patterns' ? `
            <div class="focus-pattern-overview">
              <h4>Pattern Intuition</h4>
              <p>${marked.parse(chapter.patternOverview || '')}</p>
              ${chapter.whenToUse && chapter.whenToUse.length > 0 ? `
                <div class="focus-when-to-use">
                  <strong>When to Use:</strong>
                  <ul>
                    ${chapter.whenToUse.map(u => `<li>${u}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </header>

        <!-- Chapter internal navigation tabs -->
        <div class="focus-tabs-bar">
          <button class="focus-tab ${activeTab === 'learn' ? 'active' : ''}" id="focus-tab-learn" style="display:${activeView === 'concepts' ? 'block' : 'none'}">
            <i data-lucide="book-open"></i> Learn Concepts
          </button>
          <button class="focus-tab ${activeTab === 'problems' ? 'active' : ''}" id="focus-tab-problems" style="display:${activeView === 'patterns' ? 'block' : 'none'}">
            <i data-lucide="code-2"></i> Coding Problems
          </button>
          <button class="focus-tab ${activeTab === 'quiz' ? 'active' : ''}" id="focus-tab-quiz">
            <i data-lucide="award"></i> Chapter Quiz
          </button>
        </div>

        <!-- Panels Container -->
        <div class="focus-tab-panels">
          <div id="focus-panel-learn" class="focus-panel" style="display:${activeTab === 'learn' ? 'flex' : 'none'}"></div>
          <div id="focus-panel-problems" class="focus-panel" style="display:${activeTab === 'problems' ? 'flex' : 'none'}"></div>
          <div id="focus-panel-quiz" class="focus-panel" style="display:${activeTab === 'quiz' ? 'flex' : 'none'}"></div>
        </div>
      </div>
    `;

    // Bind Listeners
    document.getElementById('focus-chapter-complete-chk').addEventListener('change', (e) => {
      toggleChapterCompletion(e.target.checked);
    });

    const btnLearn = document.getElementById('focus-tab-learn');
    btnLearn.addEventListener('click', () => switchTab('learn', chapter));

    const btnProblems = document.getElementById('focus-tab-problems');
    btnProblems.addEventListener('click', () => switchTab('problems', chapter));

    const btnQuiz = document.getElementById('focus-tab-quiz');
    btnQuiz.addEventListener('click', () => switchTab('quiz', chapter));

    // Fill active panel data
    switchTab(activeTab, chapter);
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  function switchTab(tab, chapter) {
    activeTab = tab;

    // Toggle active buttons
    document.querySelectorAll('.focus-tab').forEach(b => {
      b.classList.toggle('active', b.id === `focus-tab-${tab}`);
    });

    // Toggle panels
    document.querySelectorAll('.focus-panel').forEach(p => {
      p.style.display = p.id === `focus-panel-${tab}` ? 'flex' : 'none';
    });

    const panel = document.getElementById(`focus-panel-${tab}`);

    if (tab === 'learn') {
      renderLearnPanel(panel, chapter);
    } else if (tab === 'problems') {
      renderProblemsPanel(panel, chapter);
    } else if (tab === 'quiz') {
      renderQuizPanel(panel, chapter);
    }

    // Prism Highlight
    setTimeout(() => {
      if (typeof Prism !== 'undefined' && panel) {
        Prism.highlightAllUnder(panel);
      }
    }, 50);
  }

  /* ── Panel Render Functions ────────────────────────────────── */
  function renderLearnPanel(panel, chapter) {
    panel.innerHTML = '';
    const topics = chapter.topics || [];

    topics.forEach(t => {
      const isCompleted = userProgress.completedTopics.includes(t.id);
      const card = document.createElement('article');
      card.className = `focus-topic-card ${isCompleted ? 'completed' : ''}`;
      card.id = `topic-${t.id.replace('.', '-')}`;

      // Build examples code HTML
      let examplesHtml = '';
      if (t.codeExamples) {
        t.codeExamples.forEach(ex => {
          examplesHtml += `
            <div class="focus-code-card">
              <div class="focus-code-card-header">
                <span>${ex.title}</span>
                <span class="focus-code-lang">${ex.language}</span>
              </div>
              <pre class="language-${ex.language}"><code>${escapeHtml(ex.code)}</code></pre>
              ${ex.explanation ? `<div class="focus-code-desc">${marked.parse(ex.explanation)}</div>` : ''}
            </div>
          `;
        });
      }

      // Build common pitfalls HTML
      let mistakesHtml = '';
      if (t.commonMistakes && t.commonMistakes.length > 0) {
        mistakesHtml = `
          <div class="focus-alert-card focus-pitfalls">
            <h5><i data-lucide="alert-triangle"></i> Common Pitfalls</h5>
            <ul>
              ${t.commonMistakes.map(m => `<li>${marked.parseInline(m)}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      // Build interview tips HTML
      let tipsHtml = '';
      if (t.interviewTips && t.interviewTips.length > 0) {
        tipsHtml = `
          <div class="focus-alert-card focus-tips">
            <h5><i data-lucide="lightbulb"></i> Interview Tips</h5>
            <ul>
              ${t.interviewTips.map(tip => `<li>${marked.parseInline(tip)}</li>`).join('')}
            </ul>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="focus-topic-card-header">
          <h4>${t.title}</h4>
          <label class="focus-checkbox-container">
            <input type="checkbox" id="chk-topic-${t.id.replace('.', '-')}" ${isCompleted ? 'checked' : ''}>
            <span class="focus-checkmark"></span>
            <span style="font-size:0.75rem;">Read</span>
          </label>
        </div>

        <div class="focus-topic-content">
          ${marked.parse(t.explanation || '')}
        </div>

        ${t.keyPoints && t.keyPoints.length > 0 ? `
          <div class="focus-key-points">
            <h5>Key Points</h5>
            <ul>
              ${t.keyPoints.map(kp => `<li>${marked.parseInline(kp)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${examplesHtml}

        ${(mistakesHtml || tipsHtml) ? `
          <div class="focus-alert-grid">
            ${mistakesHtml}
            ${tipsHtml}
          </div>
        ` : ''}
      `;

      panel.appendChild(card);

      // Event listener for completion checkmark
      card.querySelector(`#chk-topic-${t.id.replace('.', '-')}`).addEventListener('change', (e) => {
        toggleTopicCompletion(t.id, e.target.checked);
      });
    });

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  }

  function renderProblemsPanel(panel, chapter) {
    panel.innerHTML = '';

    // Render Pattern templates first
    const patternSection = document.createElement('div');
    patternSection.className = 'focus-pattern-templates-section';
    const patterns = chapter.patterns || [];

    patterns.forEach(pat => {
      const pCard = document.createElement('div');
      pCard.className = 'focus-pattern-card';
      pCard.id = `pattern-${pat.id.replace('.', '-')}`;
      pCard.innerHTML = `
        <div class="focus-pattern-card-header">
          <h4>${pat.name}</h4>
          <div class="focus-comp-group">
            <span class="focus-tag focus-tag-time">Time: ${pat.timeComplexity}</span>
            <span class="focus-tag focus-tag-space">Space: ${pat.spaceComplexity}</span>
          </div>
        </div>
        <p>${pat.description}</p>
        <div class="focus-intuition">
          <strong>Intuition:</strong> ${pat.intuition}
        </div>
        <div class="focus-code-card" style="margin-top:10px;">
          <pre class="language-cpp"><code>${escapeHtml(pat.template || '')}</code></pre>
        </div>
      `;
      patternSection.appendChild(pCard);
    });
    panel.appendChild(patternSection);

    // Render LeetCode Coding Problems list
    const problemsSection = document.createElement('div');
    problemsSection.className = 'focus-problems-section';
    const problems = chapter.problems || [];

    problems.forEach(prob => {
      const isSolved = userProgress.completedProblems.includes(prob.id);
      const card = document.createElement('article');
      card.className = `focus-problem-card ${isSolved ? 'solved' : ''}`;
      card.id = `problem-${prob.id}`;

      let examplesHtml = '';
      if (prob.examples) {
        prob.examples.forEach((ex, idx) => {
          examplesHtml += `
            <div class="focus-example-item">
              <strong>Example ${idx + 1}:</strong><br>
              <strong>Input:</strong> ${ex.input}<br>
              <strong>Output:</strong> ${ex.output}<br>
              ${ex.explanation ? `<strong>Explanation:</strong> ${ex.explanation}` : ''}
            </div>
          `;
        });
      }

      card.innerHTML = `
        <div class="focus-problem-card-header">
          <div>
            <h4>${prob.title}</h4>
            <span class="focus-problem-src">${prob.source || ''}</span>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
            <span class="focus-difficulty-badge ${prob.difficulty}">${prob.difficulty}</span>
            <label class="focus-checkbox-container">
              <input type="checkbox" id="chk-prob-${prob.id}" ${isSolved ? 'checked' : ''}>
              <span class="focus-checkmark"></span>
              <span style="font-size:0.75rem;">Solved</span>
            </label>
          </div>
        </div>

        <div class="focus-problem-statement">
          ${marked.parse(prob.problemStatement || '')}
        </div>

        <div class="focus-problem-examples">
          ${examplesHtml}
        </div>

        ${prob.constraints && prob.constraints.length > 0 ? `
          <div class="focus-problem-details">
            <strong>Constraints:</strong>
            <ul>
              ${prob.constraints.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- Tabs switcher for optimal vs brute force C++ solution code -->
        <div class="focus-problem-code-tabs">
          <button class="focus-code-tab active" id="btn-opt-${prob.id}">Optimal Solution</button>
          ${prob.bruteForce ? `<button class="focus-code-tab" id="btn-brute-${prob.id}">Brute Force</button>` : ''}
        </div>

        <!-- Optimal Code Block -->
        <div class="focus-code-panel active" id="panel-opt-${prob.id}">
          <div class="focus-solution-meta">
            <span><strong>Approach:</strong> ${prob.optimalSolution.approach}</span>
            <div class="focus-comp-group">
              <span class="focus-tag focus-tag-time">Time: ${prob.optimalSolution.timeComplexity}</span>
              <span class="focus-tag focus-tag-space">Space: ${prob.optimalSolution.spaceComplexity}</span>
            </div>
          </div>
          <div class="focus-code-card">
            <pre class="language-cpp"><code>${escapeHtml(prob.optimalSolution.code)}</code></pre>
          </div>
          ${prob.optimalSolution.walkthrough ? `<div class="focus-code-desc">${marked.parse(prob.optimalSolution.walkthrough)}</div>` : ''}
        </div>

        <!-- Brute Force Code Block -->
        ${prob.bruteForce ? `
          <div class="focus-code-panel" id="panel-brute-${prob.id}" style="display:none;">
            <div class="focus-solution-meta">
              <span><strong>Approach:</strong> ${prob.bruteForce.approach}</span>
              <div class="focus-comp-group">
                <span class="focus-tag focus-tag-time">Time: ${prob.bruteForce.timeComplexity}</span>
                <span class="focus-tag focus-tag-space">Space: ${prob.bruteForce.spaceComplexity}</span>
              </div>
            </div>
            ${prob.bruteForce.code ? `
              <div class="focus-code-card">
                <pre class="language-cpp"><code>${escapeHtml(prob.bruteForce.code)}</code></pre>
              </div>
            ` : ''}
          </div>
        ` : ''}
      `;

      problemsSection.appendChild(card);

      // Event Checkbox solved
      card.querySelector(`#chk-prob-${prob.id}`).addEventListener('change', (e) => {
        toggleProblemCompletion(prob.id, e.target.checked);
      });

      // Bind code tabs switches
      const btnOpt = card.querySelector(`#btn-opt-${prob.id}`);
      const btnBrute = card.querySelector(`#btn-brute-${prob.id}`);
      
      const optPanel = card.querySelector(`#panel-opt-${prob.id}`);
      const brutePanel = card.querySelector(`#panel-brute-${prob.id}`);

      btnOpt.addEventListener('click', () => {
        btnOpt.classList.add('active');
        if (btnBrute) btnBrute.classList.remove('active');
        optPanel.style.display = 'block';
        if (brutePanel) brutePanel.style.display = 'none';
        if (typeof Prism !== 'undefined') Prism.highlightAllUnder(optPanel);
      });

      if (btnBrute) {
        btnBrute.addEventListener('click', () => {
          btnBrute.classList.add('active');
          btnOpt.classList.remove('active');
          brutePanel.style.display = 'block';
          optPanel.style.display = 'none';
          if (typeof Prism !== 'undefined') Prism.highlightAllUnder(brutePanel);
        });
      }
    });

    panel.appendChild(problemsSection);
  }

  function renderQuizPanel(panel, chapter) {
    const quizQuestions = activeView === 'concepts' 
        ? (chapter.quizQuestions || []) 
        : (chapter.chapterQuiz || []);

    const scoreKey = `${activeView}_${chapter.id}`;
    const previousGrade = userProgress.quizScores[scoreKey];

    let questionsHtml = '';
    
    if (quizQuestions.length === 0) {
      panel.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-muted);">No quiz questions defined for this chapter.</div>';
      return;
    }

    quizQuestions.forEach((q, idx) => {
      let codeBlock = '';
      if (q.code) {
        codeBlock = `
          <div class="focus-code-card" style="margin-bottom:10px;">
            <pre class="language-cpp"><code>${escapeHtml(q.code)}</code></pre>
          </div>
        `;
      }

      questionsHtml += `
        <div class="focus-quiz-question-card" id="fq-card-${idx}">
          <div class="focus-quiz-question-meta">
            <span>Question ${idx + 1} of ${quizQuestions.length}</span>
            <span>Type: ${q.type ? q.type.replace('_', ' ') : 'Multiple Choice'}</span>
          </div>
          <p class="focus-question-text">${marked.parseInline(q.question)}</p>
          ${codeBlock}
          <div class="focus-quiz-options-list">
            ${q.options.map((opt, optIdx) => `
              <label class="focus-option-label" data-q-idx="${idx}" data-opt-idx="${optIdx}">
                <input type="radio" name="fq-option-${idx}" value="${optIdx}">
                <span class="focus-option-dot"></span>
                <span>${escapeHtml(opt)}</span>
              </label>
            `).join('')}
          </div>
          <div class="focus-quiz-explanation" id="fq-explanation-${idx}">
            <strong>Explanation:</strong> ${q.explanation ? marked.parse(q.explanation) : 'N/A'}
          </div>
        </div>
      `;
    });

    panel.innerHTML = `
      <div class="focus-quiz-box">
        <div class="focus-quiz-header">
          <div>
            <h4>Chapter Assessment</h4>
            <p>Score details will be submitted to the profile progress tracker.</p>
          </div>
          <div id="focus-quiz-status-lbl" style="font-weight:700; color:${previousGrade ? 'var(--color-primary)' : 'var(--text-muted)'}">
            ${previousGrade ? `Graded: ${previousGrade.score}/${previousGrade.total}` : 'Not Started'}
          </div>
        </div>

        <div class="focus-quiz-questions">
          ${questionsHtml}
        </div>

        <div class="focus-quiz-footer">
          <button class="btn btn-primary" id="focus-grade-quiz-btn">Grade Assessment</button>
          <div id="focus-quiz-result-lbl" style="display:none; font-weight:700;"></div>
        </div>
      </div>
    `;

    // Bind options radio clicks
    panel.querySelectorAll('.focus-option-label').forEach(lbl => {
      lbl.addEventListener('click', function () {
        const qIdx = this.getAttribute('data-q-idx');
        const card = document.getElementById(`fq-card-${qIdx}`);
        
        // Prevent selection change if already graded
        if (card.classList.contains('graded-correct') || card.classList.contains('graded-incorrect')) {
          return;
        }

        card.querySelectorAll('.focus-option-label').forEach(o => {
          o.classList.remove('selected');
        });
        this.classList.add('selected');
        this.querySelector('input').checked = true;
      });
    });

    // Grade button listener
    document.getElementById('focus-grade-quiz-btn').addEventListener('click', () => {
      gradeQuiz(chapter, quizQuestions);
    });
  }

  function gradeQuiz(chapter, quizQuestions) {
    let correctCount = 0;

    quizQuestions.forEach((q, idx) => {
      const card = document.getElementById(`fq-card-${idx}`);
      card.classList.remove('graded-correct', 'graded-incorrect');
      card.querySelectorAll('.focus-option-label').forEach(l => {
        l.classList.remove('graded-correct-card', 'graded-incorrect-card');
      });

      const selected = card.querySelector(`input[name="fq-option-${idx}"]:checked`);
      const selectedIdx = selected ? parseInt(selected.value) : -1;

      let correctIdx = -1;
      if (typeof q.correctAnswer === 'number') {
        correctIdx = q.correctAnswer;
      } else {
        correctIdx = q.options.findIndex(opt => opt.trim() === q.correctAnswer.trim());
        if (correctIdx === -1 && q.correctAnswer.length === 1) {
          correctIdx = q.correctAnswer.charCodeAt(0) - 65; // 'A' = 0
        }
      }

      const isCorrect = (selectedIdx === correctIdx);
      if (isCorrect) {
        correctCount++;
        card.classList.add('graded-correct');
      } else {
        card.classList.add('graded-incorrect');
        if (selected) {
          selected.closest('.focus-option-label').classList.add('graded-incorrect-card');
        }
      }

      if (correctIdx >= 0 && correctIdx < q.options.length) {
        card.querySelectorAll('.focus-option-label')[correctIdx].classList.add('graded-correct-card');
      }

      const exp = document.getElementById(`fq-explanation-${idx}`);
      if (exp) exp.classList.add('show');
    });

    // Save quiz score
    const scoreKey = `${activeView}_${activeChapterId}`;
    userProgress.quizScores[scoreKey] = {
      score: correctCount,
      total: quizQuestions.length
    };

    // Update views
    const scoreText = `Score: ${correctCount}/${quizQuestions.length} (${Math.round((correctCount / quizQuestions.length) * 100)}%)`;
    const lbl = document.getElementById('focus-quiz-result-lbl');
    lbl.textContent = scoreText;
    lbl.style.display = 'block';

    const status = document.getElementById('focus-quiz-status-lbl');
    status.textContent = `Graded: ${correctCount}/${quizQuestions.length}`;
    status.style.color = correctCount === quizQuestions.length ? 'var(--color-primary)' : 'var(--color-warning)';

    saveProgress();

    // Auto complete chapter on 100% quiz score
    if (correctCount === quizQuestions.length) {
      toggleChapterCompletion(true);
    }
  }

  /* ── Interactive Progress Toggles ──────────────────────────── */
  function toggleChapterCompletion(isChecked) {
    const chapterKey = `${activeView}_${activeChapterId}`;
    if (isChecked) {
      if (!userProgress.completedChapters.includes(chapterKey)) {
        userProgress.completedChapters.push(chapterKey);
      }
    } else {
      userProgress.completedChapters = userProgress.completedChapters.filter(k => k !== chapterKey);
    }

    const chk = document.getElementById('focus-chapter-complete-chk');
    if (chk) chk.checked = isChecked;

    saveProgress();
    renderSidebar();
  }

  function toggleTopicCompletion(topicId, isChecked) {
    if (isChecked) {
      if (!userProgress.completedTopics.includes(topicId)) {
        userProgress.completedTopics.push(topicId);
      }
    } else {
      userProgress.completedTopics = userProgress.completedTopics.filter(id => id !== topicId);
    }

    const card = document.getElementById(`topic-${topicId.replace('.', '-')}`);
    if (card) card.classList.toggle('completed', isChecked);

    saveProgress();
    renderSidebar();
  }

  function toggleProblemCompletion(problemId, isChecked) {
    if (isChecked) {
      if (!userProgress.completedProblems.includes(problemId)) {
        userProgress.completedProblems.push(problemId);
      }
    } else {
      userProgress.completedProblems = userProgress.completedProblems.filter(id => id !== problemId);
    }

    const card = document.getElementById(`problem-${problemId}`);
    if (card) card.classList.toggle('solved', isChecked);

    saveProgress();
    renderSidebar();
  }

  function resetAllProgress() {
    if (confirm('Are you sure you want to reset all C++ & interview preparation progress? This will delete all completed tags and quiz results.')) {
      resetProgressState();
      saveProgress();
      if (activeChapterId !== null) {
        selectChapter(activeChapterId);
      } else {
        showDashboard();
      }
    }
  }

  function updateOverallProgress() {
    if (!conceptsData || !patternsData) return;

    let total = 0;
    let completed = 0;

    conceptsData.chapters.forEach(ch => {
      (ch.topics || []).forEach(t => {
        total++;
        if (userProgress.completedTopics.includes(t.id)) completed++;
      });
    });

    patternsData.chapters.forEach(ch => {
      (ch.problems || []).forEach(p => {
        total++;
        if (userProgress.completedProblems.includes(p.id)) completed++;
      });
    });

    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const textEl = document.getElementById('focus-overall-progress-text');
    const barEl = document.getElementById('focus-overall-progress-bar');
    
    if (textEl) textEl.textContent = `${pct}%`;
    if (barEl) barEl.style.width = `${pct}%`;
  }

  /* ── Search Features ───────────────────────────────────────── */
  function handleSearch(query) {
    searchQuery = query.trim().toLowerCase();
    const clearBtn = document.getElementById('focus-clear-search');
    const viewport = document.getElementById('focus-main-viewport');

    if (!searchQuery) {
      clearSearch();
      return;
    }

    clearBtn.style.display = 'block';
    activeChapterId = null;
    renderSidebar();

    const matches = [];

    // Search concepts
    if (conceptsData) {
      conceptsData.chapters.forEach(ch => {
        if (ch.title.toLowerCase().includes(searchQuery)) {
          matches.push({ type: 'chapter', view: 'concepts', chapterId: ch.id, title: ch.title, snippet: ch.description, icon: ch.icon || '📚' });
        }
        (ch.topics || []).forEach(t => {
          if (t.title.toLowerCase().includes(searchQuery) || t.explanation.toLowerCase().includes(searchQuery)) {
            matches.push({ type: 'topic', view: 'concepts', chapterId: ch.id, topicId: t.id, chapterTitle: ch.title, title: t.title, snippet: t.explanation.substring(0, 100) + '...', icon: '📄' });
          }
        });
      });
    }

    // Search patterns
    if (patternsData) {
      patternsData.chapters.forEach(ch => {
        if (ch.title.toLowerCase().includes(searchQuery)) {
          matches.push({ type: 'chapter', view: 'patterns', chapterId: ch.id, title: ch.title, snippet: ch.description, icon: ch.icon || '📚' });
        }
        (ch.problems || []).forEach(p => {
          const compMatch = (p.companiesAsked || []).some(c => c.toLowerCase().includes(searchQuery));
          if (p.title.toLowerCase().includes(searchQuery) || p.problemStatement.toLowerCase().includes(searchQuery) || compMatch) {
            matches.push({ type: 'problem', view: 'patterns', chapterId: ch.id, problemId: p.id, chapterTitle: ch.title, title: p.title, snippet: p.problemStatement.substring(0, 100) + '...', icon: '💻' });
          }
        });
      });
    }

    viewport.innerHTML = `
      <div class="focus-search-results">
        <h3>Search Results for "${escapeHtml(query)}"</h3>
        <p>Found ${matches.length} matching entries.</p>
        <div class="focus-search-list">
          ${matches.length === 0 ? '<p class="text-muted" style="padding:20px;">No matches found. Try searching different terms.</p>' : ''}
        </div>
      </div>
    `;

    const list = viewport.querySelector('.focus-search-list');
    matches.forEach(m => {
      const card = document.createElement('div');
      card.className = 'focus-search-card';
      card.addEventListener('click', () => {
        navigateToSearchResult(m);
      });
      card.innerHTML = `
        <div class="focus-search-card-meta">
          <span>${m.icon}</span>
          <span>${m.view === 'concepts' ? 'Concepts' : 'Patterns'} Path ${m.chapterTitle ? `• ${m.chapterTitle}` : ''}</span>
        </div>
        <h4>${m.title}</h4>
        <p>${m.snippet}</p>
      `;
      list.appendChild(card);
    });
  }

  function navigateToSearchResult(m) {
    document.getElementById('focus-global-search').value = '';
    document.getElementById('focus-clear-search').style.display = 'none';
    searchQuery = '';

    switchView(m.view);
    selectChapter(m.chapterId);

    if (m.type === 'topic') {
      switchTab('learn', conceptsData.chapters.find(c => c.id === m.chapterId));
      setTimeout(() => {
        const card = document.getElementById(`topic-${m.topicId.replace('.', '-')}`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.style.border = '1px solid var(--color-primary)';
          setTimeout(() => { card.style.border = ''; }, 3000);
        }
      }, 150);
    } else if (m.type === 'problem') {
      switchTab('problems', patternsData.chapters.find(c => c.id === m.chapterId));
      setTimeout(() => {
        const card = document.getElementById(`problem-${m.problemId}`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.style.border = '1px solid var(--color-primary)';
          setTimeout(() => { card.style.border = ''; }, 3000);
        }
      }, 150);
    }
  }

  function clearSearch() {
    document.getElementById('focus-global-search').value = '';
    document.getElementById('focus-clear-search').style.display = 'none';
    searchQuery = '';
    
    if (activeChapterId !== null) {
      selectChapter(activeChapterId);
    } else {
      showDashboard();
    }
  }

  /* ── String Escaping Helpers ───────────────────────────────── */
  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return { render };
}());

export { FocusModule };
