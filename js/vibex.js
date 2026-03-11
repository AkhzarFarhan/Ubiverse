// js/vibex.js
// Vibex — real-time chat module with WhatsApp-style UI.

window.VibexModule = (function () {
  'use strict';

  /* ── Constants ────────────────────────────────────────────── */
  var USERS_PATH = 'vibex/users';
  var CHATS_PATH = 'vibex/chats';

  /* ── State ────────────────────────────────────────────────── */
  var currentChatUser = null;
  var messageListener = null;
  var usersListener   = null;
  var presenceListener = null;
  var allUsers = {};

  /* ── Helpers ──────────────────────────────────────────────── */

  /** Build a deterministic chat-room key from two usernames. */
  function getChatId(a, b) {
    return [a, b].sort().join('_');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(str) {
    return escapeHtml(str);
  }

  /** Minimal markdown: fenced code, inline code, bold, italic, newlines. */
  function renderMarkdown(str) {
    var text = String(str);
    var codeBlocks = [];
    text = text.replace(/```([\s\S]*?)```/g, function (_, code) {
      var idx = codeBlocks.length;
      codeBlocks.push(
        '<pre class="vibex-code-block"><code>' +
        escapeHtml(code.replace(/^\n/, '')) +
        '</code></pre>'
      );
      return '\x00CODE' + idx + '\x00';
    });
    var inlineCodes = [];
    text = text.replace(/`([^`\n]+)`/g, function (_, code) {
      var idx = inlineCodes.length;
      inlineCodes.push(
        '<code class="vibex-inline-code">' + escapeHtml(code) + '</code>'
      );
      return '\x00INLINE' + idx + '\x00';
    });
    text = escapeHtml(text);
    text = text.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([\s\S]+?)\*/g, '<em>$1</em>');
    text = text.replace(/\n/g, '<br>');
    text = text.replace(/\x00CODE(\d+)\x00/g, function (_, i) {
      return codeBlocks[parseInt(i, 10)];
    });
    text = text.replace(/\x00INLINE(\d+)\x00/g, function (_, i) {
      return inlineCodes[parseInt(i, 10)];
    });
    return text;
  }

  /** Friendly "last seen" label. */
  function formatLastSeen(ts) {
    if (!ts) return '';
    var diff = Date.now() - ts;
    if (diff < 60000)    return 'just now';
    if (diff < 3600000)  return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }

  /* ── Presence ─────────────────────────────────────────────── */

  function setupPresence() {
    var username    = window.AppState.username;
    var displayName = window.AppState.displayName;
    if (!username) return;

    var userRef = db.ref(USERS_PATH + '/' + username);
    userRef.update({ displayName: displayName, online: true });
    userRef.onDisconnect().update({
      online: false,
      lastSeen: firebase.database.ServerValue.TIMESTAMP
    });

    presenceListener = db.ref('.info/connected');
    presenceListener.on('value', function (snap) {
      if (snap.val() === true) {
        userRef.update({ online: true });
        userRef.onDisconnect().update({
          online: false,
          lastSeen: firebase.database.ServerValue.TIMESTAMP
        });
      }
    });
  }

  /* ── Cleanup ──────────────────────────────────────────────── */

  function cleanup() {
    if (messageListener)  { messageListener.off();  messageListener  = null; }
    if (usersListener)    { usersListener.off();    usersListener    = null; }
    if (presenceListener) { presenceListener.off('value'); presenceListener = null; }
    currentChatUser = null;
  }

  /* Clean up when navigating away from Vibex */
  window.addEventListener('hashchange', function () {
    var hash = window.location.hash.replace('#', '') || 'home';
    if (hash !== 'vibex') cleanup();
  });

  /* ── Contact list (main view) ─────────────────────────────── */

  function render() {
    cleanup();
    setupPresence();

    document.getElementById('app').innerHTML =
      '<div class="fade-in vibex-wrap">' +
        '<div class="page-header">' +
          '<h2>\uD83D\uDCAC Vibex</h2>' +
          '<p>Chat with other Ubiverse users</p>' +
        '</div>' +
        '<div class="card vibex-contacts-card">' +
          '<div class="card-title">\uD83D\uDC65 Conversations</div>' +
          '<div id="vibex-contacts">' +
            '<p class="text-muted text-sm text-center">Loading contacts\u2026</p>' +
          '</div>' +
        '</div>' +
      '</div>';

    loadContacts();
  }

  function loadContacts() {
    var ref = db.ref(USERS_PATH);
    usersListener = ref;
    ref.on('value', function (snap) {
      allUsers = snap.val() || {};
      renderContacts();
    });
  }

  function renderContacts() {
    var container = document.getElementById('vibex-contacts');
    if (!container) return;

    var username = window.AppState.username;
    var users = Object.entries(allUsers).filter(function (pair) {
      return pair[0] !== username;
    });

    if (users.length === 0) {
      container.innerHTML =
        '<div class="empty-state">' +
          '<div class="empty-icon">\uD83D\uDC65</div>' +
          '<p>No other users yet. Share Ubiverse with friends to start chatting!</p>' +
        '</div>';
      return;
    }

    container.innerHTML = users.map(function (pair) {
      var uname = pair[0];
      var data  = pair[1];
      var isOnline    = data.online === true;
      var lastSeen    = data.lastSeen ? formatLastSeen(data.lastSeen) : '';
      var statusText  = isOnline ? 'Online' : (lastSeen ? 'Last seen ' + lastSeen : 'Offline');
      var displayName = data.displayName || uname;

      return '<div class="vibex-contact" data-user="' + escapeAttr(uname) + '">' +
        '<div class="vibex-contact-avatar">' +
          '<span class="vibex-avatar-letter">' + escapeHtml(displayName.charAt(0).toUpperCase()) + '</span>' +
          '<span class="vibex-status-dot' + (isOnline ? ' online' : '') + '"></span>' +
        '</div>' +
        '<div class="vibex-contact-info">' +
          '<div class="vibex-contact-name">' + escapeHtml(displayName) + '</div>' +
          '<div class="vibex-contact-status text-muted text-xs">' + escapeHtml(statusText) + '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    container.querySelectorAll('.vibex-contact').forEach(function (el) {
      el.addEventListener('click', function () {
        openChat(el.dataset.user);
      });
    });
  }

  /* ── Chat thread view ─────────────────────────────────────── */

  function openChat(targetUser) {
    if (messageListener) { messageListener.off(); messageListener = null; }
    if (usersListener)   { usersListener.off();   usersListener   = null; }

    currentChatUser = targetUser;
    var targetData = allUsers[targetUser] || {};
    var targetDisplayName = targetData.displayName || targetUser;
    var isOnline = targetData.online === true;

    document.getElementById('app').innerHTML =
      '<div class="fade-in vibex-wrap vibex-chat-view">' +
        '<div class="vibex-chat-header">' +
          '<button class="vibex-back-btn" id="vibex-back">\u2190</button>' +
          '<div class="vibex-chat-header-info">' +
            '<div class="vibex-chat-header-avatar">' +
              '<span class="vibex-avatar-letter">' + escapeHtml(targetDisplayName.charAt(0).toUpperCase()) + '</span>' +
              '<span class="vibex-status-dot' + (isOnline ? ' online' : '') + '" id="vibex-chat-status-dot"></span>' +
            '</div>' +
            '<div>' +
              '<div class="vibex-chat-header-name">' + escapeHtml(targetDisplayName) + '</div>' +
              '<div class="vibex-chat-header-status text-xs" id="vibex-chat-status">' +
                (isOnline ? 'Online' : 'Offline') +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="vibex-messages" id="vibex-messages">' +
          '<p class="text-muted text-sm text-center">Loading messages\u2026</p>' +
        '</div>' +
        '<div class="vibex-input-bar">' +
          '<textarea id="vibex-input" placeholder="Type a message\u2026" rows="1"></textarea>' +
          '<button class="vibex-send-btn" id="vibex-send">' +
            '<svg viewBox="0 0 24 24" width="20" height="20" fill="white">' +
              '<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
      '</div>';

    /* Auto-resize textarea */
    var textarea = document.getElementById('vibex-input');
    textarea.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    /* Enter = send, Shift+Enter = newline */
    textarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    document.getElementById('vibex-back').addEventListener('click', function () {
      render();
    });
    document.getElementById('vibex-send').addEventListener('click', sendMessage);

    var chatId = getChatId(window.AppState.username, targetUser);
    loadMessages(chatId);
    listenUserStatus(targetUser);
    markAsRead(chatId);
  }

  /* ── Send ──────────────────────────────────────────────────── */

  async function sendMessage() {
    var input = document.getElementById('vibex-input');
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;

    var chatId = getChatId(window.AppState.username, currentChatUser);
    var message = {
      sender:    window.AppState.username,
      text:      text,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      delivered: false,
      read:      false
    };

    input.value = '';
    input.style.height = 'auto';

    try {
      await firebasePost(CHATS_PATH + '/' + chatId + '/messages', message);
    } catch (e) {
      console.warn('Vibex: send failed', e);
    }
  }

  /* ── Messages (real-time) ──────────────────────────────────── */

  function loadMessages(chatId) {
    var ref = db.ref(CHATS_PATH + '/' + chatId + '/messages');
    messageListener = ref;

    ref.on('value', function (snap) {
      var data = snap.val();
      var messages = data
        ? Object.entries(data).map(function (pair) {
            var msg = pair[1];
            msg._key = pair[0];
            return msg;
          })
        : [];
      messages.sort(function (a, b) { return a.timestamp - b.timestamp; });
      renderMessages(messages);

      if (currentChatUser) {
        markDelivered(chatId, messages);
        markAsRead(chatId);
      }

      var container = document.getElementById('vibex-messages');
      if (container) container.scrollTop = container.scrollHeight;
    });
  }

  function renderMessages(messages) {
    var container = document.getElementById('vibex-messages');
    if (!container) return;

    var username = window.AppState.username;

    if (messages.length === 0) {
      container.innerHTML =
        '<div class="empty-state">' +
          '<div class="empty-icon">\uD83D\uDCAC</div>' +
          '<p>No messages yet. Say hello!</p>' +
        '</div>';
      return;
    }

    var html = '';
    var lastDate = '';

    messages.forEach(function (msg) {
      var isMine = msg.sender === username;
      var date   = new Date(msg.timestamp);
      var dateStr = date.toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric'
      });

      if (dateStr !== lastDate) {
        html += '<div class="vibex-date-sep"><span>' + escapeHtml(dateStr) + '</span></div>';
        lastDate = dateStr;
      }

      var time = date.toLocaleTimeString('en-IN', {
        hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata'
      });

      var ticks = '';
      if (isMine) {
        if (msg.read)           ticks = '<span class="vibex-tick read">\u2713\u2713</span>';
        else if (msg.delivered) ticks = '<span class="vibex-tick delivered">\u2713\u2713</span>';
        else                    ticks = '<span class="vibex-tick sent">\u2713</span>';
      }

      html +=
        '<div class="vibex-msg ' + (isMine ? 'mine' : 'theirs') + '">' +
          '<div class="vibex-bubble ' + (isMine ? 'mine' : 'theirs') + '">' +
            '<div class="vibex-msg-text">' + renderMarkdown(msg.text) + '</div>' +
            '<div class="vibex-msg-meta">' +
              '<span class="vibex-msg-time">' + escapeHtml(time) + '</span>' +
              ticks +
            '</div>' +
          '</div>' +
        '</div>';
    });

    container.innerHTML = html;
  }

  /* ── Delivery / read receipts ──────────────────────────────── */

  async function markDelivered(chatId, messages) {
    var username = window.AppState.username;
    var updates = {};
    messages.forEach(function (msg) {
      if (msg.sender !== username && !msg.delivered) {
        updates[CHATS_PATH + '/' + chatId + '/messages/' + msg._key + '/delivered'] = true;
      }
    });
    if (Object.keys(updates).length) {
      try { await db.ref().update(updates); } catch (e) { /* silent */ }
    }
  }

  async function markAsRead(chatId) {
    if (!currentChatUser) return;
    var username = window.AppState.username;
    try {
      var snap = await db.ref(CHATS_PATH + '/' + chatId + '/messages').once('value');
      var data = snap.val();
      if (!data) return;
      var updates = {};
      Object.entries(data).forEach(function (pair) {
        var key = pair[0];
        var msg = pair[1];
        if (msg.sender !== username && !msg.read) {
          updates[CHATS_PATH + '/' + chatId + '/messages/' + key + '/read'] = true;
          if (!msg.delivered) {
            updates[CHATS_PATH + '/' + chatId + '/messages/' + key + '/delivered'] = true;
          }
        }
      });
      if (Object.keys(updates).length) {
        await db.ref().update(updates);
      }
    } catch (e) { /* silent */ }
  }

  /* ── User status listener (chat header) ────────────────────── */

  function listenUserStatus(targetUser) {
    var ref = db.ref(USERS_PATH + '/' + targetUser);
    usersListener = ref;
    ref.on('value', function (snap) {
      var data = snap.val() || {};
      var isOnline = data.online === true;

      var dot  = document.getElementById('vibex-chat-status-dot');
      var text = document.getElementById('vibex-chat-status');
      if (dot) dot.className = 'vibex-status-dot' + (isOnline ? ' online' : '');
      if (text) {
        if (isOnline) {
          text.textContent = 'Online';
          text.className   = 'vibex-chat-header-status text-xs vibex-online-text';
        } else {
          var ls = data.lastSeen ? formatLastSeen(data.lastSeen) : '';
          text.textContent = ls ? 'Last seen ' + ls : 'Offline';
          text.className   = 'vibex-chat-header-status text-xs';
        }
      }
    });
  }

  /* ── Public API ───────────────────────────────────────────── */
  return { render: render };

}());
