const B=function(){"use strict";const d=["Fajr","Zohar","Asr","Maghrib","Isha"],y=[2,4,4,3,4],v=()=>"salah_"+window.AppState.username,E=()=>"salah/"+window.AppState.username;let h=null,b=!1;async function k(){if(b||window.Chart){b=!0;return}await new Promise((t,a)=>{const e=document.createElement("script");e.src="https://cdn.jsdelivr.net/npm/chart.js",e.onload=()=>t(),e.onerror=()=>a(new Error("Failed to load Chart.js")),document.head.appendChild(e)}),b=!0}function L(){h&&(h.destroy(),h=null),document.getElementById("app").innerHTML=`
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
                <input type="number" id="salah-input-${a}" placeholder="${t} (Farz: ${y[a]})" min="0" />
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
    `,document.getElementById("salah-form").addEventListener("submit",function(t){t.preventDefault(),w()}),D()}function x(t,a){if(!t||!a)return 0;const e=new Date(t+"T00:00:00"),n=new Date(a+"T00:00:00");if(isNaN(e)||isNaN(n))return 0;const r=n-e;return Math.max(0,Math.floor(r/864e5))}async function w(){const t=d.map(function(c,o){return parseInt(document.getElementById("salah-input-"+o).value,10)||0}),a=d.map(function(c,o){return document.getElementById("salah-jamaat-"+o).checked}),e=await M(),n=getKolkataDate(),r=e.length>0&&e[e.length-1].date||n;let l=x(r,n);e.length===0&&(l=1);const s=e.length>0?e[e.length-1].prayers:Array(d.length).fill(0),f={prayers:d.map(function(c,o){const p=s[o]-l*y[o];let i=t[o];if(i>0&&a[o]){let u=Math.min(i,y[o]),g=Math.max(0,i-y[o]);i=u*27+g}return p+i}),timestamp:getKolkataTimestamp(),date:n};try{await firebasePost(E(),f)}catch(c){console.warn("Firebase write failed:",c)}e.push(f),localStorage.setItem(v(),JSON.stringify(e)),d.forEach(function(c,o){document.getElementById("salah-input-"+o).value="",document.getElementById("salah-jamaat-"+o).checked=!1}),showAlert("salah-alert","Progress saved! \u{1F54C}","success"),I(e),S(e),T(e)}async function D(){const t=await M();if(t.length===0){const a=document.getElementById("salah-tbody");a&&(a.innerHTML=`<tr><td colspan="${d.length+1}" class="text-muted text-sm text-center">No entries yet.</td></tr>`);return}A(t),I(t),S(t),T(t)}function A(t){const a=document.getElementById("salah-latest-info");if(!a||t.length===0)return;const e=t[t.length-1],n=t.length>1?t[t.length-2]:null;let r="";if(n){const c=x(n.date,e.date),o=d.map(function(i,u){const g=n.prayers[u]-c*y[u];return e.prayers[u]-g}),p=[];d.forEach(function(i,u){o[u]>0&&p.push("+"+o[u]+" "+i)}),p.length>0?r='<br><span class="text-xs" style="color: var(--text-muted);">Added: '+p.join(", ")+"</span>":r='<br><span class="text-xs" style="color: var(--text-muted);">Updated with no additions</span>'}else r='<br><span class="text-xs" style="color: var(--text-muted);">Initial sync logged.</span>';const l=new Date(e.date+"T00:00:00"),s=isNaN(l)?e.date:l.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}),m=e.timestamp?e.timestamp:s,f=function(){const c=new Date,o={timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!0},p=new Intl.DateTimeFormat("en-IN",o).formatToParts(c),i={};return p.forEach(function({type:u,value:g}){i[u]=g}),i.day+"-"+i.month+"-"+i.year+" "+i.hour+":"+i.minute+":"+i.second+" "+i.dayPeriod.toUpperCase()}();a.style.display="block",a.innerHTML="Current time: <strong>"+f+"</strong><br>Last updated: <strong>"+m+"</strong>"+r}function I(t){const a=document.getElementById("salah-stats");if(!a)return;const e=t[0].prayers,n=t[t.length-1].prayers,r=t[0].date||"",l=t[t.length-1].date||"",s=Math.max(1,x(r,l)),m=j(e,n,s),f=P(n);let c="";d.forEach(function(i,u){c+=`<div class="stat-card">
        <div class="stat-label">${i} remaining</div>
        <div class="stat-value ${n[u]<0?"negative":"positive"}">${n[u]}</div>
      </div>`}),a.innerHTML=c;const o=document.createElement("div");o.className="card mb-md",o.style.gridColumn="1 / -1",o.innerHTML=`
      <div class="card-title">\u{1F52E} Predictions</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem;margin-top:.5rem">
        ${d.map(function(i,u){return`<div class="stat-card">
            <div class="stat-label">${i} predicted</div>
            <div class="stat-value">${m[u]}d</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">${i} actual</div>
            <div class="stat-value">${f[u]}d</div>
          </div>`}).join("")}
      </div>`;const p=document.getElementById("salah-prediction");p&&p.remove(),o.id="salah-prediction",a.after(o)}async function S(t){const a=document.getElementById("salah-chart");if(!a)return;try{await k()}catch(s){console.error(s);return}h&&(h.destroy(),h=null);const e=$(t);if(e.length<2){a.parentElement.innerHTML+='<p class="text-muted text-sm text-center">Need at least 2 days of entries for chart.</p>';return}const n=[],r=d.map(function(s){return{label:s,data:[],fill:!1,tension:.35}}),l=["#6366f1","#22c55e","#f59e0b","#ef4444","#06b6d4"];r.forEach(function(s,m){s.borderColor=l[m],s.backgroundColor=l[m]});for(let s=1;s<e.length;s++){const m=e[s].date?formatDate(e[s].date):"Day "+(s+1);n.push(m),d.forEach(function(f,c){r[c].data.push(e[s].prayers[c]-e[s-1].prayers[c])})}h=new Chart(a,{type:"line",data:{labels:n,datasets:r},options:{responsive:!0,plugins:{legend:{position:"bottom"},tooltip:{mode:"index",intersect:!1}},scales:{y:{title:{display:!0,text:"\u0394 Rakah"},grid:{color:"#e2e8f0"}},x:{grid:{color:"#e2e8f0"}}}}})}function T(t){const a=document.getElementById("salah-tbody");if(!a)return;const e=$(t);a.innerHTML=e.map(function(n,r){return`<tr>
        <td>${n.date?formatDate(n.date):`Day ${r+1}`}</td>
        ${n.prayers.map(function(s){return`<td class="td-num ${s<0?"td-negative":s>0?"td-positive":""}" style="text-align: right; font-variant-numeric: tabular-nums;">${s}</td>`}).join("")}
      </tr>`}).join("")}function $(t){if(!t||t.length===0)return[];const a=new Map;return t.forEach((e,n)=>{let r=e.date;!r&&e.timestamp&&(r=e.timestamp.split(" ")[0]);const l=r||`Unknown-${n}`;a.set(l,e)}),Array.from(a.values())}function j(t,a,e){return d.map(function(n,r){const l=Math.abs(a[r]-t[r]);if(l===0)return a[r]===0?0:"\u221E";const s=DIV(e,l),m=Math.abs(a[r]);return Math.ceil(s*m)})}function P(t){return d.map(function(a,e){return Math.ceil(Math.abs(DIV(t[e],y[e])))})}async function M(){try{const t=await firebaseGet(E()),a=t?objectToArray(t):[];return localStorage.setItem(v(),JSON.stringify(a)),a}catch(t){console.warn("Firebase read failed, using localStorage:",t);try{return JSON.parse(localStorage.getItem(v()))||[]}catch{return[]}}}function N(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}return{render:L,submit:w,loadData:D}}();export{B as SalahModule};
//# sourceMappingURL=salah.js.map
