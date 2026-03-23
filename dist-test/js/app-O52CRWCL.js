(function() {
  "use strict";
  const MODULES = [
    { key: "daily", icon: "\u{1F4C5}", label: "Daily" },
    { key: "gym", icon: "\u{1F3CB}\uFE0F", label: "Gym" },
    { key: "texter", icon: "\u270F\uFE0F", label: "Texter" },
    { key: "tasbih", icon: "\u{1F4FF}", label: "Tasbih" },
    { key: "salah", icon: "\u{1F54C}", label: "Salah" },
    { key: "ledger", icon: "\u{1F4B0}", label: "Ledger" },
    { key: "car", icon: "\u{1F697}", label: "Car" },
    { key: "vibex", icon: "\u{1F4AC}", label: "Vibex" },
    { key: "quran", icon: "\u{1F4D6}", label: "Al-Qur'an" }
  ];
  const ROUTES = {
    home: () => renderHome(),
    daily: () => m.DailyModule.render(),
    gym: () => window.GymModule.render(),
    texter: () => window.TexterModule.render(),
    tasbih: () => window.TasbihModule.render(),
    salah: () => window.SalahModule.render(),
    ledger: () => window.LedgerModule.render(),
    car: () => window.CarModule.render(),
    vibex: () => window.VibexModule.render(),
    quran: () => window.QuranModule.render()
  };
  function renderHome() {
    document.getElementById("app").innerHTML = `
      <div class="fade-in">
        <div class="page-header">
          <h2>
            <svg viewBox="0 0 24 24" width="28" height="28" stroke="var(--color-primary)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:bottom; margin-right:4px;">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            Ubiverse
          </h2>
          <p class="home-tagline">An Endless Possibility</p>
        </div>
        <div class="home-grid">
          ${MODULES.map(function(m2) {
      return '<a href="#' + m2.key + '" class="home-tile"><span class="home-tile-icon">' + m2.icon + '</span><span class="home-tile-label">' + m2.label + "</span></a>";
    }).join("")}
        </div>
        <footer class="home-footer">
          <div>Developed and Maintained by <a href="https://github.com/AkhzarFarhan" target="_blank" rel="noopener">Akhzar Farhan</a></div>
          <div id="home-last-updated" style="margin-top: 0.5rem; opacity: 0.7;"></div>
        </footer>
      </div>
    `;
    fetch("https://api.github.com/repos/AkhzarFarhan/Ubiverse/commits?per_page=1").then((r) => r.json()).then((data) => {
      if (data && data[0] && data[0].commit && data[0].commit.author) {
        const date = new Date(data[0].commit.author.date);
        const formatted = date.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        });
        const el = document.getElementById("home-last-updated");
        if (el)
          el.innerHTML = '<span style="font-size: 0.70rem;">Last Updated: ' + formatted + " (IST)</span>";
      }
    }).catch((e) => {
      console.warn("Could not fetch last update time", e);
    });
  }
  function showApp() {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("layout").classList.remove("hidden");
    document.getElementById("header-user").textContent = "\u{1F464} " + window.AppState.displayName;
    document.getElementById("signout-btn").classList.remove("hidden");
    navigate();
  }
  function showLogin() {
    document.getElementById("login-screen").classList.remove("hidden");
    document.getElementById("layout").classList.add("hidden");
    document.getElementById("signout-btn").classList.add("hidden");
  }
  document.getElementById("google-signin-btn").addEventListener("click", async function() {
    try {
      await firebaseSignInWithGoogle();
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        showAlert("login-alert", "Sign-in failed: " + err.message, "error");
      }
    }
  });
  document.getElementById("signout-btn").addEventListener("click", async function() {
    await firebaseSignOut();
  });
  onAuthStateChanged(function(user) {
    if (user) {
      const username = user.email.split("@")[0].toLowerCase();
      const firstName = user.displayName ? user.displayName.split(" ")[0] : username;
      window.AppState.username = username;
      window.AppState.displayName = firstName;
      localStorage.setItem("ubiverse_username", username);
      showApp();
    } else {
      window.AppState.username = "";
      window.AppState.displayName = "";
      localStorage.removeItem("ubiverse_username");
      showLogin();
    }
  });
  function navigate() {
    const hash = window.location.hash.replace("#", "") || "home";
    const page = ROUTES[hash] ? hash : "home";
    if (!ROUTES[hash]) {
      window.location.hash = "home";
      return;
    }
    document.querySelectorAll(".nav-link").forEach(function(a) {
      a.classList.toggle("active", a.dataset.page === page);
    });
    try {
      ROUTES[page]();
    } catch (err) {
      document.getElementById("app").innerHTML = `<div class="card"><p class="text-muted">\u26A0\uFE0F Error loading page: ${err.message}</p></div>`;
      console.error(err);
    }
    closeSidebar();
  }
  window.addEventListener("hashchange", function() {
    if (window.AppState.username)
      navigate();
  });
  const hamburger = document.getElementById("hamburger");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("show");
    hamburger.setAttribute("aria-expanded", "true");
  }
  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    hamburger.setAttribute("aria-expanded", "false");
  }
  hamburger.addEventListener("click", function() {
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
  });
  overlay.addEventListener("click", closeSidebar);
  if (localStorage.getItem("ubiverse_username")) {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("layout").classList.remove("hidden");
  } else {
    showLogin();
  }
})();
