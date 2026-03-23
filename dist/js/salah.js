const _=function(){"use strict";const i=["Fajr","Zohar","Asr","Maghrib","Isha"],y=[2,4,4,3,4],g=()=>"salah_"+window.AppState.username,x=()=>"salah/"+window.AppState.username;let p=null,v=!1;async function $(){if(v||window.Chart){v=!0;return}await new Promise((t,a)=>{const e=document.createElement("script");e.src="https://cdn.jsdelivr.net/npm/chart.js",e.onload=()=>t(),e.onerror=()=>a(new Error("Failed to load Chart.js")),document.head.appendChild(e)}),v=!0}function M(){p&&(p.destroy(),p=null),document.getElementById("app").innerHTML=`
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
    `,document.getElementById("salah-form").addEventListener("submit",function(t){t.preventDefault(),E()}),w()}function b(t,a){if(!t||!a)return 0;const e=new Date(t+"T00:00:00"),s=new Date(a+"T00:00:00");if(isNaN(e)||isNaN(s))return 0;const o=s-e;return Math.max(0,Math.floor(o/864e5))}async function E(){const t=i.map(function(c,r){return parseInt(document.getElementById("salah-input-"+r).value,10)||0}),a=i.map(function(c,r){return document.getElementById("salah-jamaat-"+r).checked}),e=await T(),s=getKolkataDate(),o=e.length>0&&e[e.length-1].date||s;let n=b(o,s);e.length===0&&(n=1);const l=e.length>0?e[e.length-1].prayers:Array(i.length).fill(0),u={prayers:i.map(function(c,r){const f=l[r]-n*y[r];let d=t[r];if(d>0&&a[r]){let m=Math.min(d,y[r]),A=Math.max(0,d-y[r]);d=m*27+A}return f+d}),timestamp:getKolkataTimestamp(),date:s};try{await firebasePost(x(),u)}catch(c){console.warn("Firebase write failed:",c)}e.push(u),localStorage.setItem(g(),JSON.stringify(e)),i.forEach(function(c,r){document.getElementById("salah-input-"+r).value="",document.getElementById("salah-jamaat-"+r).checked=!1}),showAlert("salah-alert","Progress saved! \u{1F54C}","success"),D(e),I(e),S(e)}async function w(){const t=await T();if(t.length===0){const a=document.getElementById("salah-tbody");a&&(a.innerHTML=`<tr><td colspan="${i.length+1}" class="text-muted text-sm text-center">No entries yet.</td></tr>`);return}L(t),D(t),I(t),S(t)}function L(t){const a=document.getElementById("salah-latest-info");if(!a||t.length===0)return;const e=t[t.length-1],s=t.length>1?t[t.length-2]:null;let o="";if(s){const u=b(s.date,e.date),c=i.map(function(f,d){const m=s.prayers[d]-u*y[d];return e.prayers[d]-m}),r=[];i.forEach(function(f,d){c[d]>0&&r.push("+"+c[d]+" "+f)}),r.length>0?o='<br><span class="text-xs" style="color: var(--text-muted);">Added: '+r.join(", ")+"</span>":o='<br><span class="text-xs" style="color: var(--text-muted);">Updated with no additions</span>'}else o='<br><span class="text-xs" style="color: var(--text-muted);">Initial sync logged.</span>';const n=new Date(e.date+"T00:00:00"),l=isNaN(n)?e.date:n.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}),h=e.timestamp?e.timestamp:l;a.style.display="block",a.innerHTML="Last updated: <strong>"+h+"</strong>"+o}function D(t){const a=document.getElementById("salah-stats");if(!a)return;const e=t[0].prayers,s=t[t.length-1].prayers,o=t[0].date||"",n=t[t.length-1].date||"",l=Math.max(1,b(o,n)),h=j(e,s,l),u=k(s);let c="";i.forEach(function(d,m){c+=`<div class="stat-card">
        <div class="stat-label">${d} remaining</div>
        <div class="stat-value ${s[m]<0?"negative":"positive"}">${s[m]}</div>
      </div>`}),a.innerHTML=c;const r=document.createElement("div");r.className="card mb-md",r.style.gridColumn="1 / -1",r.innerHTML=`
      <div class="card-title">\u{1F52E} Predictions</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:.75rem;margin-top:.5rem">
        ${i.map(function(d,m){return`<div class="stat-card">
            <div class="stat-label">${d} predicted</div>
            <div class="stat-value">${h[m]}d</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">${d} actual</div>
            <div class="stat-value">${u[m]}d</div>
          </div>`}).join("")}
      </div>`;const f=document.getElementById("salah-prediction");f&&f.remove(),r.id="salah-prediction",a.after(r)}async function I(t){const a=document.getElementById("salah-chart");if(!a)return;try{await $()}catch(n){console.error(n);return}if(p&&(p.destroy(),p=null),t.length<2){a.parentElement.innerHTML+='<p class="text-muted text-sm text-center">Need at least 2 entries for chart.</p>';return}const e=[],s=i.map(function(n){return{label:n,data:[],fill:!1,tension:.35}}),o=["#6366f1","#22c55e","#f59e0b","#ef4444","#06b6d4"];s.forEach(function(n,l){n.borderColor=o[l],n.backgroundColor=o[l]});for(let n=1;n<t.length;n++){const l=t[n].date?formatDate(t[n].date):"Entry "+(n+1);e.push(l),i.forEach(function(h,u){s[u].data.push(t[n].prayers[u]-t[n-1].prayers[u])})}p=new Chart(a,{type:"line",data:{labels:e,datasets:s},options:{responsive:!0,plugins:{legend:{position:"bottom"},tooltip:{mode:"index",intersect:!1}},scales:{y:{title:{display:!0,text:"\u0394 Rakah"},grid:{color:"#e2e8f0"}},x:{grid:{color:"#e2e8f0"}}}}})}function S(t){const a=document.getElementById("salah-tbody");a&&(a.innerHTML=t.map(function(e,s){return`<tr>
        <td>${e.date?formatDate(e.date):`Day ${s+1}`}</td>
        ${e.prayers.map(function(n){return`<td class="td-num ${n<0?"td-negative":n>0?"td-positive":""}" style="text-align: right; font-variant-numeric: tabular-nums;">${n}</td>`}).join("")}
      </tr>`}).join(""))}function j(t,a,e){return i.map(function(s,o){const n=Math.abs(a[o]-t[o]);if(n===0)return a[o]===0?0:"\u221E";const l=DIV(e,n),h=Math.abs(a[o]);return Math.ceil(l*h)})}function k(t){return i.map(function(a,e){return Math.ceil(Math.abs(DIV(t[e],y[e])))})}async function T(){try{const t=await firebaseGet(x()),a=t?objectToArray(t):[];return localStorage.setItem(g(),JSON.stringify(a)),a}catch(t){console.warn("Firebase read failed, using localStorage:",t);try{return JSON.parse(localStorage.getItem(g()))||[]}catch{return[]}}}function B(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}return{render:M,submit:E,loadData:w}}();export{_ as SalahModule};
//# sourceMappingURL=salah.js.map
