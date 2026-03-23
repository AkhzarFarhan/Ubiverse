const g=function(){"use strict";const r=()=>"gym_"+window.AppState.username,n=()=>"gym/"+window.AppState.username,l=["Abs","Chest","Back","Biceps","Triceps","Shoulder","Leg"];function u(){document.getElementById("app").innerHTML=`
      <div class="fade-in">
        <div class="page-header">
          <h2>\u{1F3CB}\uFE0F Gym Log</h2>
          <p>Track your workout sessions</p>
        </div>

        <form class="form-card" id="gym-form" novalidate>
          <div class="card-title">Log Workout</div>
          <div id="gym-alert"></div>
          <div class="form-group">
            <label>Muscle Groups</label>
            <div class="gym-muscle-pills">
              ${l.map(function(e){return'<button type="button" class="muscle-pill" data-muscle="'+e+'">'+e+"</button>"}).join("")}
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Save Workout</button>
        </form>

        <div class="card">
          <div class="card-title">\u{1F5C2}\uFE0F Workout History</div>
          <div id="gym-list"><p class="text-muted text-sm text-center">Loading\u2026</p></div>
        </div>
      </div>
    `,document.querySelectorAll(".muscle-pill").forEach(function(e){e.addEventListener("click",function(){e.classList.toggle("active")})}),document.getElementById("gym-form").addEventListener("submit",function(e){e.preventDefault(),i()}),c()}async function i(){const e=[];if(document.querySelectorAll(".muscle-pill.active").forEach(function(s){e.push(s.getAttribute("data-muscle"))}),e.length===0){showAlert("gym-alert","Select at least one muscle group.","error");return}clearAlert("gym-alert");const t={message:e.join(", "),timestamp:getKolkataTimestamp()};try{await firebasePost(n(),t)}catch(s){console.warn("Firebase write failed:",s)}const a=JSON.parse(localStorage.getItem(r()))||[];a.unshift(t),localStorage.setItem(r(),JSON.stringify(a)),document.querySelectorAll(".muscle-pill").forEach(function(s){s.classList.remove("active")}),showAlert("gym-alert","Workout logged successfully! \u{1F4AA}","success"),o(a)}async function c(){const e=await d();o(e)}function o(e){const t=document.getElementById("gym-list");if(t){if(e.length===0){t.innerHTML=`<div class="empty-state">
        <div class="empty-icon">\u{1F3C3}</div>
        <p>No workouts logged yet. Start your first session!</p>
      </div>`;return}t.innerHTML='<div class="entry-list">'+e.map(function(a,s){return`<div class="entry-card">
          <div class="entry-meta">
            <span class="badge badge-primary">#${e.length-s}</span>
            <span class="entry-time">\u{1F550} ${a.timestamp||""}</span>
          </div>
          <div class="entry-message">${m(a.message)}</div>
        </div>`}).join("")+"</div>"}}async function d(){try{const e=await firebaseGet(n()),t=e?objectToArray(e):[];return localStorage.setItem(r(),JSON.stringify(t)),t}catch(e){console.warn("Firebase read failed, using localStorage:",e);try{return JSON.parse(localStorage.getItem(r()))||[]}catch{return[]}}}function m(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}return{render:u,submit:i,loadData:c}}();export{g as GymModule};
//# sourceMappingURL=gym.js.map
