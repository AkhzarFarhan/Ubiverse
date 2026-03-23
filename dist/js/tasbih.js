const O=function(){"use strict";const b=()=>"tasbih_"+window.AppState.username,w=()=>"tasbih/"+window.AppState.username,i=[{arabic:"\u0633\u064F\u0628\u0652\u062D\u064E\u0627\u0646\u064E \u0671\u0644\u0644\u064E\u0651\u0670\u0647\u0650",label:"SubhanAllah",count:33},{arabic:"\u0671\u0644\u0652\u062D\u064E\u0645\u0652\u062F\u064F \u0644\u0650\u0644\u064E\u0651\u0670\u0647\u0650",label:"Alhamdulillah",count:33},{arabic:"\u0671\u0644\u0644\u064E\u0651\u0670\u0647\u064F \u0623\u064E\u0643\u0652\u0628\u064E\u0631\u064F",label:"Allahu Akbar",count:34}],l=i.reduce((t,e)=>t+e.count,0);let s="standard",a=0,o=0,n=100;function P(){return i[o]}function v(){let t=a;for(let e=0;e<i.length;e++){if(t<i[e].count)return{idx:e,offset:t};t-=i[e].count}return{idx:i.length-1,offset:i[i.length-1].count}}function g(t){navigator.vibrate&&navigator.vibrate(t)}function L(){document.getElementById("app").innerHTML=`
      <div class="fade-in">
        <div class="page-header">
          <h2>\u{1F4FF} Tasbih</h2>
          <p>Digital dhikr counter</p>
        </div>

        <!-- Mode tabs -->
        <div class="tasbih-mode-tabs">
          <button class="tasbih-mode-tab active" data-mode="standard">Standard (33-33-34)</button>
          <button class="tasbih-mode-tab" data-mode="custom">Custom Counter</button>
        </div>

        <div class="card">
          <div class="tasbih-wrap">
            <!-- Phase label (standard mode) -->
            <div class="tasbih-phase" id="tasbih-phase"></div>

            <div class="tasbih-count" id="tasbih-count">0</div>

            <div class="tasbih-progress">
              <div class="tasbih-progress-bar" id="tasbih-bar" style="width:0%"></div>
            </div>

            <div class="text-muted text-sm" id="tasbih-progress-label">0 / 33</div>

            <button class="tasbih-btn" id="tasbih-tap" aria-label="Tap to count"></button>

            <div class="completion-msg" id="tasbih-complete">
              \u{1F389} Tasbih complete!
            </div>

            <!-- Custom mode: target input -->
            <div class="tasbih-target-row hidden" id="tasbih-custom-row">
              <label for="tasbih-custom-target" style="margin-bottom:0">Target:</label>
              <input type="number" id="tasbih-custom-target" value="100" min="1" max="99999"
                style="width:90px;" />
              <button class="btn btn-secondary btn-sm" id="tasbih-set-custom">Set</button>
            </div>

            <button class="btn btn-danger btn-sm" id="tasbih-reset">Reset</button>
          </div>
        </div>

        <div class="card">
          <div class="card-title">Session Info</div>
          <div class="stat-cards" id="tasbih-stats">
            <div class="stat-card">
              <div class="stat-label">Count</div>
              <div class="stat-value" id="tasbih-stat-count">0</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Target</div>
              <div class="stat-value" id="tasbih-stat-target">100</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Remaining</div>
              <div class="stat-value" id="tasbih-stat-remaining">100</div>
            </div>
          </div>
        </div>
      </div>
    `,M(),p(),r(),document.getElementById("tasbih-tap").addEventListener("click",f),document.getElementById("tasbih-reset").addEventListener("click",T),document.getElementById("tasbih-set-custom").addEventListener("click",A),document.querySelectorAll(".tasbih-mode-tab").forEach(function(t){t.addEventListener("click",function(){C(t.dataset.mode)})}),document.addEventListener("keydown",E)}function C(t){s=t,a=0,o=0,m(),document.querySelectorAll(".tasbih-mode-tab").forEach(function(e){e.classList.toggle("active",e.dataset.mode===t)}),p(),r(),document.getElementById("tasbih-complete").classList.remove("show")}function p(){const t=document.getElementById("tasbih-custom-row"),e=document.getElementById("tasbih-phase");document.querySelectorAll(".tasbih-mode-tab").forEach(function(d){d.classList.toggle("active",d.dataset.mode===s)}),s==="custom"?(t.classList.remove("hidden"),e.classList.add("hidden"),document.getElementById("tasbih-custom-target").value=n):(t.classList.add("hidden"),e.classList.remove("hidden"))}function f(){const t=s==="standard"?l:n;if(!(a>=t)){if(a++,s==="standard"){const e=v();e.idx!==o&&(o=e.idx,g([100,50,100,50,100]))}m(),r(),a>=t&&k()}}function E(t){if(!document.getElementById("tasbih-tap")){document.removeEventListener("keydown",E);return}(t.code==="Space"||t.code==="Enter")&&(t.preventDefault(),f())}function T(){a=0,o=0,m(),r(),document.getElementById("tasbih-complete").classList.remove("show")}function A(){const t=parseInt(document.getElementById("tasbih-custom-target").value,10);!t||t<1||(n=t,a=0,m(),r(),document.getElementById("tasbih-complete").classList.remove("show"))}function k(){document.getElementById("tasbih-complete").classList.add("show"),g([200,100,200,100,300]);const e={count:a,target:s==="standard"?l:n,mode:s,timestamp:getKolkataTimestamp()};firebasePut(w()+"/last",e).catch(function(d){console.warn("Firebase write failed:",d)}),localStorage.setItem(b(),JSON.stringify(y()))}function r(){const t=document.getElementById("tasbih-count"),e=document.getElementById("tasbih-bar"),d=document.getElementById("tasbih-progress-label"),h=document.getElementById("tasbih-phase"),I=document.getElementById("tasbih-tap"),S=document.getElementById("tasbih-stat-count"),x=document.getElementById("tasbih-stat-target"),B=document.getElementById("tasbih-stat-remaining");if(t)if(s==="standard"){const u=v(),c=i[u.idx],_=Math.min(100,a/l*100),R=l-a;t.textContent=u.offset,e.style.width=_+"%",d.textContent=u.offset+" / "+c.count,h.innerHTML='<span class="tasbih-phase-arabic">'+c.arabic+'</span><span class="tasbih-phase-label">'+c.label+"</span>",h.classList.remove("hidden"),I.textContent=c.arabic,S.textContent=a,x.textContent=l,B.textContent=R}else{const u=Math.min(100,a/n*100),c=Math.max(0,n-a);t.textContent=a,e.style.width=u+"%",d.textContent=a+" / "+n,h.classList.add("hidden"),I.textContent=a,S.textContent=a,x.textContent=n,B.textContent=c}}function y(){return{mode:s,count:a,phase:o,customTarget:n}}function M(){try{const t=JSON.parse(localStorage.getItem(b()));t&&(s=t.mode||"standard",a=t.count||0,o=t.phase||0,n=t.customTarget||100)}catch{}}function m(){localStorage.setItem(b(),JSON.stringify(y()))}return{render:L}}();export{O as TasbihModule};
//# sourceMappingURL=tasbih.js.map
