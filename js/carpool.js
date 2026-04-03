// js/carpool.js
// Jumu'ah Carpool module — share rides for Friday prayer.

const CarpoolModule = (function () {
  'use strict';

  const FIREBASE_PATH = 'carpool/rides';

  // ==========================================
  // DATE UTILITIES
  // ==========================================
  function formatTime12Hour(time24) {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return h12 + ':' + minutes + ' ' + ampm;
  }

  function getUpcomingFriday() {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + (istOffset + now.getTimezoneOffset() * 60 * 1000));
    const dayOfWeek = istNow.getDay();
    let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    if (daysUntilFriday === 0) {
      const hour = istNow.getHours();
      if (hour >= 14) daysUntilFriday = 7;
    }
    const friday = new Date(istNow);
    friday.setDate(istNow.getDate() + daysUntilFriday);
    return friday;
  }

  function formatFridayDate(date) {
    return date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  function formatShortDate(date) {
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function getCutoffTimestamp() {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + (istOffset + now.getTimezoneOffset() * 60 * 1000));
    const dayOfWeek = istNow.getDay();
    const hour = istNow.getHours();
    let daysSinceLastFridayCutoff;
    if (dayOfWeek === 5 && hour >= 14) {
      daysSinceLastFridayCutoff = 0;
    } else if (dayOfWeek === 5 && hour < 14) {
      daysSinceLastFridayCutoff = 7;
    } else {
      daysSinceLastFridayCutoff = (dayOfWeek - 5 + 7) % 7;
      if (daysSinceLastFridayCutoff === 0) daysSinceLastFridayCutoff = 7;
    }
    const lastFridayCutoff = new Date(istNow);
    lastFridayCutoff.setDate(istNow.getDate() - daysSinceLastFridayCutoff);
    lastFridayCutoff.setHours(14, 0, 0, 0);
    return lastFridayCutoff.getTime();
  }

  // ==========================================
  // ADMIN TRIGGER (10 clicks on header area)
  // ==========================================
  let clickCount = 0;
  let clickTimer = null;
  const CLICK_THRESHOLD = 10;
  const CLICK_TIMEOUT = 3000;

  function handleAdminClick() {
    clickCount++;
    if (clickTimer) clearTimeout(clickTimer);
    clickTimer = setTimeout(function () { clickCount = 0; }, CLICK_TIMEOUT);
    if (clickCount >= CLICK_THRESHOLD) {
      clickCount = 0;
      clearTimeout(clickTimer);
      renderAdminConsole();
    }
  }

  // ==========================================
  // RENDER: HOME
  // ==========================================
  function render() {
    const upcomingFriday = getUpcomingFriday();
    const fridayDateFull = formatFridayDate(upcomingFriday);

    document.getElementById('app').innerHTML =
      '<div class="fade-in">' +
        '<div class="page-header" id="carpool-header" style="cursor:pointer;user-select:none;">' +
          '<h2>🕌 Jumu\'ah Carpool</h2>' +
          '<p>Let\'s strive for Jannah together</p>' +
        '</div>' +

        '<div class="carpool-date-banner">' +
          '<p>🗓️ Carpooling for <strong>' + fridayDateFull + '</strong></p>' +
          '<p class="carpool-date-sub">Book your ride for this Jumu\'ah prayer</p>' +
        '</div>' +

        '<div class="carpool-action-grid">' +
          '<button class="carpool-action-card carpool-action-offer" id="carpool-offer-btn">' +
            '<span class="carpool-action-icon">🚗 🏍️</span>' +
            '<span class="carpool-action-title">I Have a Vehicle</span>' +
            '<span class="carpool-action-desc">Offer a ride (Car or Bike)</span>' +
          '</button>' +
          '<button class="carpool-action-card carpool-action-find" id="carpool-find-btn">' +
            '<span class="carpool-action-icon">🙋‍♂️</span>' +
            '<span class="carpool-action-title">I Need a Ride</span>' +
            '<span class="carpool-action-desc">Find available seats</span>' +
          '</button>' +
        '</div>' +
      '</div>';

    document.getElementById('carpool-header').addEventListener('click', handleAdminClick);
    document.getElementById('carpool-offer-btn').addEventListener('click', renderRegister);
    document.getElementById('carpool-find-btn').addEventListener('click', fetchAndRenderList);
  }

  // ==========================================
  // RENDER: REGISTER (Offer a Ride)
  // ==========================================
  function renderRegister() {
    document.getElementById('app').innerHTML =
      '<div class="fade-in">' +
        '<button class="btn btn-secondary btn-sm" id="carpool-back-home">← Back to Home</button>' +
        '<div class="form-card" style="margin-top:0.75rem;">' +
          '<div class="card-title">🚗 Offer a Ride</div>' +
          '<div id="carpool-alert"></div>' +
          '<form id="carpool-ride-form" novalidate>' +
            '<div class="form-group">' +
              '<label for="cp-owner-name">Your Name</label>' +
              '<input type="text" id="cp-owner-name" placeholder="Enter your name" required />' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="cp-owner-phone">Phone Number (WhatsApp)</label>' +
              '<div class="carpool-phone-row">' +
                '<span class="carpool-phone-prefix">+91</span>' +
                '<input type="tel" id="cp-owner-phone" pattern="[0-9]{10}" maxlength="10" placeholder="10 digit number" required />' +
              '</div>' +
            '</div>' +
            '<div class="form-row">' +
              '<div class="form-group">' +
                '<label for="cp-vehicle-type">Vehicle</label>' +
                '<select id="cp-vehicle-type">' +
                  '<option value="Car">Car</option>' +
                  '<option value="Bike">Bike</option>' +
                '</select>' +
              '</div>' +
              '<div class="form-group">' +
                '<label for="cp-seats">Seats Available</label>' +
                '<input type="number" id="cp-seats" min="1" max="10" placeholder="e.g. 3" required />' +
              '</div>' +
            '</div>' +
            '<div class="form-group carpool-helmet-div" id="cp-helmet-div" style="display:none;">' +
              '<div class="toggle-row">' +
                '<input type="checkbox" id="cp-extra-helmet" />' +
                '<label for="cp-extra-helmet">I have an extra helmet</label>' +
              '</div>' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="cp-masjid">Masjid Name</label>' +
              '<input type="text" id="cp-masjid" placeholder="e.g. Samsung Campus Masjid" required />' +
            '</div>' +
            '<div class="form-group">' +
              '<label for="cp-time">Departure Time</label>' +
              '<input type="time" id="cp-time" required />' +
            '</div>' +
            '<div class="form-group">' +
              '<label>Your Current Location</label>' +
              '<div class="carpool-loc-row">' +
                '<input type="text" id="cp-loc-text" placeholder="Click to get location" readonly style="background:var(--surface-2);font-size:0.85rem;" />' +
                '<button type="button" class="btn btn-primary btn-sm" id="cp-loc-btn">📍 Get</button>' +
              '</div>' +
              '<input type="hidden" id="cp-latitude" />' +
              '<input type="hidden" id="cp-longitude" />' +
              '<p style="font-size:0.75rem;color:var(--text-light);margin-top:0.25rem;">This helps riders find you easily</p>' +
            '</div>' +
            '<button type="submit" class="btn btn-primary btn-full btn-lg" id="cp-submit-btn">Post Ride</button>' +
          '</form>' +
        '</div>' +
      '</div>';

    document.getElementById('carpool-back-home').addEventListener('click', render);

    var vehicleSelect = document.getElementById('cp-vehicle-type');
    vehicleSelect.addEventListener('change', toggleHelmetOption);

    document.getElementById('cp-loc-btn').addEventListener('click', getLocation);

    document.getElementById('carpool-ride-form').addEventListener('submit', function (e) {
      e.preventDefault();
      handlePostRide();
    });
  }

  function toggleHelmetOption() {
    var type = document.getElementById('cp-vehicle-type').value;
    var div = document.getElementById('cp-helmet-div');
    var seatsInput = document.getElementById('cp-seats');
    if (type === 'Bike') {
      div.style.display = 'block';
      seatsInput.max = 1;
      seatsInput.value = 1;
    } else {
      div.style.display = 'none';
      seatsInput.max = 10;
    }
  }

  function getLocation() {
    var locBtn = document.getElementById('cp-loc-btn');
    var locText = document.getElementById('cp-loc-text');
    if (!navigator.geolocation) {
      showAlert('carpool-alert', 'Geolocation is not supported by your browser', 'error');
      return;
    }
    locBtn.textContent = '⏳...';
    locBtn.disabled = true;
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        document.getElementById('cp-latitude').value = lat;
        document.getElementById('cp-longitude').value = lng;
        locText.value = '📍 ' + lat.toFixed(5) + ', ' + lng.toFixed(5);
        locBtn.textContent = '✓ Got it';
        locBtn.style.background = 'var(--color-success)';
      },
      function () {
        showAlert('carpool-alert', 'Unable to get location. Please enable location access.', 'error');
        locBtn.textContent = '📍 Retry';
        locBtn.disabled = false;
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handlePostRide() {
    var btn = document.getElementById('cp-submit-btn');
    var ownerName = document.getElementById('cp-owner-name').value.trim();
    var ownerPhone = document.getElementById('cp-owner-phone').value.trim();
    var vehicleType = document.getElementById('cp-vehicle-type').value;
    var seats = parseInt(document.getElementById('cp-seats').value);
    var masjid = document.getElementById('cp-masjid').value.trim();
    var time = document.getElementById('cp-time').value;
    var extraHelmet = document.getElementById('cp-extra-helmet').checked;
    var latitude = document.getElementById('cp-latitude').value;
    var longitude = document.getElementById('cp-longitude').value;

    if (!ownerName || !ownerPhone || !seats || !masjid || !time) {
      showAlert('carpool-alert', 'Please fill in all required fields.', 'error');
      return;
    }
    if (!/^\d{10}$/.test(ownerPhone)) {
      showAlert('carpool-alert', 'Please enter a valid 10-digit phone number.', 'error');
      return;
    }

    btn.textContent = 'Posting...';
    btn.disabled = true;

    var rideData = {
      owner_name: ownerName,
      owner_phone: ownerPhone,
      vehicle_type: vehicleType,
      total_seats: seats,
      masjid_name: masjid,
      departure_time: time,
      extra_helmet: extraHelmet,
      latitude: latitude || null,
      longitude: longitude || null,
      created_at: Date.now()
    };

    try {
      await firebasePost(FIREBASE_PATH, rideData);
      showAlert('carpool-alert', 'Ride Posted Successfully!', 'success');
      setTimeout(fetchAndRenderList, 800);
    } catch (err) {
      showAlert('carpool-alert', 'Error posting ride: ' + err.message, 'error');
      btn.textContent = 'Post Ride';
      btn.disabled = false;
    }
  }

  // ==========================================
  // RENDER: RIDE LIST (I Need a Ride)
  // ==========================================
  async function fetchAndRenderList() {
    document.getElementById('app').innerHTML =
      '<div class="fade-in"><p class="text-muted text-sm text-center" style="padding:3rem 0;">Loading rides…</p></div>';

    try {
      var data = await firebaseGet(FIREBASE_PATH);
      if (!data) {
        renderList([]);
        return;
      }
      var cutoffTimestamp = getCutoffTimestamp();
      var rides = Object.entries(data)
        .map(function (entry) { return Object.assign({ id: entry[0] }, entry[1]); })
        .filter(function (ride) { return ride.created_at > cutoffTimestamp; });
      rides.sort(function (a, b) { return a.departure_time.localeCompare(b.departure_time); });
      renderList(rides);
    } catch (err) {
      document.getElementById('app').innerHTML =
        '<div class="fade-in"><div class="alert alert-error">Error loading data. Check internet connection.</div></div>';
    }
  }

  function renderList(rides) {
    var upcomingFriday = getUpcomingFriday();
    var fridayDateFull = formatFridayDate(upcomingFriday);
    var fridayDateShort = formatShortDate(upcomingFriday);

    var html =
      '<div class="fade-in">' +
        '<button class="btn btn-secondary btn-sm" id="carpool-back-home2">← Back to Home</button>' +
        '<div class="carpool-date-banner" style="margin-top:0.75rem;">' +
          '<p>🗓️ Rides for <strong>' + fridayDateFull + '</strong></p>' +
        '</div>' +
        '<div class="page-header" style="margin-top:0.5rem;">' +
          '<h2>🚗 Available Rides</h2>' +
          '<p>📱 Tap phone to call • 📍 Tap location to navigate</p>' +
        '</div>' +
        '<div class="carpool-ride-list">';

    if (rides.length === 0) {
      html += '<div class="empty-state"><div class="empty-icon">🚫</div><p>No active rides found.</p></div>';
    }

    rides.forEach(function (ride) {
      var passengers = ride.passengers ? Object.values(ride.passengers) : [];
      var seatsTaken = passengers.length;
      var seatsLeft = ride.total_seats - seatsTaken;
      var isFull = seatsLeft <= 0;
      var formattedTime = formatTime12Hour(ride.departure_time);
      var vehicleEmoji = ride.vehicle_type === 'Bike' ? '🏍️' : '🚗';

      var statusHtml = isFull
        ? '<span class="badge badge-danger">FULL</span>'
        : '<span class="badge badge-success">' + seatsLeft + ' seat' + (seatsLeft > 1 ? 's' : '') + ' left</span>';

      var helmetBadge = '';
      if (ride.vehicle_type === 'Bike') {
        helmetBadge = ride.extra_helmet
          ? '<span class="badge badge-success">⛑️ Helmet provided</span>'
          : '<span class="badge badge-danger">⛑️ Bring your helmet</span>';
      }

      var locationLink = (ride.latitude && ride.longitude)
        ? '<a href="https://www.google.com/maps?q=' + ride.latitude + ',' + ride.longitude + '" target="_blank" class="carpool-loc-link">📍 Navigate to pickup</a>'
        : '<span style="font-size:0.75rem;color:var(--text-light);">📍 Location not shared</span>';

      var whatsappGroupText = encodeURIComponent(
        "Jumu'ah Carpool - " + fridayDateShort + "\n" +
        "📍 " + ride.masjid_name + "\n" +
        "🕒 " + formattedTime + "\n\n" +
        "🚗 Driver: " + ride.owner_name + "\n" +
        "📞 +91 " + ride.owner_phone + "\n" +
        "Vehicle: " + ride.vehicle_type + "\n\n" +
        "👥 Passengers:\n" + (passengers.map(function (p) { return '• ' + p.name; }).join('\n') || 'None yet')
      );

      var cardClass = isFull ? 'card carpool-ride-card carpool-full-ride' : 'card carpool-ride-card';

      html +=
        '<div class="' + cardClass + '">' +
          '<div class="carpool-ride-header">' +
            '<div>' +
              '<h3 class="carpool-ride-masjid">🕌 ' + ride.masjid_name + '</h3>' +
              '<p class="carpool-ride-time">🕒 ' + fridayDateShort + ', ' + formattedTime + '</p>' +
            '</div>' +
            '<div>' + statusHtml + '</div>' +
          '</div>' +

          '<div class="carpool-driver-info">' +
            '<div class="carpool-driver-row">' +
              '<span style="font-size:1.5rem;">' + vehicleEmoji + '</span>' +
              '<div>' +
                '<p class="carpool-driver-name">' + ride.owner_name + '</p>' +
                '<p style="font-size:0.75rem;color:var(--text-muted);">' + ride.vehicle_type + ' • ' + ride.total_seats + ' seat' + (ride.total_seats > 1 ? 's' : '') + ' total</p>' +
              '</div>' +
              (helmetBadge ? '<div>' + helmetBadge + '</div>' : '') +
            '</div>' +
            '<div class="carpool-contact-row">' +
              '<a href="tel:+91' + ride.owner_phone + '" class="carpool-phone-link">📞 +91 ' + ride.owner_phone + '</a>' +
              locationLink +
            '</div>' +
          '</div>' +

          '<div class="carpool-passengers">' +
            '<p class="carpool-passengers-label">👥 Passengers (' + seatsTaken + '/' + ride.total_seats + '):</p>' +
            (passengers.length > 0
              ? '<div class="carpool-passenger-tags">' + passengers.map(function (p) { return '<span class="badge badge-primary">' + p.name + '</span>'; }).join('') + '</div>'
              : '<p style="font-size:0.75rem;color:var(--text-light);font-style:italic;">No passengers yet — be the first!</p>'
            ) +
          '</div>' +

          '<div class="carpool-actions">' +
            (!isFull
              ? '<div id="carpool-join-' + ride.id + '">' +
                  '<button class="btn btn-primary btn-full carpool-join-btn" data-ride-id="' + ride.id + '">🙋 Join This Ride</button>' +
                '</div>' +
                '<div id="carpool-confirm-' + ride.id + '" style="display:none;">' +
                  '<div class="carpool-join-form">' +
                    '<input type="text" id="cp-pname-' + ride.id + '" placeholder="Your Name (Required)" />' +
                    '<div class="carpool-phone-row">' +
                      '<span class="carpool-phone-prefix">+91</span>' +
                      '<input type="tel" id="cp-pphone-' + ride.id + '" pattern="[0-9]{10}" maxlength="10" placeholder="WhatsApp Number (Required)" />' +
                    '</div>' +
                    '<div style="display:flex;gap:0.5rem;">' +
                      '<button class="btn btn-primary carpool-confirm-btn" data-ride-id="' + ride.id + '" style="flex:1;">✓ Confirm</button>' +
                      '<button class="btn btn-secondary carpool-cancel-btn" data-ride-id="' + ride.id + '" style="flex:1;">Cancel</button>' +
                    '</div>' +
                  '</div>' +
                '</div>'
              : '<div style="text-align:center;padding:0.5rem 0;color:var(--text-light);font-style:italic;font-size:0.88rem;">🚫 This ride is full</div>'
            ) +
            (passengers.length > 0
              ? '<a href="https://wa.me/?text=' + whatsappGroupText + '" target="_blank" class="btn btn-full carpool-whatsapp-btn">' +
                  '<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
                  ' Share Ride on WhatsApp' +
                '</a>'
              : ''
            ) +
          '</div>' +
        '</div>';
    });

    html += '</div></div>';
    document.getElementById('app').innerHTML = html;

    // Bind event listeners
    document.getElementById('carpool-back-home2').addEventListener('click', render);

    document.querySelectorAll('.carpool-join-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var rideId = btn.getAttribute('data-ride-id');
        document.getElementById('carpool-join-' + rideId).style.display = 'none';
        document.getElementById('carpool-confirm-' + rideId).style.display = 'block';
      });
    });

    document.querySelectorAll('.carpool-cancel-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var rideId = btn.getAttribute('data-ride-id');
        document.getElementById('carpool-join-' + rideId).style.display = 'block';
        document.getElementById('carpool-confirm-' + rideId).style.display = 'none';
      });
    });

    document.querySelectorAll('.carpool-confirm-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        handleJoin(btn.getAttribute('data-ride-id'));
      });
    });
  }

  async function handleJoin(rideId) {
    var name = document.getElementById('cp-pname-' + rideId).value.trim();
    var phone = document.getElementById('cp-pphone-' + rideId).value.trim();

    if (!name) {
      showToast('Name is required!', 'error');
      return;
    }
    if (!phone || phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      showToast('Please enter a valid 10-digit WhatsApp number!', 'error');
      return;
    }

    try {
      await firebasePost(FIREBASE_PATH + '/' + rideId + '/passengers', { name: name, phone: phone });
      showToast('✅ Seat booked successfully!', 'success');
      fetchAndRenderList();
    } catch (err) {
      showToast('Error booking seat. Please try again.', 'error');
    }
  }

  // ==========================================
  // RENDER: ADMIN CONSOLE
  // ==========================================
  async function renderAdminConsole() {
    document.getElementById('app').innerHTML =
      '<div class="fade-in"><p class="text-muted text-sm text-center" style="padding:3rem 0;">Loading admin console…</p></div>';

    try {
      var data = await firebaseGet(FIREBASE_PATH);
      var html =
        '<div class="fade-in">' +
          '<button class="btn btn-secondary btn-sm" id="carpool-admin-back">← Back to Home</button>' +
          '<div class="page-header" style="margin-top:0.75rem;">' +
            '<h2>🔐 Admin Console</h2>' +
          '</div>' +
          '<div class="carpool-ride-list">';

      if (!data || Object.keys(data).length === 0) {
        html += '<div class="empty-state"><div class="empty-icon">🗃️</div><p>No rides in database.</p></div>';
      } else {
        var rides = Object.entries(data).map(function (entry) { return Object.assign({ id: entry[0] }, entry[1]); });

        rides.forEach(function (ride) {
          var passengers = ride.passengers ? Object.values(ride.passengers) : [];
          var passengerIds = ride.passengers ? Object.keys(ride.passengers) : [];
          var createdDate = new Date(ride.created_at).toLocaleString();
          var formattedTime = formatTime12Hour(ride.departure_time);

          html +=
            '<div class="card carpool-admin-card">' +
              '<div class="carpool-ride-header">' +
                '<div>' +
                  '<h3 class="carpool-ride-masjid">' + ride.masjid_name + '</h3>' +
                  '<p class="carpool-ride-time">🕒 ' + formattedTime + '</p>' +
                  '<p style="font-size:0.7rem;color:var(--text-light);">Created: ' + createdDate + '</p>' +
                '</div>' +
                '<div style="display:flex;gap:0.35rem;">' +
                  '<button class="btn btn-sm carpool-edit-btn" data-ride-id="' + ride.id + '" style="background:var(--color-warning);color:#fff;">✏️ Edit</button>' +
                  '<button class="btn btn-danger btn-sm carpool-delete-btn" data-ride-id="' + ride.id + '">🗑️ Delete</button>' +
                '</div>' +
              '</div>' +

              '<div style="font-size:0.88rem;color:var(--text);margin:0.5rem 0;">' +
                '<strong>' + ride.owner_name + '</strong> ' +
                '<span style="color:var(--text-muted);">(' + ride.vehicle_type + ')</span> ' +
                '<span style="color:var(--text-light);">| ' + ride.owner_phone + '</span>' +
              '</div>' +
              '<div style="font-size:0.85rem;color:var(--text-muted);">Seats: ' + ride.total_seats + ' | Passengers: ' + passengers.length + '</div>' +

              '<div class="carpool-admin-edit-form" id="cp-edit-form-' + ride.id + '" style="display:none;">' +
                '<input type="text" id="cp-edit-name-' + ride.id + '" value="' + ride.owner_name + '" placeholder="Owner Name" />' +
                '<input type="tel" id="cp-edit-phone-' + ride.id + '" value="' + ride.owner_phone + '" placeholder="Phone" />' +
                '<input type="text" id="cp-edit-masjid-' + ride.id + '" value="' + ride.masjid_name + '" placeholder="Masjid Name" />' +
                '<input type="time" id="cp-edit-time-' + ride.id + '" value="' + ride.departure_time + '" />' +
                '<input type="number" id="cp-edit-seats-' + ride.id + '" value="' + ride.total_seats + '" min="1" max="10" placeholder="Total Seats" />' +
                '<select id="cp-edit-vehicle-' + ride.id + '">' +
                  '<option value="Car"' + (ride.vehicle_type === 'Car' ? ' selected' : '') + '>Car</option>' +
                  '<option value="Bike"' + (ride.vehicle_type === 'Bike' ? ' selected' : '') + '>Bike</option>' +
                '</select>' +
                '<div style="display:flex;gap:0.5rem;margin-top:0.5rem;">' +
                  '<button class="btn btn-primary carpool-save-edit-btn" data-ride-id="' + ride.id + '" style="flex:1;">Save</button>' +
                  '<button class="btn btn-secondary carpool-cancel-edit-btn" data-ride-id="' + ride.id + '" style="flex:1;">Cancel</button>' +
                '</div>' +
              '</div>' +

              (passengers.length > 0
                ? '<div style="margin-top:0.5rem;padding-top:0.5rem;border-top:1px solid var(--border);">' +
                    '<p style="font-size:0.75rem;font-weight:600;color:var(--text-muted);margin-bottom:0.25rem;">Passengers:</p>' +
                    passengers.map(function (p, i) {
                      return '<div style="display:flex;justify-content:space-between;align-items:center;font-size:0.8rem;color:var(--text-muted);padding:0.25rem 0;">' +
                        '<span>' + p.name + (p.phone ? ' (' + p.phone + ')' : '') + '</span>' +
                        '<button class="carpool-del-passenger-btn" data-ride-id="' + ride.id + '" data-passenger-id="' + passengerIds[i] + '" style="background:none;border:none;color:var(--color-danger);cursor:pointer;font-size:0.85rem;">✕</button>' +
                      '</div>';
                    }).join('') +
                  '</div>'
                : ''
              ) +
            '</div>';
        });
      }

      html += '</div></div>';
      document.getElementById('app').innerHTML = html;

      // Bind admin events
      document.getElementById('carpool-admin-back').addEventListener('click', render);

      document.querySelectorAll('.carpool-edit-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var rideId = btn.getAttribute('data-ride-id');
          document.getElementById('cp-edit-form-' + rideId).style.display = 'block';
        });
      });

      document.querySelectorAll('.carpool-cancel-edit-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var rideId = btn.getAttribute('data-ride-id');
          document.getElementById('cp-edit-form-' + rideId).style.display = 'none';
        });
      });

      document.querySelectorAll('.carpool-save-edit-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          saveEdit(btn.getAttribute('data-ride-id'));
        });
      });

      document.querySelectorAll('.carpool-delete-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          deleteRide(btn.getAttribute('data-ride-id'));
        });
      });

      document.querySelectorAll('.carpool-del-passenger-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          deletePassenger(btn.getAttribute('data-ride-id'), btn.getAttribute('data-passenger-id'));
        });
      });

    } catch (err) {
      document.getElementById('app').innerHTML =
        '<div class="fade-in"><div class="alert alert-error">Error loading admin data: ' + err.message + '</div></div>';
    }
  }

  async function saveEdit(rideId) {
    var updatedData = {
      owner_name: document.getElementById('cp-edit-name-' + rideId).value,
      owner_phone: document.getElementById('cp-edit-phone-' + rideId).value,
      masjid_name: document.getElementById('cp-edit-masjid-' + rideId).value,
      departure_time: document.getElementById('cp-edit-time-' + rideId).value,
      total_seats: parseInt(document.getElementById('cp-edit-seats-' + rideId).value),
      vehicle_type: document.getElementById('cp-edit-vehicle-' + rideId).value
    };

    try {
      await firebasePatch(FIREBASE_PATH + '/' + rideId, updatedData);
      showToast('Ride updated successfully!', 'success');
      renderAdminConsole();
    } catch (err) {
      showToast('Error updating ride: ' + err.message, 'error');
    }
  }

  async function deleteRide(rideId) {
    if (!confirm('Are you sure you want to delete this ride?')) return;
    try {
      await firebaseDelete(FIREBASE_PATH + '/' + rideId);
      showToast('Ride deleted successfully!', 'success');
      renderAdminConsole();
    } catch (err) {
      showToast('Error deleting ride: ' + err.message, 'error');
    }
  }

  async function deletePassenger(rideId, passengerId) {
    if (!confirm('Remove this passenger?')) return;
    try {
      await firebaseDelete(FIREBASE_PATH + '/' + rideId + '/passengers/' + passengerId);
      renderAdminConsole();
    } catch (err) {
      showToast('Error removing passenger: ' + err.message, 'error');
    }
  }

  return { render: render };
}());

export { CarpoolModule };
