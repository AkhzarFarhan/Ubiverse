const m=function(){"use strict";const n=()=>"daily_"+window.AppState.username,s=()=>"daily/"+window.AppState.username;function o(){document.getElementById("app").innerHTML=`
      <div class="fade-in">
        <div class="page-header">
          <h2>\u{1F4C5} Daily Log</h2>
          <p>Track your daily mood and notes</p>
        </div>

        <form class="form-card" id="daily-form" novalidate>
          <div class="card-title">New Entry</div>
          <div id="daily-alert"></div>
          <div class="form-group">
            <label for="daily-message">Message</label>
            <input type="text" id="daily-message" placeholder="How was your day?" maxlength="300" />
          </div>
          <div class="form-group">
            <label>Rating (1 = worst, 10 = best)</label>
            <input type="hidden" id="daily-rating" value="" />
            <div class="daily-rating-grid">
              ${[1,2,3,4,5,6,7,8,9,10].map(function(e){var t;return e<=3?t="daily-rating-low":e<=5?t="daily-rating-mid":e<=7?t="daily-rating-ok":t="daily-rating-high",'<button type="button" class="daily-rating-btn '+t+'" data-rating="'+e+'">'+e+"</button>"}).join("")}
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Add Entry</button>
        </form>

        <div class="card">
          <div class="card-title">\u{1F4CB} Past Entries</div>
          <div id="daily-list"><p class="text-muted text-sm text-center">Loading\u2026</p></div>
        </div>
      </div>
    `,document.getElementById("daily-form").addEventListener("submit",function(e){e.preventDefault(),d()}),document.querySelectorAll(".daily-rating-btn").forEach(function(e){e.addEventListener("click",function(){document.querySelectorAll(".daily-rating-btn").forEach(function(t){t.classList.remove("active")}),e.classList.add("active"),document.getElementById("daily-rating").value=e.getAttribute("data-rating")})}),l()}async function d(){const e=document.getElementById("daily-message").value.trim(),t=document.getElementById("daily-rating").value;if(!e){showAlert("daily-alert","Message cannot be empty.","error");return}if(!t){showAlert("daily-alert","Please select a rating (1\u201310).","error");return}clearAlert("daily-alert");const r={message:e,rating:parseInt(t,10),timestamp:getKolkataTimestamp()};try{await firebasePost(s(),r)}catch(i){console.warn("Firebase write failed:",i)}const a=JSON.parse(localStorage.getItem(n()))||[];a.unshift(r),localStorage.setItem(n(),JSON.stringify(a)),document.getElementById("daily-message").value="",document.getElementById("daily-rating").value="",document.querySelectorAll(".daily-rating-btn").forEach(function(i){i.classList.remove("active")}),showAlert("daily-alert","Entry added successfully!","success"),c(a)}async function l(){const e=await u();c(e)}function c(e){const t=document.getElementById("daily-list");if(!t)return;if(e.length===0){t.innerHTML=`<div class="empty-state">
        <div class="empty-icon">\u{1F4ED}</div>
        <p>No entries yet. Add your first daily note above!</p>
      </div>`;return}function r(a){if(a==="good")return'<span class="badge badge-success">\u{1F44D} Good</span>';if(a==="bad")return'<span class="badge badge-danger">\u{1F44E} Bad</span>';var i=parseInt(a,10);if(isNaN(i))return"";var y=i>=8?"badge-success":i>=6?"badge-primary":i>=4?"badge-warning":"badge-danger";return'<span class="badge '+y+'">'+i+"/10</span>"}t.innerHTML='<div class="entry-list">'+e.map(function(a){return`<div class="entry-card">
          <div class="entry-meta">
            <span class="entry-time">\u{1F550} ${a.timestamp||""}</span>
            ${r(a.rating)}
          </div>
          <div class="entry-message">${g(a.message)}</div>
        </div>`}).join("")+"</div>"}async function u(){try{const e=await firebaseGet(s()),t=e?objectToArray(e):[];return localStorage.setItem(n(),JSON.stringify(t)),t}catch(e){console.warn("Firebase read failed, using localStorage:",e);try{return JSON.parse(localStorage.getItem(n()))||[]}catch{return[]}}}function g(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}return{render:o,submit:d,loadData:l}}();export{m as DailyModule};
//# sourceMappingURL=daily.js.map
