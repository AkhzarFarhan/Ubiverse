const B=function(){"use strict";const i=["Fajr","Zohar","Asr","Maghrib","Isha"],y=[2,4,4,3,4],g=()=>"salah_"+window.AppState.username,x=()=>"salah/"+window.AppState.username;let p=null,v=!1;async function T(){if(v||window.Chart){v=!0;return}await new Promise((t,a)=>{const e=document.createElement("script");e.src="https://cdn.jsdelivr.net/npm/chart.js",e.onload=()=>t(),e.onerror=()=>a(new Error("Failed to load Chart.js")),document.head.appendChild(e)}),v=!0}function M(){p&&(p.destroy(),p=null),document.getElementById("app").innerHTML=`
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
            ${i.map(function(t,a){return`<div class="form-group">
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
                  ${i.map(function(t){return'<th style="text-align: right;">'+t+"</th>"}).join("")}
                </tr>
              </thead>
              <tbody id="salah-tbody"><tr><td colspan="${i.length+1}" class="text-muted text-sm text-center">Loading\u2026</td></tr></tbody>
            </table>
          </div>
        </div>
      </div>
    `,document.getElementById("salah-form").addEventListener("submit",function(t){t.preventDefault(),E()}),w()}function b(t,a){if(!t||!a)return 0;const e=new Date(t+"T00:00:00"),s=new Date(a+"T00:00:00");if(isNaN(e)||isNaN(s))return 0;const r=s-e;return Math.max(0,Math.floor(r/864e5))}async function E(){const t=i.map(function(c,o){return parseInt(document.getElementById("salah-input-"+o).value,10)||0}),a=i.map(function(c,o){return document.getElementById("salah-jamaat-"+o).checked}),e=await $(),s=getKolkataDate(),r=e.length>0&&e[e.length-1].date||s;let n=b(r,s);e.length===0&&(n=1);const d=e.length>0?e[e.length-1].prayers:Array(i.length).fill(0),u={prayers:i.map(function(c,o){const f=d[o]-n*y[o];let l=t[o];if(l>0&&a[o]){let m=Math.min(l,y[o]),A=Math.max(0,l-y[o]);l=m*27+A}return f+l}),timestamp:getKolkataTimestamp(),date:s};try{await firebasePost(x(),u)}catch(c){console.warn("Firebase write failed:",c)}e.push(u),localStorage.setItem(g(),JSON.stringify(e)),i.forEach(function(c,o){document.getElementById("salah-input-"+o).value="",document.getElementById("salah-jamaat-"+o).checked=!1}),showAlert("salah-alert","Progress saved! \u{1F54C}","success"),D(e),I(e),S(e)}async function w(){const t=await $();if(t.length===0){const a=document.getElementById("salah-tbody");a&&(a.innerHTML=`<tr><td colspan="${i.length+1}" class="text-muted text-sm text-center">No entries yet.</td></tr>`);return}k(t),D(t),I(t),S(t)}function k(t){const a=document.getElementById("salah-latest-info");if(!a||t.length===0)return;const e=t[t.length-1],s=t.length>1?t[t.length-2]:null;let r="";if(s){const u=b(s.date,e.date),c=i.map(function(f,l){const m=s.prayers[l]-u*y[l];return e.prayers[l]-m}),o=[];i.forEach(function(f,l){c[l]>0&&o.push("+"+c[l]+" "+f)}),o.length>0?r='<br><span class="text-xs" style="color: var(--text-muted);">Added: '+o.join(", ")+"</span>":r='<br><span class="text-xs" style="color: var(--text-muted);">Updated with no additions</span>'}else r='<br><span class="text-xs" style="color: var(--text-muted);">Initial sync logged.</span>';const n=new Date(e.date+"T00:00:00"),d=isNaN(n)?e.date:n.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}),h=e.timestamp?e.timestamp:d;a.style.display="block",a.innerHTML="Last updated: <strong>"+h+"</strong>"+r}function D(t){const a=document.getElementById("salah-stats");if(!a)return;const e=t[0].prayers,s=t[t.length-1].prayers,r=t[0].date||"",n=t[t.length-1].date||"",d=Math.max(1,b(r,n)),h=L(e,s,d),u=j(s);let c="";i.forEach(function(l,m){c+=`<div class="stat-card">
        <div class="stat-label">${l} remaining</div>
        <div class="stat-value ${s[m]<0?"negative":"positive"}">${s[m]}</div>
      </div>`}),a.innerHTML=c;const o=document.createElement("div");o.className="card mb-md",o.style.gridColumn="1 / -1",o.innerHTML=`
      <div class="card-title">\u{1F52E} Predictions</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem;margin-top:.5rem">
        ${i.map(function(l,m){return`<div class="stat-card">
            <div class="stat-label">${l} predicted</div>
            <div class="stat-value">${h[m]}d</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">${l} actual</div>
            <div class="stat-value">${u[m]}d</div>
          </div>`}).join("")}
      </div>`;const f=document.getElementById("salah-prediction");f&&f.remove(),o.id="salah-prediction",a.after(o)}async function I(t){const a=document.getElementById("salah-chart");if(!a)return;try{await T()}catch(n){console.error(n);return}if(p&&(p.destroy(),p=null),t.length<2){a.parentElement.innerHTML+='<p class="text-muted text-sm text-center">Need at least 2 entries for chart.</p>';return}const e=[],s=i.map(function(n){return{label:n,data:[],fill:!1,tension:.35}}),r=["#6366f1","#22c55e","#f59e0b","#ef4444","#06b6d4"];s.forEach(function(n,d){n.borderColor=r[d],n.backgroundColor=r[d]});for(let n=1;n<t.length;n++){const d=t[n].date?formatDate(t[n].date):"Entry "+(n+1);e.push(d),i.forEach(function(h,u){s[u].data.push(t[n].prayers[u]-t[n-1].prayers[u])})}p=new Chart(a,{type:"line",data:{labels:e,datasets:s},options:{responsive:!0,plugins:{legend:{position:"bottom"},tooltip:{mode:"index",intersect:!1}},scales:{y:{title:{display:!0,text:"\u0394 Rakah"},grid:{color:"#e2e8f0"}},x:{grid:{color:"#e2e8f0"}}}}})}function S(t){const a=document.getElementById("salah-tbody");a&&(a.innerHTML=t.map(function(e,s){return`<tr>
        <td>${e.date?formatDate(e.date):`Day ${s+1}`}</td>
        ${e.prayers.map(function(n){return`<td class="td-num ${n<0?"td-negative":n>0?"td-positive":""}" style="text-align: right; font-variant-numeric: tabular-nums;">${n}</td>`}).join("")}
      </tr>`}).join(""))}function _(t){if(!t||t.length===0)return[];const a=[];let e=t[0].date||t[0].timestamp||"Unknown",s=t[0];for(let r=1;r<t.length;r++){const n=t[r].date||t[r].timestamp||`Unknown-${r}`;n===e||(a.push(s),e=n),s=t[r]}return a.push(s),a}function L(t,a,e){return i.map(function(s,r){const n=Math.abs(a[r]-t[r]);if(n===0)return a[r]===0?0:"\u221E";const d=DIV(e,n),h=Math.abs(a[r]);return Math.ceil(d*h)})}function j(t){return i.map(function(a,e){return Math.ceil(Math.abs(DIV(t[e],y[e])))})}async function $(){try{const t=await firebaseGet(x()),a=t?objectToArray(t):[];return localStorage.setItem(g(),JSON.stringify(a)),a}catch(t){console.warn("Firebase read failed, using localStorage:",t);try{return JSON.parse(localStorage.getItem(g()))||[]}catch{return[]}}}function N(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}return{render:M,submit:E,loadData:w}}();export{B as SalahModule};
//# sourceMappingURL=salah.js.map
