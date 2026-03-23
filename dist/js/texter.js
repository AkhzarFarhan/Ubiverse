const S=function(){"use strict";const o=()=>"texter_"+window.AppState.username,s=()=>"texter_v2/"+window.AppState.username;let a=[];function y(){document.getElementById("app").innerHTML=`
      <div class="fade-in">
        <div class="page-header">
          <h2>\u270F\uFE0F Texter</h2>
          <p>Quick notes and reminders</p>
        </div>

        <form class="form-card" id="texter-form" novalidate>
          <div class="card-title">New Note</div>
          <div id="texter-alert"></div>
          <div class="form-group">
            <label for="texter-note">Note</label>
            <textarea id="texter-note" placeholder="Type your note here\u2026" rows="4"></textarea>
          </div>
          <div class="texter-actions">
            <button type="submit" class="btn btn-primary">Save Note</button>
            <button type="button" id="texter-share-btn" class="btn btn-secondary">Share</button>
          </div>
        </form>

        <div class="card">
          <div class="card-title">\u{1F4CB} All Notes</div>
          <div id="texter-list"><p class="text-muted text-sm text-center">Loading\u2026</p></div>
        </div>
      </div>
    `,document.getElementById("texter-form").addEventListener("submit",function(t){t.preventDefault(),c()}),document.getElementById("texter-share-btn").addEventListener("click",p),document.getElementById("texter-list").addEventListener("click",function(t){if(t.target.closest(".texter-copy-note-btn")){const e=t.target.closest(".texter-copy-note-btn");g(e.dataset.index)}else if(t.target.closest(".texter-delete-note-btn")){const e=t.target.closest(".texter-delete-note-btn");x(e.dataset.index)}}),d()}async function c(){const t=document.getElementById("texter-note").value;clearAlert("texter-alert");const e={note:t===""?"(empty note)":t,timestamp:getKolkataTimestamp()};try{await firebasePost(s(),e)}catch(n){console.warn("Firebase write failed:",n)}const r=JSON.parse(localStorage.getItem(o()))||[];r.unshift(e),localStorage.setItem(o(),JSON.stringify(r)),document.getElementById("texter-note").value="",showAlert("texter-alert","Note saved!","success"),i(r)}async function p(){clearAlert("texter-alert");const t=document.getElementById("texter-note"),e=t.value;if(!e.trim()){showAlert("texter-alert","Please enter text before sharing.","warning");return}const n=(window.prompt("Enter username (without @gmail.com) to share with:")||"").trim().toLowerCase();if(!n){showAlert("texter-alert","Share cancelled. Username is required.","warning");return}if(n.includes("@")){showAlert("texter-alert","Please enter only the username part, without @gmail.com.","warning");return}if(!/^[a-z0-9._-]+$/.test(n)){showAlert("texter-alert","Username can only contain letters, numbers, dots, underscores, and hyphens.","warning");return}if(n===window.AppState.username){showAlert("texter-alert","Enter another username to share this note.","warning");return}const v=getKolkataTimestamp(),u={note:e,timestamp:v,sharedBy:window.AppState.username},m=u;try{await Promise.all([firebasePost(s(),m),firebasePost("texter_v2/"+n,u)])}catch(A){console.warn("Share failed:",A),showAlert("texter-alert","Could not share note right now. Please try again.","error");return}const l=JSON.parse(localStorage.getItem(o()))||[];l.unshift(m),localStorage.setItem(o(),JSON.stringify(l)),t.value="",showAlert("texter-alert",`Note shared with @${n} and saved.`,"success"),i(l)}async function d(){const t=await f();i(t)}async function g(t){clearAlert("texter-alert");const e=Number(t);if(!a.length){showAlert("texter-alert","No notes to copy yet.","warning");return}if(!Number.isInteger(e)||e<0||e>=a.length){showAlert("texter-alert","Invalid note selection.","warning");return}const r=a[e].note||"(empty note)";try{await h(r),showAlert("texter-alert","Note copied to clipboard!","success")}catch(n){console.warn("Copy failed:",n),showAlert("texter-alert","Could not copy note. Please try again.","error")}}async function x(t){clearAlert("texter-alert");const e=Number(t);if(!a.length||!Number.isInteger(e)||e<0||e>=a.length||!confirm("Are you sure you want to delete this text?"))return;const r=a.slice();r.splice(e,1),a=r;try{await firebasePut(s(),r)}catch(n){console.warn("Firebase put failed:",n)}localStorage.setItem(o(),JSON.stringify(r)),i(r),showAlert("texter-alert","Text deleted.","success")}function i(t){const e=document.getElementById("texter-list");if(e){if(a=Array.isArray(t)?t:[],a.length===0){e.innerHTML=`<div class="empty-state">
        <div class="empty-icon">\u{1F4DD}</div>
        <p>No notes yet. Write your first one above!</p>
      </div>`;return}e.innerHTML='<div class="entry-list">'+a.map(function(r,n){return`<div class="entry-card">
          <div class="entry-meta">
            <span class="badge badge-neutral">#${n+1}</span>
            <span class="entry-time">\u{1F550} ${r.timestamp||r.date_time||r.date||""}</span>
            <div style="margin-left: auto; display: flex; gap: 0.5rem;"><button type="button" class="btn btn-secondary btn-sm texter-copy-btn texter-copy-note-btn" data-index="${n}">Copy</button><button type="button" class="btn btn-danger btn-sm texter-delete-note-btn" data-index="${n}">Delete</button></div>
          </div>
          <div class="entry-message texter-content">${b(r.note)}</div>
        </div>`}).reverse().join("")+"</div>"}}async function f(){try{const t=await firebaseGet(s()),e=t?objectToArray(t):[];return localStorage.setItem(o(),JSON.stringify(e)),e}catch(t){console.warn("Firebase read failed, using localStorage:",t);try{return JSON.parse(localStorage.getItem(o()))||[]}catch{return[]}}}function b(t){return w(t)}function w(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function h(t){if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(t);return}const e=document.createElement("textarea");e.value=t,e.style.position="fixed",e.style.opacity="0",e.style.pointerEvents="none",e.setAttribute("readonly","true"),document.body.appendChild(e),e.focus(),e.select();const r=document.execCommand("copy");if(document.body.removeChild(e),!r)throw new Error("execCommand copy failed")}return{render:y,submit:c,loadData:d}}();export{S as TexterModule};
//# sourceMappingURL=texter.js.map
