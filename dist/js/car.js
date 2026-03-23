const D=function(){"use strict";const i=()=>"car_"+window.AppState.username,m=()=>"car/"+window.AppState.username,v=()=>"car_fuel_rate_"+window.AppState.username;function B(){document.getElementById("app").innerHTML=`
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
              <input type="text" id="car-mode" placeholder="e.g. City / Highway / Mixed" />
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
                  <th>#</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th class="td-num">Odo</th>
                  <th class="td-num">Dist</th>
                  <th>Mode</th>
                  <th class="td-num">Fuel L</th>
                  <th class="td-num">Fuel \u20B9</th>
                  <th class="td-num">\u20B9/L</th>
                  <th class="td-num">km/L</th>
                  <th>Full</th>
                  <th>Station</th>
                  <th class="td-num">Svc \u20B9</th>
                  <th>Service</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody id="car-tbody"><tr><td colspan="15" class="text-muted text-sm text-center">Loading\u2026</td></tr></tbody>
            </table>
          </div>
        </div>
      </div>
    `;const a=new Date().toISOString().slice(0,10);document.getElementById("car-date").value=a;const e=localStorage.getItem(v());e&&(document.getElementById("car-fuel-rate").value=e),g("fuel-toggle","fuel-section","fuel-toggle-icon"),g("service-toggle","service-section","service-toggle-icon"),document.getElementById("car-form").addEventListener("submit",function(t){t.preventDefault(),f()}),document.getElementById("car-fuel-vol").addEventListener("input",function(){F()}),document.getElementById("car-fuel-cost").addEventListener("input",function(){x()}),p()}function g(a,e,t){document.getElementById(a).addEventListener("click",function(){const l=document.getElementById(e),s=document.getElementById(t);l.classList.toggle("open"),s.textContent=l.classList.contains("open")?"\u25BC":"\u25B6"})}function F(){const a=parseFloat(document.getElementById("car-fuel-vol").value)||0,e=parseFloat(document.getElementById("car-fuel-rate").value)||0;a>0&&e>0&&(document.getElementById("car-fuel-cost").value=(a*e).toFixed(2))}function x(){const a=parseFloat(document.getElementById("car-fuel-cost").value)||0,e=parseFloat(document.getElementById("car-fuel-rate").value)||0;a>0&&e>0&&(document.getElementById("car-fuel-vol").value=(a/e).toFixed(2))}async function f(){const a=document.getElementById("car-date").value,e=parseFloat(document.getElementById("car-odometer").value)||0,t=parseFloat(document.getElementById("car-fuel-rate").value)||0;let l=parseFloat(document.getElementById("car-fuel-vol").value)||0,s=parseFloat(document.getElementById("car-fuel-cost").value)||0;const c=document.getElementById("car-full-tank").checked,d=document.getElementById("car-station").value.trim(),o=parseFloat(document.getElementById("car-svc-cost").value)||0,u=document.getElementById("car-svc-details").value.trim(),S=document.getElementById("car-mode").value.trim(),T=document.getElementById("car-notes").value.trim();if(!a){showAlert("car-alert","Date is required.","error");return}if(!e||e<=0){showAlert("car-alert","Odometer reading must be greater than 0.","error");return}const n=await b(),E=n.length>0?n[n.length-1].odometer:0;if(e<E){showAlert("car-alert",`Odometer (${e}) cannot be less than last entry (${E}).`,"error");return}if((l>0||s>0)&&t<=0){showAlert("car-alert","Fuel rate is required when entering fuel data.","error");return}l>0&&s===0&&t>0?s=parseFloat((l*t).toFixed(2)):s>0&&l===0&&t>0&&(l=parseFloat((s/t).toFixed(2))),t>0&&localStorage.setItem(v(),String(t));const L=t>0?t:l>0?parseFloat(DIV(s,l).toFixed(2)):0;clearAlert("car-alert");const I=C(n,{date:a,odometer:e,fuelVol:l,fuelCost:s,ppu:L,fullTank:c,station:d,svcCost:o,svcDetails:u,mode:S,notes:T});n.push(I);try{await firebasePost(m(),I)}catch(k){console.warn("Firebase write failed:",k)}localStorage.setItem(i(),JSON.stringify(n)),showAlert("car-alert","Entry saved! \u{1F697}","success"),document.getElementById("car-fuel-vol").value="",document.getElementById("car-fuel-cost").value="",document.getElementById("car-full-tank").checked=!1,document.getElementById("car-station").value="",document.getElementById("car-svc-cost").value="",document.getElementById("car-svc-details").value="",document.getElementById("car-mode").value="",document.getElementById("car-notes").value="",y(n),h(n)}function C(a,e){const t=a.length>0?a[a.length-1]:null,l=t?t.odometer:0,s=e.odometer-l;let c=null;t&&t.fullTank&&s>0&&e.fuelVol>0&&(c=parseFloat(DIV(s,e.fuelVol).toFixed(2)));let d="odometer";return e.fuelVol>0&&e.svcCost>0?d="fuel+service":e.fuelVol>0?d="fuel":e.svcCost>0&&(d="service"),{entry_id:(t?t.entry_id:0)+1,date:e.date,odometer:e.odometer,distanceTraveled:s,fuelVolume:e.fuelVol,totalCost:e.fuelCost,pricePerUnit:e.ppu,fullTank:e.fullTank,station:e.station,serviceCost:e.svcCost,serviceDetails:e.svcDetails,drivingMode:e.mode,notes:e.notes,mileage:c,entryType:d,timestamp:getKolkataTimestamp()}}async function p(){const a=await b();if(a.length===0){const e=document.getElementById("car-tbody");e&&(e.innerHTML='<tr><td colspan="15" class="text-muted text-sm text-center">No entries yet.</td></tr>');return}y(a),h(a)}function y(a){let e=0,t=0,l=0,s=0;const c=[];a.forEach(function(o){e+=o.distanceTraveled||0,t+=o.fuelVolume||0,l+=o.totalCost||0,s+=o.serviceCost||0,o.mileage!=null&&c.push(o.mileage)});const d=c.length>0?(c.reduce(function(o,u){return o+u},0)/c.length).toFixed(2):null;document.getElementById("cs-dist").textContent=e.toLocaleString()+" km",document.getElementById("cs-fuel").textContent=t.toFixed(1)+" L",document.getElementById("cs-fcost").textContent=getINR(l),document.getElementById("cs-scost").textContent=getINR(s),document.getElementById("cs-mileage").textContent=d?d+" km/L":"\u2014 km/L"}function h(a){const e=document.getElementById("car-tbody");e&&(e.innerHTML=a.slice().reverse().map(function(t){const l={fuel:"badge-primary",service:"badge-warning","fuel+service":"badge-success",odometer:"badge-neutral"}[t.entryType]||"badge-neutral";return`<tr>
        <td>${t.entry_id}</td>
        <td style="white-space:nowrap">${formatDate(t.date)}</td>
        <td><span class="badge ${l}">${t.entryType}</span></td>
        <td class="td-num">${t.odometer.toLocaleString()}</td>
        <td class="td-num">${t.distanceTraveled>0?"+"+t.distanceTraveled:"\u2014"}</td>
        <td>${r(t.drivingMode||"")}</td>
        <td class="td-num">${t.fuelVolume>0?t.fuelVolume:"\u2014"}</td>
        <td class="td-num">${t.totalCost>0?getINR(t.totalCost):"\u2014"}</td>
        <td class="td-num">${t.pricePerUnit>0?t.pricePerUnit.toFixed(1):"\u2014"}</td>
        <td class="td-num">${t.mileage!=null?t.mileage+" km/L":"\u2014"}</td>
        <td class="td-center">${t.fullTank?"\u2705":""}</td>
        <td>${r(t.station||"")}</td>
        <td class="td-num">${t.serviceCost>0?getINR(t.serviceCost):"\u2014"}</td>
        <td>${r(t.serviceDetails||"")}</td>
        <td>${r(t.notes||"")}</td>
      </tr>`}).join(""))}async function b(){try{const a=await firebaseGet(m()),e=a?objectToArray(a):[];return localStorage.setItem(i(),JSON.stringify(e)),e}catch(a){console.warn("Firebase read failed, using localStorage:",a);try{return JSON.parse(localStorage.getItem(i()))||[]}catch{return[]}}}function r(a){return String(a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}return{render:B,submit:f,loadData:p}}();export{D as CarModule};
//# sourceMappingURL=car.js.map
