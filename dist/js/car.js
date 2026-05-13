const D=function(){"use strict";const n=()=>"car_"+window.AppState.username,d=()=>"car/"+window.AppState.username,i=()=>"car_fuel_rate_"+window.AppState.username;function E(){document.getElementById("app").innerHTML=`
      <div class="fade-in">
        <div class="page-header">
          <h2>\u{1F697} Car Log</h2>
          <p>Track fuel, service, and mileage</p>
        </div>

        <!-- Summary cards -->
        <div class="stat-cards" id="car-stats">
          <div class="stat-card">
            <div class="stat-label">Total Distance</div>
            <div class="stat-value" id="cs-dist">0 km</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Fuel</div>
            <div class="stat-value" id="cs-fuel">0 L</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Fuel Cost</div>
            <div class="stat-value" id="cs-fcost">\u20B90</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Service Cost</div>
            <div class="stat-value" id="cs-scost">\u20B90</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Avg Mileage</div>
            <div class="stat-value" id="cs-mileage">\u2014 km/L</div>
          </div>
        </div>

        <form class="form-card" id="car-form" novalidate>
          <div class="card-title">New Entry</div>
          <div id="car-alert"></div>

          <div class="form-row">
            <div class="form-group">
              <label for="car-date">Date <span style="color:var(--color-danger)">*</span></label>
              <input type="date" id="car-date" />
            </div>
            <div class="form-group">
              <label for="car-odometer">Odometer (km) <span style="color:var(--color-danger)">*</span></label>
              <input type="number" id="car-odometer" placeholder="13500" min="0" step="1" />
            </div>
          </div>

          <!-- Fuel section toggle -->
          <div class="collapsible-header" id="fuel-toggle">
            <span>\u26FD Fuel Entry (optional)</span>
            <span id="fuel-toggle-icon">\u25B6</span>
          </div>
          <div class="collapsible-body" id="fuel-section">
            <div class="form-row">
              <div class="form-group">
                <label for="car-fuel-rate">Fuel Rate (\u20B9/L) <span class="text-xs text-muted">auto-saved</span></label>
                <input type="number" id="car-fuel-rate" placeholder="e.g. 103.50" min="0" step="0.01" />
              </div>
              <div class="form-group">
                <label for="car-station">Station</label>
                <input type="text" id="car-station" placeholder="e.g. HP Majestic" />
              </div>
            </div>
            <p class="text-xs text-muted mb-sm">Enter <strong>either</strong> fuel volume or total cost. The other is calculated from the rate.</p>
            <div class="form-row">
              <div class="form-group">
                <label for="car-fuel-vol">Fuel Volume (L)</label>
                <input type="number" id="car-fuel-vol" placeholder="0" min="0" step="0.01" />
              </div>
              <div class="form-group">
                <label for="car-fuel-cost">Total Cost (\u20B9)</label>
                <input type="number" id="car-fuel-cost" placeholder="0" min="0" step="0.01" />
              </div>
            </div>
            <div class="toggle-row">
              <input type="checkbox" id="car-full-tank" />
              <label for="car-full-tank">Full tank</label>
            </div>
          </div>

          <hr class="divider" />

          <!-- Service section toggle -->
          <div class="collapsible-header" id="service-toggle">
            <span>\u{1F527} Service Entry (optional)</span>
            <span id="service-toggle-icon">\u25B6</span>
          </div>
          <div class="collapsible-body" id="service-section">
            <div class="form-row">
              <div class="form-group">
                <label for="car-svc-cost">Service Cost (\u20B9)</label>
                <input type="number" id="car-svc-cost" placeholder="0" min="0" step="0.01" />
              </div>
              <div class="form-group">
                <label for="car-svc-details">Service Details</label>
                <input type="text" id="car-svc-details" placeholder="e.g. Oil change, air filter" />
              </div>
            </div>
          </div>

          <hr class="divider" />

          <div class="form-row">
            <div class="form-group">
              <label for="car-mode">Driving Mode</label>
              <select id="car-mode">
                <option value="City" selected>City</option>
                <option value="Highway">Highway</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
            <div class="form-group">
              <label for="car-notes">Notes</label>
              <input type="text" id="car-notes" placeholder="Optional notes" maxlength="200" />
            </div>
          </div>

          <button type="submit" class="btn btn-primary">Save Entry</button>
        </form>

        <div class="card">
          <div class="card-title">\u{1F4CB} Log</div>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th class="td-num">ODO</th>
                  <th class="td-num">Driven</th>
                  <th class="td-num">Cost</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody id="car-tbody"><tr><td colspan="5" class="text-muted text-sm text-center">Loading\u2026</td></tr></tbody>
            </table>
          </div>
        </div>
      </div>
    `;const a=new Date().toISOString().slice(0,10);document.getElementById("car-date").value=a;const e=localStorage.getItem(i());e&&(document.getElementById("car-fuel-rate").value=e),u("fuel-toggle","fuel-section","fuel-toggle-icon"),u("service-toggle","service-section","service-toggle-icon"),document.getElementById("car-form").addEventListener("submit",function(t){t.preventDefault(),v()}),document.getElementById("car-fuel-vol").addEventListener("input",function(){I()}),document.getElementById("car-fuel-cost").addEventListener("input",function(){B()}),m()}function u(a,e,t){document.getElementById(a).addEventListener("click",function(){const o=document.getElementById(e),l=document.getElementById(t);o.classList.toggle("open"),l.textContent=o.classList.contains("open")?"\u25BC":"\u25B6"})}function I(){const a=parseFloat(document.getElementById("car-fuel-vol").value)||0,e=parseFloat(document.getElementById("car-fuel-rate").value)||0;a>0&&e>0&&(document.getElementById("car-fuel-cost").value=(a*e).toFixed(2))}function B(){const a=parseFloat(document.getElementById("car-fuel-cost").value)||0,e=parseFloat(document.getElementById("car-fuel-rate").value)||0;a>0&&e>0&&(document.getElementById("car-fuel-vol").value=(a/e).toFixed(2))}async function v(){const a=document.getElementById("car-date").value,e=parseFloat(document.getElementById("car-odometer").value)||0,t=parseFloat(document.getElementById("car-fuel-rate").value)||0;let o=parseFloat(document.getElementById("car-fuel-vol").value)||0,l=parseFloat(document.getElementById("car-fuel-cost").value)||0;const c=document.getElementById("car-full-tank").checked,s=document.getElementById("car-station").value.trim(),y=parseFloat(document.getElementById("car-svc-cost").value)||0,x=document.getElementById("car-svc-details").value.trim(),S=document.getElementById("car-mode").value,T=document.getElementById("car-notes").value.trim();if(!a){showAlert("car-alert","Date is required.","error");return}if(!e||e<=0){showAlert("car-alert","Odometer reading must be greater than 0.","error");return}const r=await p(),b=r.length>0?r[r.length-1].odometer:0;if(e<b){showAlert("car-alert",`Odometer (${e}) cannot be less than last entry (${b}).`,"error");return}if((o>0||l>0)&&t<=0){showAlert("car-alert","Fuel rate is required when entering fuel data.","error");return}o>0&&l===0&&t>0?l=parseFloat((o*t).toFixed(2)):l>0&&o===0&&t>0&&(o=parseFloat((l/t).toFixed(2))),t>0&&localStorage.setItem(i(),String(t));const k=t>0?t:o>0?parseFloat(DIV(l,o).toFixed(2)):0;clearAlert("car-alert");const h=F(r,{date:a,odometer:e,fuelVol:o,fuelCost:l,ppu:k,fullTank:c,station:s,svcCost:y,svcDetails:x,mode:S,notes:T});r.push(h);try{await firebasePost(d(),h)}catch(L){console.warn("Firebase write failed:",L)}localStorage.setItem(n(),JSON.stringify(r)),showAlert("car-alert","Entry saved! \u{1F697}","success"),document.getElementById("car-fuel-vol").value="",document.getElementById("car-fuel-cost").value="",document.getElementById("car-full-tank").checked=!1,document.getElementById("car-station").value="",document.getElementById("car-svc-cost").value="",document.getElementById("car-svc-details").value="",document.getElementById("car-mode").value="City",document.getElementById("car-notes").value="",f(r),g(r)}function F(a,e){const t=a.length>0?a[a.length-1]:null,o=t?t.odometer:0,l=t?e.odometer-o:0;let c=null;t&&t.fullTank&&e.fullTank&&l>0&&e.fuelVol>0&&(c=parseFloat(DIV(l,e.fuelVol).toFixed(2)));let s="odometer";return e.fuelVol>0&&e.svcCost>0?s="fuel+service":e.fuelVol>0?s="fuel":e.svcCost>0&&(s="service"),{entry_id:(t?t.entry_id:0)+1,date:e.date,odometer:e.odometer,distanceTraveled:l,fuelVolume:e.fuelVol,totalCost:e.fuelCost,pricePerUnit:e.ppu,fullTank:e.fullTank,station:e.station,serviceCost:e.svcCost,serviceDetails:e.svcDetails,drivingMode:e.mode,notes:e.notes,mileage:c,entryType:s,timestamp:getKolkataTimestamp()}}async function m(){const a=await p();if(a.length===0){const e=document.getElementById("car-tbody");e&&(e.innerHTML='<tr><td colspan="5" class="text-muted text-sm text-center">No entries yet.</td></tr>');return}f(a),g(a)}function f(a){let e=0,t=0,o=0,l=0;a.forEach(function(s){e+=s.distanceTraveled||0,t+=s.fuelVolume||0,o+=s.totalCost||0,l+=s.serviceCost||0});const c=t>0?DIV(e,t).toFixed(2):null;document.getElementById("cs-dist").textContent=e.toLocaleString()+" km",document.getElementById("cs-fuel").textContent=t.toFixed(1)+" L",document.getElementById("cs-fcost").textContent=getINR(o),document.getElementById("cs-scost").textContent=getINR(l),document.getElementById("cs-mileage").textContent=c?c+" km/L":"\u2014 km/L"}function g(a){const e=document.getElementById("car-tbody");e&&(e.innerHTML=a.slice().reverse().map(function(t){var o=(t.totalCost||0)+(t.serviceCost||0),l=[];t.fuelVolume>0&&l.push("Fuel"),t.serviceCost>0&&t.serviceDetails?l.push(t.serviceDetails):t.serviceCost>0&&l.push("Service"),t.notes&&l.push(t.notes);var c=l.join(" | ")||"\u2014",s=t.distanceTraveled||0;return`<tr>
        <td style="white-space:nowrap">${formatDate(t.date)}</td>
        <td class="td-num">${t.odometer.toLocaleString()}</td>
        <td class="td-num">${s>0?s.toLocaleString()+" km":"\u2014"}</td>
        <td class="td-num">${o>0?getINR(o):"\u2014"}</td>
        <td>${C(c)}</td>
      </tr>`}).join(""))}async function p(){try{const a=await firebaseGet(d()),e=a?objectToArray(a):[];return localStorage.setItem(n(),JSON.stringify(e)),e}catch(a){console.warn("Firebase read failed, using localStorage:",a);try{return JSON.parse(localStorage.getItem(n()))||[]}catch{return[]}}}function C(a){return String(a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}return{render:E,submit:v,loadData:m}}();export{D as CarModule};
//# sourceMappingURL=car.js.map
