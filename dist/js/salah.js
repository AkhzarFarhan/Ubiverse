const _=function(){"use strict";const d=["Fajr","Zohar","Asr","Maghrib","Isha"],g=[2,4,4,3,4],y=()=>"salah_"+window.AppState.username,E=()=>"salah/"+window.AppState.username;let f=null,v=!1;async function M(){if(v||window.Chart){v=!0;return}await new Promise((t,a)=>{const e=document.createElement("script");e.src="https://cdn.jsdelivr.net/npm/chart.js",e.onload=()=>t(),e.onerror=()=>a(new Error("Failed to load Chart.js")),document.head.appendChild(e)}),v=!0}function k(){f&&(f.destroy(),f=null),document.getElementById("app").innerHTML=`
      <div class="fade-in">
        <div class="page-header">
          <h2>\u{1F54C} Salah Tracker</h2>
          <p>Track your daily prayer progress</p>
        </div>

        <form class="form-card" id="salah-form" novalidate>
          <div class="card-title">Log Progress</div>
          <div id="salah-latest-info" class="text-sm text-primary mb-sm" style="display: none; margin-bottom: 1rem; padding: 0.5rem; background: var(--surface-hover); border-radius: var(--radius-sm); border-left: 3px solid var(--primary);"></div>
          <div id="salah-alert"></div>
          <p class="text-sm text-muted mb-sm">
            Enter the number of <strong>rakah you prayed today</strong> per prayer.
            Leave blank if unchanged.
          </p>
          <div class="form-row">
            ${d.map(function(t,a){return`<div class="form-group">
                <input type="number" id="salah-input-${a}" placeholder="${t} (Farz: ${g[a]})" min="0" />
                <label style="display: flex; align-items: center; gap: 0.35rem; margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-muted); cursor: pointer; font-weight: normal;">
                  <input type="checkbox" id="salah-jamaat-${a}" style="width: auto; margin: 0; min-height: auto;" />
                  With Jamaat
                </label>
              </div>`}).join("")}
          </div>
          <button type="submit" class="btn btn-primary" style="margin-top: 1rem;">Save Update</button>
        </form>

        <div class="stat-cards" id="salah-stats"></div>

        <div class="chart-container">
          <div class="card-title">\u{1F4C8} Rate of Change (\u0394 Rakah / Entry)</div>
          <canvas id="salah-chart"></canvas>
        </div>

        <div class="card">
          <div class="card-title">\u{1F4CB} History</div>
          <div class="table-wrapper">
            <table id="salah-table">
              <thead>
                <tr>
                  <th>Date</th>
                  ${d.map(function(t){return'<th style="text-align: right;">'+t+"</th>"}).join("")}
                </tr>
              </thead>
              <tbody id="salah-tbody"><tr><td colspan="${d.length+1}" class="text-muted text-sm text-center">Loading\u2026</td></tr></tbody>
            </table>
          </div>
        </div>
      </div>
    `,document.getElementById("salah-form").addEventListener("submit",function(t){t.preventDefault(),w()}),D()}function b(t,a){if(!t||!a)return 0;const e=new Date(t+"T00:00:00"),n=new Date(a+"T00:00:00");if(isNaN(e)||isNaN(n))return 0;const s=n-e;return Math.max(0,Math.floor(s/864e5))}async function w(){const t=d.map(function(l,o){return parseInt(document.getElementById("salah-input-"+o).value,10)||0}),a=d.map(function(l,o){return document.getElementById("salah-jamaat-"+o).checked}),e=await $(),n=getKolkataDate(),s=e.length>0&&e[e.length-1].date||n;let i=b(s,n);e.length===0&&(i=1);const r=e.length>0?e[e.length-1].prayers:Array(d.length).fill(0),h={prayers:d.map(function(l,o){const p=r[o]-i*g[o];let u=t[o];if(u>0&&a[o]){let c=Math.min(u,g[o]),x=Math.max(0,u-g[o]);u=c*27+x}return p+u}),timestamp:getKolkataTimestamp(),date:n};try{await firebasePost(E(),h)}catch(l){console.warn("Firebase write failed:",l)}e.push(h),localStorage.setItem(y(),JSON.stringify(e)),d.forEach(function(l,o){document.getElementById("salah-input-"+o).value="",document.getElementById("salah-jamaat-"+o).checked=!1}),showAlert("salah-alert","Progress saved! \u{1F54C}","success"),I(e),S(e),T(e)}async function D(){const t=await $();if(t.length===0){const a=document.getElementById("salah-tbody");a&&(a.innerHTML=`<tr><td colspan="${d.length+1}" class="text-muted text-sm text-center">No entries yet.</td></tr>`);return}L(t),I(t),S(t),T(t)}function L(t){const a=document.getElementById("salah-latest-info");if(!a||t.length===0)return;const e=t[t.length-1],n=t.length>1?t[t.length-2]:null;let s="";if(n){const l=b(n.date,e.date),o=d.map(function(u,c){const x=n.prayers[c]-l*g[c];return e.prayers[c]-x}),p=[];d.forEach(function(u,c){o[c]>0&&p.push("+"+o[c]+" "+u)}),p.length>0?s='<br><span class="text-xs" style="color: var(--text-muted);">Added: '+p.join(", ")+"</span>":s='<br><span class="text-xs" style="color: var(--text-muted);">Updated with no additions</span>'}else s='<br><span class="text-xs" style="color: var(--text-muted);">Initial sync logged.</span>';const i=new Date(e.date+"T00:00:00"),r=isNaN(i)?e.date:i.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}),m=e.timestamp?e.timestamp:r,h=getKolkataTimestamp();a.style.display="block",a.innerHTML="Current time: <strong>"+h+"</strong><br>Last updated: <strong>"+m+"</strong>"+s}function I(t){const a=document.getElementById("salah-stats");if(!a)return;const e=t[0].prayers,n=t[t.length-1].prayers,s=t[0].date||"",i=t[t.length-1].date||"",r=Math.max(1,b(s,i)),m=j(e,n,r),h=B(n);let l="";d.forEach(function(u,c){l+=`<div class="stat-card">
        <div class="stat-label">${u} remaining</div>
        <div class="stat-value ${n[c]<0?"negative":"positive"}">${n[c]}</div>
      </div>`}),a.innerHTML=l;const o=document.createElement("div");o.className="card mb-md",o.style.gridColumn="1 / -1",o.innerHTML=`
      <div class="card-title">\u{1F52E} Predictions</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem;margin-top:.5rem">
        ${d.map(function(u,c){return`<div class="stat-card">
            <div class="stat-label">${u} predicted</div>
            <div class="stat-value">${m[c]}d</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">${u} actual</div>
            <div class="stat-value">${h[c]}d</div>
          </div>`}).join("")}
      </div>`;const p=document.getElementById("salah-prediction");p&&p.remove(),o.id="salah-prediction",a.after(o)}async function S(t){const a=document.getElementById("salah-chart");if(!a)return;try{await M()}catch(r){console.error(r);return}f&&(f.destroy(),f=null);const e=A(t);if(e.length<2){a.parentElement.innerHTML+='<p class="text-muted text-sm text-center">Need at least 2 days of entries for chart.</p>';return}const n=[],s=d.map(function(r){return{label:r,data:[],fill:!1,tension:.35}}),i=["#6366f1","#22c55e","#f59e0b","#ef4444","#06b6d4"];s.forEach(function(r,m){r.borderColor=i[m],r.backgroundColor=i[m]});for(let r=1;r<e.length;r++){const m=e[r].date?formatDate(e[r].date):"Day "+(r+1);n.push(m),d.forEach(function(h,l){s[l].data.push(e[r].prayers[l]-e[r-1].prayers[l])})}f=new Chart(a,{type:"line",data:{labels:n,datasets:s},options:{responsive:!0,plugins:{legend:{position:"bottom"},tooltip:{mode:"index",intersect:!1}},scales:{y:{title:{display:!0,text:"\u0394 Rakah"},grid:{color:"#e2e8f0"}},x:{grid:{color:"#e2e8f0"}}}}})}function T(t){const a=document.getElementById("salah-tbody");a&&(a.innerHTML=t.map(function(e,n){return`<tr>
        <td>${e.date?formatDate(e.date):`Day ${n+1}`}</td>
        ${e.prayers.map(function(i){return`<td class="td-num ${i<0?"td-negative":i>0?"td-positive":""}" style="text-align: right; font-variant-numeric: tabular-nums;">${i}</td>`}).join("")}
      </tr>`}).join(""))}function A(t){if(!t||t.length===0)return[];const a=new Map;return t.forEach((e,n)=>{let s=e.date;!s&&e.timestamp&&(s=e.timestamp.split(" ")[0]);const i=s||`Unknown-${n}`;a.set(i,e)}),Array.from(a.values())}function j(t,a,e){return d.map(function(n,s){const i=Math.abs(a[s]-t[s]);if(i===0)return a[s]===0?0:"\u221E";const r=DIV(e,i),m=Math.abs(a[s]);return Math.ceil(r*m)})}function B(t){return d.map(function(a,e){return Math.ceil(Math.abs(DIV(t[e],g[e])))})}async function $(){try{const t=await firebaseGet(E()),a=t?objectToArray(t):[];return localStorage.setItem(y(),JSON.stringify(a)),a}catch(t){console.warn("Firebase read failed, using localStorage:",t);try{return JSON.parse(localStorage.getItem(y()))||[]}catch{return[]}}}function N(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}return{render:k,submit:w,loadData:D}}();export{_ as SalahModule};
//# sourceMappingURL=salah.js.map
