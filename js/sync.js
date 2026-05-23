// js/sync.js
// Offline-first sync queue for Firebase writes.
// Queues operations when offline, auto-flushes on reconnect,
// deduplicates via syncId ring buffer, retries with backoff.

(function () {
  'use strict';

  var QUEUE_KEY     = '_ubiverse_sync_queue';
  var SYNCED_KEY    = '_ubiverse_synced_ids';
  var MAX_SYNCED    = 500;   // ring buffer size for dedup
  var TIMEOUT_MS    = 5000;  // max wait for a Firebase write
  var MAX_BACKOFF   = 30000; // max retry delay
  var INITIAL_DELAY = 1000;  // first retry delay

  var _isOnline     = navigator.onLine;
  var _isFlushing   = false;
  var _retryTimer   = null;
  var _retryDelay   = INITIAL_DELAY;
  var _listeners    = [];  // post-sync callbacks

  /* ── Queue persistence ──────────────────────────────────────── */

  function loadQueue() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; }
    catch (_) { return []; }
  }

  function saveQueue(queue) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    updateIndicator();
  }

  function loadSyncedIds() {
    try { return JSON.parse(localStorage.getItem(SYNCED_KEY)) || []; }
    catch (_) { return []; }
  }

  function saveSyncedIds(ids) {
    // Keep only the last MAX_SYNCED entries
    if (ids.length > MAX_SYNCED) {
      ids = ids.slice(ids.length - MAX_SYNCED);
    }
    localStorage.setItem(SYNCED_KEY, JSON.stringify(ids));
  }

  /* ── Unique ID generator ────────────────────────────────────── */

  function generateSyncId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6);
  }

  /* ── Network detection ──────────────────────────────────────── */

  function setOnline(val) {
    var wasOffline = !_isOnline;
    _isOnline = val;
    updateIndicator();
    if (val && wasOffline) {
      // Just came back online — flush pending queue
      _retryDelay = INITIAL_DELAY;
      flush();
    }
  }

  window.addEventListener('online',  function () { setOnline(true); });
  window.addEventListener('offline', function () { setOnline(false); });

  // Also use Firebase .info/connected for more reliable detection
  // (deferred until firebase is ready)
  function bindFirebaseConnected() {
    if (typeof firebase !== 'undefined' && firebase.database) {
      try {
        firebase.database().ref('.info/connected').on('value', function (snap) {
          if (snap.val() === true) {
            setOnline(true);
          }
          // Don't set offline purely from Firebase disconnect —
          // navigator.onLine is more reliable for that
        });
      } catch (_) { /* ignore if not initialized yet */ }
    }
  }

  // Bind after a short delay to ensure firebase is initialized
  setTimeout(bindFirebaseConnected, 1000);

  /* ── Enqueue ────────────────────────────────────────────────── */

  /**
   * Add a Firebase write operation to the sync queue.
   * @param {string} operation - 'post' | 'put' | 'patch' | 'delete'
   * @param {string} path - Firebase path
   * @param {*} data - Data payload (null for delete)
   * @param {object} [options] - { onSync: function, module: string }
   * @returns {string} syncId
   */
  function enqueue(operation, path, data, options) {
    var syncId = generateSyncId();
    var entry = {
      syncId:    syncId,
      op:        operation,
      path:      path,
      data:      data || null,
      module:    (options && options.module) || '',
      createdAt: Date.now(),
    };

    var queue = loadQueue();
    queue.push(entry);
    saveQueue(queue);

    // Store post-sync callback in memory (won't persist across reloads)
    if (options && typeof options.onSync === 'function') {
      _listeners.push({ syncId: syncId, callback: options.onSync });
    }

    return syncId;
  }

  /* ── Execute a single Firebase operation ─────────────────────── */

  function executeOp(entry) {
    var ref = firebase.database().ref(entry.path);
    switch (entry.op) {
      case 'post':   return ref.push(entry.data).then(function (r) { return r.key; });
      case 'put':    return ref.set(entry.data);
      case 'patch':  return ref.update(entry.data);
      case 'delete': return ref.remove();
      default:       return Promise.reject(new Error('Unknown op: ' + entry.op));
    }
  }

  /* ── Flush queue ────────────────────────────────────────────── */

  function flush() {
    if (_isFlushing) return;

    var queue = loadQueue();
    if (queue.length === 0) return;

    if (!_isOnline) {
      scheduleRetry();
      return;
    }

    _isFlushing = true;
    var syncedIds = loadSyncedIds();
    var remaining = [];
    var synced = 0;

    // Process sequentially (FIFO order)
    var chain = Promise.resolve();

    queue.forEach(function (entry) {
      chain = chain.then(function () {
        // Dedup check
        if (syncedIds.indexOf(entry.syncId) !== -1) {
          // Already synced — skip
          return;
        }

        return executeOp(entry)
          .then(function () {
            syncedIds.push(entry.syncId);
            synced++;

            // Fire post-sync callback if registered
            for (var i = _listeners.length - 1; i >= 0; i--) {
              if (_listeners[i].syncId === entry.syncId) {
                try { _listeners[i].callback(entry); } catch (_) {}
                _listeners.splice(i, 1);
              }
            }
          })
          .catch(function () {
            // Failed — keep in queue for retry
            remaining.push(entry);
          });
      });
    });

    chain.then(function () {
      saveSyncedIds(syncedIds);
      saveQueue(remaining);
      _isFlushing = false;

      if (synced > 0) {
        showSyncedToast(synced);
        _retryDelay = INITIAL_DELAY;
      }

      if (remaining.length > 0) {
        scheduleRetry();
      }
    }).catch(function () {
      _isFlushing = false;
      scheduleRetry();
    });
  }

  /* ── Retry with backoff ─────────────────────────────────────── */

  function scheduleRetry() {
    if (_retryTimer) return;
    _retryTimer = setTimeout(function () {
      _retryTimer = null;
      flush();
    }, _retryDelay);
    _retryDelay = Math.min(_retryDelay * 2, MAX_BACKOFF);
  }

  /* ── Sync indicator in header ───────────────────────────────── */

  function updateIndicator() {
    var el = document.getElementById('sync-indicator');
    if (!el) return;

    var count = pendingCount();
    if (count > 0) {
      el.textContent = '🔄 ' + count;
      el.title = count + ' item' + (count > 1 ? 's' : '') + ' pending sync';
      el.classList.add('show');
      el.classList.remove('synced');
    } else if (!_isOnline) {
      el.textContent = '📴';
      el.title = 'Offline';
      el.classList.add('show');
      el.classList.remove('synced');
    } else {
      el.classList.remove('show');
    }
  }

  /* ── Toast helpers ──────────────────────────────────────────── */

  function showOfflineToast(message) {
    if (typeof window.showToast === 'function') {
      window.showToast(message || 'Saved offline — will sync when connected', 'warning');
    }
  }

  function showSyncedToast(count) {
    if (typeof window.showToast === 'function') {
      window.showToast('✅ ' + count + ' item' + (count > 1 ? 's' : '') + ' synced to cloud', 'success');
    }
  }

  /* ── Public API ─────────────────────────────────────────────── */

  function pendingCount() {
    return loadQueue().length;
  }

  function isOnline() {
    return _isOnline;
  }

  /**
   * Try a direct Firebase write with timeout.
   * If it succeeds, return { synced: true, key: ... }.
   * If it fails or times out, queue it and return { synced: false, syncId: ... }.
   *
   * @param {string} operation - 'post' | 'put' | 'patch' | 'delete'
   * @param {string} path
   * @param {*} data
   * @param {object} [options] - { onSync: fn, module: string, skipQueue: boolean }
   * @returns {Promise<{ synced: boolean, key?: string, syncId?: string }>}
   */
  function tryOrQueue(operation, path, data, options) {
    var opts = options || {};

    // If clearly offline, skip the attempt and queue immediately
    if (!_isOnline) {
      if (opts.skipQueue) {
        return Promise.reject(new Error('Offline'));
      }
      var syncId = enqueue(operation, path, data, opts);
      showOfflineToast();
      return Promise.resolve({ synced: false, syncId: syncId });
    }

    // Race: Firebase write vs timeout
    var ref = firebase.database().ref(path);
    var writePromise;
    switch (operation) {
      case 'post':   writePromise = ref.push(data); break;
      case 'put':    writePromise = ref.set(data); break;
      case 'patch':  writePromise = ref.update(data); break;
      case 'delete': writePromise = ref.remove(); break;
      default:       return Promise.reject(new Error('Unknown op: ' + operation));
    }

    var timeoutPromise = new Promise(function (_, reject) {
      setTimeout(function () { reject(new Error('timeout')); }, TIMEOUT_MS);
    });

    return Promise.race([
      writePromise.then(function (result) {
        // Mark this as synced for dedup
        var ids = loadSyncedIds();
        var immediateId = generateSyncId();
        ids.push(immediateId);
        saveSyncedIds(ids);

        return {
          synced: true,
          key: (result && result.key) ? result.key : null,
        };
      }),
      timeoutPromise,
    ]).catch(function (err) {
      if (opts.skipQueue) {
        throw err;
      }
      // Failed or timed out — queue for later
      var syncId = enqueue(operation, path, data, opts);
      showOfflineToast();
      return { synced: false, syncId: syncId };
    });
  }

  /* ── Periodic flush on visibility ───────────────────────────── */

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && _isOnline) {
      flush();
    }
  });

  // Initial flush attempt after page load
  setTimeout(function () {
    if (_isOnline) flush();
    updateIndicator();
  }, 2000);

  /* ── Expose globally ────────────────────────────────────────── */

  window.SyncQueue = {
    enqueue:      enqueue,
    flush:        flush,
    isOnline:     isOnline,
    pendingCount: pendingCount,
    tryOrQueue:   tryOrQueue,
    updateIndicator: updateIndicator,
  };

}());
