const j=function(){"use strict";const h=()=>"ledger_"+window.AppState.username,b=()=>"LedgerV2/"+window.AppState.username,y=["Cash","PhonePe","PayTM","Other UPI","Card","Net Banking","CashToBank","BankToCash"],R={Cash:"CA",PhonePe:"PP",PayTM:"UPI","Other UPI":"UPI",Card:"CRD","Net Banking":"NB",CashToBank:"CTB",BankToCash:"BTC"};function $(){document.getElementById("app").innerHTML=`
      <div class="fade-in">
        <div class="page-header">
          <h2>\u{1F4B0} Ledger</h2>
          <p>Personal finance tracker</p>
        </div>

        <form class="form-card" id="ledger-form" novalidate>
          <div class="card-title">New Transaction</div>
          <div id="ledger-alert"></div>

          <!-- Type toggle -->
          <div class="ledger-type-row">
            <button type="button" class="ledger-type-btn active" data-type="debit">\u2212 Debit</button>
            <button type="button" class="ledger-type-btn" data-type="credit">+ Credit</button>
          </div>

          <!-- Amount -->
          <div class="form-group">
            <label for="ledger-amount">Amount (\u20B9)</label>
            <input type="number" id="ledger-amount" placeholder="0.00" min="0" step="0.01" inputmode="decimal" />
          </div>

          <!-- Mode pills -->
          <div class="form-group">
            <label>Mode</label>
            <div class="ledger-mode-pills" id="ledger-mode-pills">
              ${y.map(function(t,e){return'<button type="button" class="mode-pill'+(e===0?" active":"")+'" data-mode="'+t+'">'+t+"</button>"}).join("")}
            </div>
          </div>

          <!-- Details -->
          <div class="form-group">
            <input type="text" id="ledger-details" placeholder="Details (e.g. Grocery shopping)" maxlength="200" />
          </div>

          <button type="submit" class="btn btn-primary btn-full">Add Transaction</button>
        </form>

        <div class="card">
          <div class="card-title" id="ledger-transactions-toggle" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
            <span>\u{1F4CB} Transactions</span>
            <span id="ledger-transactions-chevron">\u25BC</span>
          </div>
          <div id="ledger-transactions-content" style="display: none;">
            <div class="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Timestamp</th>
                    <th>Details</th>
                    <th>Mode</th>
                    <th class="td-num">Credit</th>
                    <th class="td-num">Debit</th>
                    <th class="td-num">Total Balance</th>
                  </tr>
                </thead>
                <tbody id="ledger-tbody"><tr><td colspan="7" class="text-muted text-sm text-center">Loading\u2026</td></tr></tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-title">\u{1F4C5} Monthly Summary</div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th class="td-num">Credit</th>
                  <th class="td-num">Debit</th>
                  <th class="td-num">Net</th>
                </tr>
              </thead>
              <tbody id="ledger-monthly"></tbody>
            </table>
          </div>
        </div>

        <div class="stat-cards" id="ledger-balances">
          <div class="stat-card">
            <div class="stat-label">Cash Balance</div>
            <div class="stat-value" id="bal-cash">\u20B90.00</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Bank Balance</div>
            <div class="stat-value" id="bal-bank">\u20B90.00</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Balance</div>
            <div class="stat-value" id="bal-total">\u20B90.00</div>
          </div>
        </div>

        <div class="card" id="ledger-chart-card">
          <div class="card-title">\u{1F4C8} Financial Timeline</div>
          <div style="width: 100%; margin-top: 1rem;" id="ledger-chart-wrapper">
            <div id="ledger-chart-loader" style="min-height: 100px; display:flex; align-items:center; justify-content:center; color:var(--text-muted); font-size:0.875rem;">Loading graph...</div>
          </div>
        </div>

        <div class="stat-cards" id="ledger-lifetime-stats" style="margin-top: 1.5rem;">
          <div class="stat-card">
            <div class="stat-label">Lifetime Credits</div>
            <div class="stat-value td-positive" id="bal-lifetime-credits">\u20B90.00</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Lifetime Debits</div>
            <div class="stat-value td-negative" id="bal-lifetime-debits">\u20B90.00</div>
          </div>
        </div>
      </div>
    `;const n=document.getElementById("ledger-transactions-toggle");n&&n.addEventListener("click",function(){const t=document.getElementById("ledger-transactions-content"),e=document.getElementById("ledger-transactions-chevron");t.style.display==="none"?(t.style.display="block",e.textContent="\u25B2"):(t.style.display="none",e.textContent="\u25BC")}),document.querySelectorAll(".ledger-type-btn").forEach(function(t){t.addEventListener("click",function(){document.querySelectorAll(".ledger-type-btn").forEach(function(e){e.classList.remove("active")}),t.classList.add("active")})}),document.querySelectorAll(".mode-pill").forEach(function(t){t.addEventListener("click",function(){document.querySelectorAll(".mode-pill").forEach(function(e){e.classList.remove("active")}),t.classList.add("active")})}),document.getElementById("ledger-form").addEventListener("submit",function(t){t.preventDefault(),w()}),C()}async function w(){const n=parseFloat(document.getElementById("ledger-amount").value)||0,t=document.querySelector(".ledger-type-btn.active").dataset.type,e=document.querySelector(".mode-pill.active"),o=e?e.dataset.mode:y[0],d=document.getElementById("ledger-details").value.trim(),l=t==="credit"?n:0,r=t==="debit"?n:0;if(n<=0){showAlert("ledger-alert","Enter a valid amount.","error");return}const a=await S();if(a.length>0){const s=a[a.length-1];if(s.credit===l&&s.debit===r&&s.mode===o&&s.details===d){showAlert("ledger-alert","Duplicate transaction detected. Matches the last entry.","warning");return}}const i=O(a,l,r,o,d);a.push(i);try{await firebasePost(b(),i)}catch(s){console.warn("Firebase write failed:",s)}localStorage.setItem(h(),JSON.stringify(a)),sendTelegramForLedger(i,window.AppState.username),document.getElementById("ledger-amount").value="",document.getElementById("ledger-details").value="",clearAlert("ledger-alert"),showAlert("ledger-alert","Transaction added!","success"),I(a),E(a),B(a),x(a)}function O(n,t,e,o,d){const l=n.length>0?n[n.length-1]:{cash:0,bank:0,total:0,transaction_id:0};let r=l.cash,a=l.bank,i=l.total;const s=t>0?t:e;return o==="CashToBank"?(r-=s,a+=s):o==="BankToCash"?(r+=s,a-=s):o==="Cash"?t>0?(r+=t,i+=t):(r-=e,i-=e):t>0?(a+=t,i+=t):(a-=e,i-=e),{transaction_id:l.transaction_id+1,credit:t,debit:e,mode:o,details:d,cash:parseFloat(r.toFixed(2)),bank:parseFloat(a.toFixed(2)),total:parseFloat(i.toFixed(2)),timestamp:getKolkataTimestamp()}}async function C(){const n=await S();if(n.length===0){const t=document.getElementById("ledger-tbody");t&&(t.innerHTML='<tr><td colspan="7" class="text-muted text-sm text-center">No transactions yet.</td></tr>');return}I(n),E(n),B(n),x(n)}function I(n){if(n.length===0)return;const t=n[n.length-1];document.getElementById("bal-cash").textContent=getINR(t.cash),document.getElementById("bal-bank").textContent=getINR(t.bank),document.getElementById("bal-total").textContent=getINR(t.total);let e=0,o=0;n.forEach(function(r){r.credit&&(e+=parseFloat(r.credit)),r.debit&&(o+=parseFloat(r.debit))});const d=document.getElementById("bal-lifetime-credits"),l=document.getElementById("bal-lifetime-debits");d&&(d.textContent=getINR(e)),l&&(l.textContent=getINR(o))}function E(n){const t=document.getElementById("ledger-tbody");t&&(t.innerHTML=n.slice().reverse().map(function(e){const o=(e.timestamp||"").split(" ")[0]||e.timestamp;return`<tr>
        <td>${e.transaction_id}</td>
        <td style="white-space:nowrap;font-size:.75rem">${o}</td>
        <td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${N(e.details||"")}">${N(e.details||"")}</td>
        <td><span class="badge badge-neutral">${R[e.mode]||e.mode}</span></td>
        <td class="td-num td-positive">${e.credit>0?getINR(e.credit):"\u2014"}</td>
        <td class="td-num td-negative">${e.debit>0?getINR(e.debit):"\u2014"}</td>
        <td class="td-num font-bold">${getINR(e.total)}</td>
      </tr>`}).join(""))}function B(n){const t=document.getElementById("ledger-monthly");if(!t)return;const e={};n.forEach(function(d){const l=(d.timestamp||"").split(" ")[0].split("-"),r=l.length===3?l[1]+"-"+l[2]:"Unknown";e[r]||(e[r]={credit:0,debit:0}),e[r].credit+=d.credit||0,e[r].debit+=d.debit||0});const o=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];t.innerHTML=Object.keys(e).sort(function(d,l){if(d==="Unknown")return 1;if(l==="Unknown")return-1;const[r,a]=d.split("-").map(function(c){return parseInt(c,10)}),[i,s]=l.split("-").map(function(c){return parseInt(c,10)});return a!==s?a-s:r-i}).map(function(d){if(d==="Unknown"){const s=e[d].credit-e[d].debit;return`<tr>
        <td>Unknown</td>
        <td class="td-num td-positive">${getINR(e[d].credit)}</td>
        <td class="td-num td-negative">${getINR(e[d].debit)}</td>
        <td class="td-num ${s>=0?"td-positive":"td-negative"} font-bold">${getINR(s)}</td>
      </tr>`}const[l,r]=d.split("-"),a=o[parseInt(l,10)-1]+" "+r,i=e[d].credit-e[d].debit;return`<tr>
        <td>${a}</td>
        <td class="td-num td-positive">${getINR(e[d].credit)}</td>
        <td class="td-num td-negative">${getINR(e[d].debit)}</td>
        <td class="td-num ${i>=0?"td-positive":"td-negative"} font-bold">${getINR(i)}</td>
      </tr>`}).join("")}let v=[],f=null,m=null;function x(n){f=n;const t=document.getElementById("ledger-chart-card");t&&(window.IntersectionObserver?(m&&m.disconnect(),m=new IntersectionObserver(function(e){e[0].isIntersecting&&(m.disconnect(),T())},{rootMargin:"0px 0px 200px 0px"}),m.observe(t)):T())}function T(){if(window.Chart){k();return}const n=document.createElement("script");n.src="https://cdn.jsdelivr.net/npm/chart.js",n.onload=function(){k()},document.head.appendChild(n)}function k(){if(!window.Chart||!f)return;const n=document.getElementById("ledger-chart-wrapper");if(!n)return;v.forEach(function(a){a.destroy()}),v=[],n.innerHTML="";const t={};f.forEach(function(a){const i=(a.timestamp||"").split(" ")[0].split("-");if(i.length<3)return;const s=i[1],c=i[2];if(!t[c]){t[c]={};for(let u=1;u<=12;u++){const p=u.toString().padStart(2,"0");t[c][p]={credit:0,debit:0}}}t[c][s].credit+=a.credit||0,t[c][s].debit+=a.debit||0});const e=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],o=Object.keys(t).sort(function(a,i){return parseInt(i,10)-parseInt(a,10)});if(o.length===0){n.innerHTML='<div style="text-align:center; color:var(--text-muted); padding:1rem;">No graphical data available.</div>';return}const d=document.body.style.backgroundColor!=="#ffffff"&&document.body.style.backgroundColor!=="white"&&!document.body.classList.contains("light-theme"),l=d?"#9ca3af":"#6b7280",r=d?"#374151":"#e5e7eb";o.forEach(function(a){const i=document.createElement("div");i.style.marginBottom="2.5rem";const s=document.createElement("h3");s.style.fontSize="1.1rem",s.style.marginBottom="0.5rem",s.style.fontWeight="600",s.innerText="Year "+a,i.appendChild(s);const c=document.createElement("div");c.style.position="relative",c.style.height="250px",c.style.width="100%";const u=document.createElement("canvas");c.appendChild(u),i.appendChild(c),n.appendChild(i);const p=t[a],A=[],D=[],L=[];for(let g=1;g<=12;g++){const M=g.toString().padStart(2,"0");A.push(e[g-1]),D.push(p[M].credit),L.push(p[M].debit)}const F=u.getContext("2d"),P=new Chart(F,{type:"line",data:{labels:A,datasets:[{label:"Credit",data:D,borderColor:"#10b981",backgroundColor:"rgba(16, 185, 129, 0.1)",borderWidth:2,tension:.3,fill:!0},{label:"Debit",data:L,borderColor:"#ef4444",backgroundColor:"rgba(239, 68, 68, 0.1)",borderWidth:2,tension:.3,fill:!0}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!0,position:"top",labels:{color:l}}},scales:{x:{ticks:{color:l},grid:{display:!1}},y:{ticks:{color:l},grid:{color:r}}}}});v.push(P)})}async function S(){try{const n=await firebaseGet(b()),t=n?objectToArray(n):[];return localStorage.setItem(h(),JSON.stringify(t)),t}catch(n){console.warn("Firebase read failed, using localStorage:",n);try{return JSON.parse(localStorage.getItem(h()))||[]}catch{return[]}}}function N(n){return String(n).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}return{render:$,submit:w,loadData:C}}();export{j as LedgerModule};
//# sourceMappingURL=ledger.js.map
