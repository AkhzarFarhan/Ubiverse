const U=function(){"use strict";const f=()=>"ledger_"+window.AppState.username,y=()=>"LedgerV2/"+window.AppState.username,C=["Cash","PhonePe","PayTM","Other UPI","Card","Net Banking","CashToBank","BankToCash"],$={Cash:"CA",PhonePe:"PP",PayTM:"UPI","Other UPI":"UPI",Card:"CRD","Net Banking":"NB",CashToBank:"CTB",BankToCash:"BTC"};function O(){document.getElementById("app").innerHTML=`
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
              ${C.map(function(t,n){return'<button type="button" class="mode-pill'+(n===0?" active":"")+'" data-mode="'+t+'">'+t+"</button>"}).join("")}
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
    `;const e=document.getElementById("ledger-transactions-toggle");e&&e.addEventListener("click",function(){const t=document.getElementById("ledger-transactions-content"),n=document.getElementById("ledger-transactions-chevron");t.style.display==="none"?(t.style.display="block",n.textContent="\u25B2"):(t.style.display="none",n.textContent="\u25BC")}),document.querySelectorAll(".ledger-type-btn").forEach(function(t){t.addEventListener("click",function(){document.querySelectorAll(".ledger-type-btn").forEach(function(n){n.classList.remove("active")}),t.classList.add("active")})}),document.querySelectorAll(".mode-pill").forEach(function(t){t.addEventListener("click",function(){document.querySelectorAll(".mode-pill").forEach(function(n){n.classList.remove("active")}),t.classList.add("active")})}),document.getElementById("ledger-form").addEventListener("submit",function(t){t.preventDefault(),w()}),B()}async function w(){const e=parseFloat(document.getElementById("ledger-amount").value)||0,t=document.querySelector(".ledger-type-btn.active").dataset.type,n=document.querySelector(".mode-pill.active"),d=n?n.dataset.mode:C[0],s=document.getElementById("ledger-details").value.trim(),l=t==="credit"?e:0,i=t==="debit"?e:0;if(e<=0){showAlert("ledger-alert","Enter a valid amount.","error");return}const a=await N();if(a.length>0){const r=a[a.length-1];if(r.credit===l&&r.debit===i&&r.mode===d&&r.details===s){showAlert("ledger-alert","Duplicate transaction detected. Matches the last entry.","warning");return}}const o=P(a,l,i,d,s);a.push(o);try{await firebasePost(y(),o)}catch(r){console.warn("Firebase write failed:",r)}localStorage.setItem(f(),JSON.stringify(a)),sendTelegramForLedger(o,window.AppState.username),document.getElementById("ledger-amount").value="",document.getElementById("ledger-details").value="",clearAlert("ledger-alert"),showAlert("ledger-alert","Transaction added!","success"),I(a),E(a),T(a),x(a)}function P(e,t,n,d,s){const l=e.length>0?e[e.length-1]:{cash:0,bank:0,total:0,transaction_id:0};let i=l.cash,a=l.bank,o=l.total;const r=t>0?t:n;return d==="CashToBank"?(i-=r,a+=r):d==="BankToCash"?(i+=r,a-=r):d==="Cash"?t>0?(i+=t,o+=t):(i-=n,o-=n):t>0?(a+=t,o+=t):(a-=n,o-=n),{transaction_id:l.transaction_id+1,credit:t,debit:n,mode:d,details:s,cash:parseFloat(i.toFixed(2)),bank:parseFloat(a.toFixed(2)),total:parseFloat(o.toFixed(2)),timestamp:getKolkataTimestamp()}}async function B(){const e=await N();if(e.length===0){const t=document.getElementById("ledger-tbody");t&&(t.innerHTML='<tr><td colspan="7" class="text-muted text-sm text-center">No transactions yet.</td></tr>');return}I(e),E(e),T(e),x(e)}function I(e){if(e.length===0)return;const t=e[e.length-1];document.getElementById("bal-cash").textContent=getINR(t.cash),document.getElementById("bal-bank").textContent=getINR(t.bank),document.getElementById("bal-total").textContent=getINR(t.total);let n=0,d=0;e.forEach(function(i){i.mode==="CashToBank"||i.mode==="BankToCash"||(i.credit&&(n+=parseFloat(i.credit)),i.debit&&(d+=parseFloat(i.debit)))});const s=document.getElementById("bal-lifetime-credits"),l=document.getElementById("bal-lifetime-debits");s&&(s.textContent=getINR(n)),l&&(l.textContent=getINR(d))}function E(e){const t=document.getElementById("ledger-tbody");if(!t)return;const n=function(d){return d==="CashToBank"||d==="BankToCash"};t.innerHTML=e.slice().reverse().map(function(d){const s=(d.timestamp||"").split(" ")[0]||d.timestamp;return`<tr>
        <td>${d.transaction_id}</td>
        <td style="white-space:nowrap;font-size:.75rem">${s}</td>
        <td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${D(d.details||"")}">${D(d.details||"")}</td>
        <td><span class="badge badge-neutral">${$[d.mode]||d.mode}</span></td>
        <td class="td-num td-positive">${n(d.mode)?"\u2014":d.credit>0?getINR(d.credit):"\u2014"}</td>
        <td class="td-num td-negative">${n(d.mode)?"\u2014":d.debit>0?getINR(d.debit):"\u2014"}</td>
        <td class="td-num font-bold">${getINR(d.total)}</td>
      </tr>`}).join("")}function T(e){const t=document.getElementById("ledger-monthly");if(!t)return;const n={};e.forEach(function(s){if(s.mode==="CashToBank"||s.mode==="BankToCash")return;const l=(s.timestamp||"").split(" ")[0].split("-"),i=l.length===3?l[1]+"-"+l[2]:"Unknown";n[i]||(n[i]={credit:0,debit:0}),n[i].credit+=s.credit||0,n[i].debit+=s.debit||0});const d=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];t.innerHTML=Object.keys(n).sort(function(s,l){if(s==="Unknown")return 1;if(l==="Unknown")return-1;const[i,a]=s.split("-").map(function(c){return parseInt(c,10)}),[o,r]=l.split("-").map(function(c){return parseInt(c,10)});return a!==r?r-a:o-i}).map(function(s){if(s==="Unknown"){const r=n[s].credit-n[s].debit;return`<tr>
        <td>Unknown</td>
        <td class="td-num td-positive">${getINR(n[s].credit)}</td>
        <td class="td-num td-negative">${getINR(n[s].debit)}</td>
        <td class="td-num ${r>=0?"td-positive":"td-negative"} font-bold">${getINR(r)}</td>
      </tr>`}const[l,i]=s.split("-"),a=d[parseInt(l,10)-1]+" "+i,o=n[s].credit-n[s].debit;return`<tr>
        <td>${a}</td>
        <td class="td-num td-positive">${getINR(n[s].credit)}</td>
        <td class="td-num td-negative">${getINR(n[s].debit)}</td>
        <td class="td-num ${o>=0?"td-positive":"td-negative"} font-bold">${getINR(o)}</td>
      </tr>`}).join("")}let b=[],v=null,p=null;function x(e){v=e;const t=document.getElementById("ledger-chart-card");t&&(window.IntersectionObserver?(p&&p.disconnect(),p=new IntersectionObserver(function(n){n[0].isIntersecting&&(p.disconnect(),k())},{rootMargin:"0px 0px 200px 0px"}),p.observe(t)):k())}function k(){if(window.Chart){S();return}const e=document.createElement("script");e.src="https://cdn.jsdelivr.net/npm/chart.js",e.onload=function(){S()},document.head.appendChild(e)}function S(){if(!window.Chart||!v)return;const e=document.getElementById("ledger-chart-wrapper");if(!e)return;b.forEach(function(a){a.destroy()}),b=[],e.innerHTML="";const t={};v.forEach(function(a){if(a.mode==="CashToBank"||a.mode==="BankToCash")return;const o=(a.timestamp||"").split(" ")[0].split("-");if(o.length<3)return;const r=o[1],c=o[2];if(!t[c]){t[c]={};for(let u=1;u<=12;u++){const m=u.toString().padStart(2,"0");t[c][m]={credit:0,debit:0}}}t[c][r].credit+=a.credit||0,t[c][r].debit+=a.debit||0});const n=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],d=Object.keys(t).sort(function(a,o){return parseInt(o,10)-parseInt(a,10)});if(d.length===0){e.innerHTML='<div style="text-align:center; color:var(--text-muted); padding:1rem;">No graphical data available.</div>';return}const s=document.body.style.backgroundColor!=="#ffffff"&&document.body.style.backgroundColor!=="white"&&!document.body.classList.contains("light-theme"),l=s?"#9ca3af":"#6b7280",i=s?"#374151":"#e5e7eb";d.forEach(function(a){const o=document.createElement("div");o.style.marginBottom="2.5rem";const r=document.createElement("h3");r.style.fontSize="1.1rem",r.style.marginBottom="0.5rem",r.style.fontWeight="600",r.innerText="Year "+a,o.appendChild(r);const c=document.createElement("div");c.style.position="relative",c.style.height="250px",c.style.width="100%";const u=document.createElement("canvas");c.appendChild(u),o.appendChild(c),e.appendChild(o);const m=t[a],A=[],L=[],M=[],R=[];let F=0;for(let g=1;g<=12;g++){const h=g.toString().padStart(2,"0");A.push(n[g-1]),L.push(m[h].credit),M.push(m[h].debit),F+=m[h].credit-m[h].debit,R.push(parseFloat(F.toFixed(2)))}const j=u.getContext("2d"),J=new Chart(j,{type:"line",data:{labels:A,datasets:[{label:"Credit",data:L,borderColor:"#10b981",backgroundColor:"rgba(16, 185, 129, 0.1)",borderWidth:2,tension:.3,fill:!0},{label:"Debit",data:M,borderColor:"#ef4444",backgroundColor:"rgba(239, 68, 68, 0.1)",borderWidth:2,tension:.3,fill:!0},{label:"Balance",data:R,borderColor:"#3b82f6",backgroundColor:"rgba(59, 130, 246, 0.08)",borderWidth:2.5,borderDash:[6,3],tension:.3,fill:!1,pointRadius:3}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!0,position:"top",labels:{color:l}}},scales:{x:{ticks:{color:l},grid:{display:!1}},y:{ticks:{color:l},grid:{color:i}}}}});b.push(J)})}async function N(){try{const e=await firebaseGet(y()),t=e?objectToArray(e):[];return localStorage.setItem(f(),JSON.stringify(t)),t}catch(e){console.warn("Firebase read failed, using localStorage:",e);try{return JSON.parse(localStorage.getItem(f()))||[]}catch{return[]}}}function D(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}return{render:O,submit:w,loadData:B}}();export{U as LedgerModule};
//# sourceMappingURL=ledger.js.map
