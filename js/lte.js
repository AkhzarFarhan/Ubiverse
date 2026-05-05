// js/lte.js
// LTE MAC Sub-Webapp - Displays 3GPP LTE interactions

(function () {
  'use strict';

  window.LteModule = {
    render: render
  };

  const STYLES = `
    .lte-container { max-width: 1000px; margin: 0 auto; padding-bottom: 2rem; font-family: 'Inter', var(--font); }
    .lte-header { margin-bottom: 2rem; padding: 2.5rem 2rem; background: linear-gradient(135deg, var(--color-primary-dark), var(--color-primary)); color: white; border-radius: var(--radius-lg); box-shadow: var(--shadow); position: relative; overflow: hidden; }
    .lte-header::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 10%, transparent 10%); background-size: 20px 20px; opacity: 0.5; pointer-events: none; }
    .lte-title { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.75rem; letter-spacing: -0.5px; position: relative; }
    .lte-subtitle { font-size: 1.1rem; opacity: 0.9; margin-bottom: 1.5rem; line-height: 1.5; position: relative; }
    .lte-ref-container { display: flex; flex-wrap: wrap; gap: 0.5rem; position: relative; }
    .lte-ref-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; backdrop-filter: blur(4px); }
    
    .lte-tab-container { display: flex; gap: 0.5rem; margin-bottom: 2rem; overflow-x: auto; padding-bottom: 0.5rem; scrollbar-width: none; }
    .lte-tab-container::-webkit-scrollbar { display: none; }
    .lte-tab { padding: 0.75rem 1.5rem; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); cursor: pointer; font-weight: 600; color: var(--text-muted); transition: all 0.2s ease; white-space: nowrap; font-size: 0.95rem; }
    .lte-tab.active { background: var(--color-primary); color: white; border-color: var(--color-primary); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
    .lte-tab:hover:not(.active) { background: var(--surface-2); color: var(--text); transform: translateY(-1px); }
    
    .lte-section-content { display: none; }
    .lte-section-content.active { display: block; animation: fadeIn 0.4s ease forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .lte-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.75rem; margin-bottom: 1.5rem; box-shadow: var(--shadow-sm); transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .lte-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }
    
    .lte-primitive-name { font-size: 1.3rem; font-weight: 700; color: var(--text); margin-bottom: 1rem; display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .lte-direction-badge { background: #eff6ff; color: #1d4ed8; padding: 0.3rem 0.8rem; border-radius: var(--radius); font-size: 0.85rem; font-weight: 600; border: 1px solid #bfdbfe; white-space: nowrap; display: inline-flex; align-items: center; gap: 0.4rem; }
    .lte-card-desc { color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.6; font-size: 1rem; }
    
    .lte-info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 1.25rem; }
    .lte-info-box { background: var(--surface-2); border-radius: var(--radius); padding: 1.25rem; border: 1px solid var(--border); }
    .lte-info-title { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; color: var(--color-secondary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.4rem; }
    .lte-info-content { font-size: 0.95rem; color: var(--text); line-height: 1.5; }
    
    .lte-expert-box { background: #f0fdf4; border-left: 4px solid var(--color-success); padding: 1.25rem; border-radius: 0 var(--radius) var(--radius) 0; margin-top: 1rem; }
    .lte-expert-title { font-weight: 700; color: #166534; font-size: 0.9rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 0.4rem; }
    .lte-expert-content { font-style: italic; color: #15803d; line-height: 1.6; font-size: 0.95rem; }
    
    .lte-list { list-style-type: none; padding-left: 0; margin: 0; }
    .lte-list li { position: relative; padding-left: 1.5rem; margin-bottom: 0.6rem; font-size: 0.95rem; color: var(--text-muted); line-height: 1.5; }
    .lte-list li::before { content: "→"; position: absolute; left: 0; color: var(--color-primary); font-weight: bold; }
    
    .lte-constraint-list li::before { content: "•"; color: var(--color-danger); font-size: 1.2rem; line-height: 1.1; left: 0.2rem; }
    
    .lte-overview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .lte-overview-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; box-shadow: var(--shadow-sm); }
    .lte-overview-card h3 { font-size: 1.1rem; color: var(--text); margin-bottom: 1rem; border-bottom: 2px solid var(--surface-2); padding-bottom: 0.5rem; }
    
    /* Key/Value parameters list formatting */
    .lte-param-list { margin-top: 0.5rem; }
    .lte-param-item { margin-bottom: 0.5rem; font-size: 0.95rem; line-height: 1.5; }
    .lte-param-key { font-weight: 600; color: var(--text); background: var(--surface-2); padding: 0.1rem 0.4rem; border-radius: 4px; font-family: monospace; font-size: 0.85rem; }
    
    .lte-loading { text-align: center; padding: 4rem; color: var(--text-muted); font-size: 1.2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .lte-spinner { width: 40px; height: 40px; border: 4px solid var(--surface-2); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;

  async function render() {
    const appEl = document.getElementById('app');
    
    // Inject styles
    let styleEl = document.getElementById('lte-styles');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'lte-styles';
      styleEl.textContent = STYLES;
      document.head.appendChild(styleEl);
    }

    appEl.innerHTML = \`
      <div class="lte-container">
        <div class="lte-loading">
          <div class="lte-spinner"></div>
          <div>Loading 3GPP Specifications...</div>
        </div>
      </div>
    \`;

    try {
      const response = await fetch('assets/3gpp-lte.json');
      if (!response.ok) throw new Error('Failed to load JSON: ' + response.statusText);
      const data = await response.json();
      renderContent(appEl, data);
    } catch (err) {
      appEl.innerHTML = \`
        <div class="lte-container">
          <div class="card" style="border-left: 4px solid var(--color-danger);">
            <h3 style="color: var(--color-danger); margin-bottom: 0.5rem;">Error Loading Data</h3>
            <p>\${err.message}</p>
          </div>
        </div>
      \`;
    }
  }

  function renderContent(appEl, data) {
    const doc = data.document;
    
    let html = \`
      <div class="lte-container fade-in">
        <header class="lte-header">
          <h1 class="lte-title">📡 \${doc.title}</h1>
          <p class="lte-subtitle">\${doc.expert_overview}</p>
          <div class="lte-ref-container">
            \${doc.standard_references.map(ref => \`<span class="lte-ref-badge">\${ref}</span>\`).join('')}
          </div>
        </header>

        <div class="lte-tab-container">
          <button class="lte-tab active" data-target="overview">Overview</button>
          <button class="lte-tab" data-target="mac_rlc">MAC ↔ RLC (\${data.summary_interaction_count.mac_rlc})</button>
          <button class="lte-tab" data-target="mac_rrc">MAC ↔ RRC (\${data.summary_interaction_count.mac_rrc})</button>
          <button class="lte-tab" data-target="mac_phy">MAC ↔ PHY (\${data.summary_interaction_count.mac_phy})</button>
        </div>

        <div id="lte-sections">
          <!-- Overview Section -->
          <div class="lte-section-content active" id="sec-overview">
            <div class="lte-overview-grid">
              <div class="lte-overview-card" style="grid-column: 1 / -1;">
                <h3>🧠 Expert Architectural Assessment</h3>
                <p style="color: var(--text-muted); line-height: 1.6; font-size: 1.05rem; margin-bottom: 1.5rem;">
                  \${data.overall_expert_commentary.architecture_assessment}
                </p>
                <div class="lte-info-grid">
                  <div class="lte-info-box">
                    <div class="lte-info-title">✨ Key Design Principles</div>
                    <ul class="lte-list">
                      \${data.overall_expert_commentary.key_design_principles.map(p => \`<li>\${p}</li>\`).join('')}
                    </ul>
                  </div>
                  <div class="lte-info-box" style="background: #fef2f2; border-color: #fecaca;">
                    <div class="lte-info-title" style="color: #b91c1c;">⚠️ Known Limitations</div>
                    <ul class="lte-list lte-constraint-list">
                      \${data.overall_expert_commentary.known_limitations.map(l => \`<li>\${l}</li>\`).join('')}
                    </ul>
                  </div>
                </div>
                <div class="lte-expert-box" style="margin-top: 0; background: #f8fafc; border-left-color: #3b82f6;">
                  <div class="lte-expert-title" style="color: #1d4ed8;">🚀 Comparison to 5G NR</div>
                  <div class="lte-expert-content" style="color: #1e40af;">\${data.overall_expert_commentary.comparison_to_nr}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- MAC-RLC Section -->
          \${renderInteractionSection('mac_rlc', data.mac_rlc_interactions)}

          <!-- MAC-RRC Section -->
          \${renderInteractionSection('mac_rrc', data.mac_rrc_interactions)}

          <!-- MAC-PHY Section -->
          \${renderInteractionSection('mac_phy', data.mac_phy_interactions)}
        </div>
      </div>
    \`;

    appEl.innerHTML = html;

    // Attach tab listeners
    const tabs = appEl.querySelectorAll('.lte-tab');
    const sections = appEl.querySelectorAll('.lte-section-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const targetId = 'sec-' + tab.dataset.target;
        sections.forEach(sec => {
          if (sec.id === targetId) {
            sec.classList.add('active');
          } else {
            sec.classList.remove('active');
          }
        });
      });
    });
  }

  function renderInteractionSection(id, sectionData) {
    return \`
      <div class="lte-section-content" id="sec-\${id}">
        <div style="margin-bottom: 2rem;">
          <p style="font-size: 1.1rem; color: var(--text); line-height: 1.6;">\${sectionData.description}</p>
          <div style="margin-top: 0.5rem; display: inline-block; background: var(--surface-2); padding: 0.4rem 1rem; border-radius: var(--radius); font-size: 0.9rem; color: var(--text-muted); font-weight: 500;">
            \${sectionData.direction_note}
          </div>
        </div>
        \${sectionData.primitives.map(renderPrimitive).join('')}
      </div>
    \`;
  }

  function renderPrimitive(prim) {
    // Helper to format parameter lists
    const formatParams = (params) => {
      if (!params) return '';
      if (Array.isArray(params)) {
        if (typeof params[0] === 'string') {
          return \`<ul class="lte-list lte-param-list">
            \${params.map(p => {
              const parts = p.split(':');
              if (parts.length > 1) {
                return \`<li class="lte-param-item"><span class="lte-param-key">\${parts[0].trim()}</span>: \${parts.slice(1).join(':').trim()}</li>\`;
              }
              return \`<li class="lte-param-item">\${p}</li>\`;
            }).join('')}
          </ul>\`;
        } else if (typeof params[0] === 'object' && params[0].parameter) {
          // Object format
          return \`<ul class="lte-list lte-param-list">
            \${params.map(p => \`<li class="lte-param-item"><span class="lte-param-key">\${p.parameter}</span>: \${p.meaning}</li>\`).join('')}
          </ul>\`;
        }
      }
      return String(params);
    };

    return \`
      <div class="lte-card">
        <div class="lte-primitive-name">
          <span>\${prim.primitive_name}</span>
          \${prim.direction ? \`<span class="lte-direction-badge">🔁 \${prim.direction}</span>\` : ''}
        </div>
        
        \${prim.also_known_as ? \`<div style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 1rem; font-style: italic;">AKA: \${prim.also_known_as}</div>\` : ''}
        
        <div class="lte-card-desc">\${prim.description}</div>
        
        <div class="lte-info-grid">
          <div class="lte-info-box">
            <div class="lte-info-title">📚 Specification</div>
            <div class="lte-info-content" style="font-family: monospace; font-size: 0.9rem;">\${prim.spec_reference || 'N/A'}</div>
          </div>
          
          \${prim.logical_channel_involved ? \`
            <div class="lte-info-box">
              <div class="lte-info-title">🛤️ Logical Channels</div>
              <div class="lte-info-content">\${prim.logical_channel_involved}</div>
            </div>
          \` : ''}
          
          \${prim.rrc_message_carrier ? \`
            <div class="lte-info-box">
              <div class="lte-info-title">✉️ RRC Carrier</div>
              <div class="lte-info-content">\${prim.rrc_message_carrier}</div>
            </div>
          \` : ''}
        </div>

        \${prim.parameters || prim.key_parameters ? \`
          <div class="lte-info-box" style="margin-bottom: 1rem; background: var(--surface);">
            <div class="lte-info-title">⚙️ Parameters</div>
            \${formatParams(prim.parameters || prim.key_parameters)}
          </div>
        \` : ''}

        \${prim.constraints && prim.constraints.length > 0 ? \`
          <div style="margin-bottom: 1rem; margin-top: 1.5rem;">
            <div class="lte-info-title" style="color: var(--color-danger);">⚠️ Constraints & Behaviors</div>
            <ul class="lte-list lte-constraint-list">
              \${prim.constraints.map(c => \`<li>\${c}</li>\`).join('')}
            </ul>
          </div>
        \` : ''}

        \${prim.expert_comment ? \`
          <div class="lte-expert-box">
            <div class="lte-expert-title">💡 Expert Comment</div>
            <div class="lte-expert-content">\${prim.expert_comment}</div>
          </div>
        \` : ''}
      </div>
    \`;
  }

})();
