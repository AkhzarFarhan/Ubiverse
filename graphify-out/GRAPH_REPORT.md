# Graph Report - Ubiverse  (2026-06-24)

## Corpus Check
- 36 files · ~74,879 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 581 nodes · 965 edges · 32 communities (31 shown, 1 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 86 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7e246479`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]

## God Nodes (most connected - your core abstractions)
1. `rules` - 14 edges
2. `loadDashboardData()` - 14 edges
3. `submit()` - 14 edges
4. `submit()` - 13 edges
5. `submit()` - 13 edges
6. `showAlert()` - 13 edges
7. `firebaseGet()` - 12 edges
8. `getKolkataTimestamp()` - 12 edges
9. `clearAlert()` - 10 edges
10. `Ubiverse Rules` - 10 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --calls--> `sendTelegramForLedger()`  [INFERRED]
  js/ledger.js → js/firebase.js
- `submit()` --calls--> `getKolkataDate()`  [INFERRED]
  js/salah.js → js/utils.js
- `submit()` --calls--> `showAlert()`  [INFERRED]
  js/car.js → js/utils.js
- `submit()` --calls--> `clearAlert()`  [INFERRED]
  js/car.js → js/utils.js
- `submit()` --calls--> `firebasePost()`  [INFERRED]
  js/car.js → js/firebase.js

## Communities (32 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (34): getSavedDeviceId(), deletePassenger(), deleteRide(), fetchAndRenderList(), formatFridayDate(), formatShortDate(), formatTime12Hour(), getCutoffTimestamp() (+26 more)

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (36): escapeHtml(), FIREBASE_PATH(), getEntries(), loadData(), render(), renderList(), STORAGE_KEY(), submit() (+28 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (32): APP_ICONS, APP_NAMES, careApiFetch(), CareModule, clearTimers(), fetchDevice(), fetchEvents(), fetchPermissions() (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (35): bindEvents(), _board, buildSaveState(), _candidates, checkWin(), cloneGrid(), countSolutions(), createGrid() (+27 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (33): appJs, conflictFiles, content, crudFunctions, dirPath, extensions, extraRoutes, firebaseJs (+25 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (32): diagrams, description, harq_timeline, mac_rlc_dl_flow, overall_architecture, rach_procedure, document, expert_overview (+24 more)

### Community 6 - "Community 6"
Cohesion: 0.15
Nodes (29): clearSearch(), escapeHtml(), fetchData(), FIREBASE_PATH(), gradeQuiz(), handleSearch(), loadProgress(), navigateToSearchResult() (+21 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (30): $username, .read, .write, $username, $username, $username, .read, .write (+22 more)

### Community 8 - "Community 8"
Cohesion: 0.23
Nodes (18): actualDaysLeft(), consolidateByDate(), dateDiffDays(), ensureChartJS(), FARZ_RAKA, FIREBASE_PATH(), getEntries(), loadData() (+10 more)

### Community 9 - "Community 9"
Cohesion: 0.23
Nodes (18): applyModeUI(), FIREBASE_PATH(), getStateObj(), handleKey(), loadState(), onComplete(), phaseInfo(), PHASES (+10 more)

### Community 10 - "Community 10"
Cohesion: 0.23
Nodes (18): chartInstances, drawChart(), escapeHtml(), FIREBASE_PATH(), getEntries(), loadChartJsAndDraw(), loadData(), MODE_SHORT (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (18): 1. Create a Firebase Project, 2. Configure the App, 3. Deploy Security Rules, 4. Login Flow, 5. Telegram Notifications (optional), Architecture, code:block1 (Ubiverse/), code:bash (cp js/env.js.example js/env.js) (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.22
Nodes (17): firebasePut(), attachReaderListeners(), filterSurahs(), FIREBASE_PATH(), getSurahAyahs(), loadProgress(), loadXML(), markSurahProgress() (+9 more)

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (16): bindFirebaseConnected(), enqueue(), executeOp(), flush(), generateSyncId(), loadQueue(), loadSyncedIds(), pendingCount() (+8 more)

### Community 14 - "Community 14"
Cohesion: 0.30
Nodes (15): autoCalcFromCost(), autoCalcFromVolume(), escapeHtml(), FIREBASE_PATH(), FUEL_RATE_KEY(), getEntries(), loadData(), processCarData() (+7 more)

### Community 15 - "Community 15"
Cohesion: 0.16
Nodes (10): cachedUser, closeSidebar(), hamburger, MODULES, navigate(), overlay, ROUTES, showApp() (+2 more)

### Community 16 - "Community 16"
Cohesion: 0.15
Nodes (12): Al-Qur'an, Home, Ledger, Module map, Notable module behaviors, Salah, Shared module expectations, Tasbih (+4 more)

### Community 17 - "Community 17"
Cohesion: 0.15
Nodes (12): Best results tips, Constraints, Deliverables, Example prompt, Full prompt template, Goal, Implementation instructions, Relevant area (+4 more)

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (11): 1. Global module pattern, 2. Render-on-navigation pattern, 3. Firebase + local cache pattern, 4. Mobile-first UI, 5. Shared helper usage, Domain-specific skills by module, Helpful mindset for changes, Important implementation patterns (+3 more)

### Community 19 - "Community 19"
Cohesion: 0.17
Nodes (11): Deployment, Environment setup, Git Bash / WSL commands, Git workflow, Local development, Operational notes, Pages requirements, Running locally (+3 more)

### Community 20 - "Community 20"
Cohesion: 0.18
Nodes (10): Auth model, Data model, Deployment model, External services, Routing, Runtime model, Shell flow, Styling model (+2 more)

### Community 21 - "Community 21"
Cohesion: 0.18
Nodes (10): chapters, metadata, description, features, generatedDate, targetAudience, targetCompanies, title (+2 more)

### Community 22 - "Community 22"
Cohesion: 0.18
Nodes (10): chapters, metadata, description, features, generatedDate, targetAudience, targetCompanies, title (+2 more)

### Community 23 - "Community 23"
Cohesion: 0.33
Nodes (9): attachReaderListeners(), _categories, escapeHtml(), loadCategory(), loadIndex(), openCategory(), render(), renderIndex() (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.25
Nodes (10): build(), buildCSS(), buildJS(), copyAssets(), copyCriticalCSS(), crypto, distDir, esbuild (+2 more)

### Community 25 - "Community 25"
Cohesion: 0.18
Nodes (10): Auth/security rules, Core constraints, Data/storage rules, Documentation rules, Git/workflow rules, JavaScript conventions, Manual test checklist rules, Ubiverse Rules (+2 more)

### Community 26 - "Community 26"
Cohesion: 0.22
Nodes (8): description, devDependencies, esbuild, name, scripts, build, dev, version

### Community 27 - "Community 27"
Cohesion: 0.25
Nodes (7): Auth changed, Deployment gotchas, Home screen changed, Ledger changed, Tasbih changed, Telegram behavior, Ubiverse Current State Notes

### Community 28 - "Community 28"
Cohesion: 0.25
Nodes (7): Critical files, Current truths, Editing strategy, Important warning, Read these files in order, Ubiverse Agent Guide, What this repository is

### Community 29 - "Community 29"
Cohesion: 0.60
Nodes (3): render(), renderContent(), renderInteractionSection()

## Knowledge Gaps
- **206 isolated node(s):** `esbuild`, `fs`, `path`, `crypto`, `distDir` (+201 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `firebaseGet()` connect `Community 0` to `Community 1`, `Community 3`, `Community 8`, `Community 10`, `Community 12`, `Community 14`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `getKolkataTimestamp()` connect `Community 1` to `Community 3`, `Community 8`, `Community 9`, `Community 10`, `Community 12`, `Community 14`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `showAlert()` connect `Community 1` to `Community 0`, `Community 2`, `Community 8`, `Community 10`, `Community 12`, `Community 14`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `submit()` (e.g. with `showAlert()` and `firebasePost()`) actually correct?**
  _`submit()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `submit()` (e.g. with `showAlert()` and `DIV()`) actually correct?**
  _`submit()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `submit()` (e.g. with `getKolkataDate()` and `getKolkataTimestamp()`) actually correct?**
  _`submit()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `esbuild`, `fs`, `path` to the rest of the system?**
  _206 weakly-connected nodes found - possible documentation gaps or missing edges._