/**
 * DATA SCIENCE DIGITAL LIBRARY PORTAL - Application Controller
 * High-performance Vanilla JavaScript • Pyodide Python 3.12 WebAssembly
 * Student: CHOWDA ANAND • Institution: MOHAN BABU UNIVERSITY
 */

// Application State
const AppState = {
  activeSection: 'home',
  pyodide: null,
  pyodideLoading: false,
  pyodideReady: false,
  profile: {
    id: 1,
    full_name: 'CHOWDA ANAND',
    college: 'MOHAN BABU UNIVERSITY',
    branch: 'CSE - Data Science',
    academic_year: '3rd Year',
    project_title: 'DATA SCIENCE DIGITAL LIBRARY PORTAL',
    roll_number: '',
    email: '',
    section: '',
    skills: 'Python, NumPy, Pandas, Matplotlib, Seaborn, Scikit-learn, SQL, Data Analysis',
    github_url: '',
    linkedin_url: '',
    avatar_path: 'assets/profile.jpg'
  },
  experiments: [],
  tools: [],
  modules: [],
  resources: [],
  stats: {
    total: 10,
    completed: 0,
    pending: 10,
    running: 0,
    failed: 0,
    percentage: 0,
    recent_activity: []
  },
  currentWorkspaceExp: null,
  filterStatus: 'all',
  selectedUploadFile: null,
  isExecuting: false,
  edaData: null,
  edaCurrentFile: 'student_performance.csv',
  currentModuleForReader: null
};

// ==============================================================================
// INITIALIZATION
// ==============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  if (window.SupabaseService) window.SupabaseService.init();

  setupKeyboardShortcuts();

  await loadProfile();
  await loadExperiments();
  await loadStats();
  await loadTools();
  await loadModules();
  await loadResources();

  initPyodideEngine();

  // Load first sample dataset into EDA on page load
  loadSelectedSampleDataset('student_performance.csv');

  // Set initial section from hash
  const hash = window.location.hash.replace('#', '').trim();
  const validSections = ['home','modules','labs','csvstudio','resources','tools','sandbox','ai','profile'];
  showSection(validSections.includes(hash) ? hash : 'home', document.querySelector(`[data-section="${validSections.includes(hash) ? hash : 'home'}"]`));
});

// ==============================================================================
// PYODIDE PYTHON WEBASSEMBLY RUNTIME
// ==============================================================================
async function initPyodideEngine() {
  const badgeText = document.getElementById('system-status-text');
  const pulseDot = document.getElementById('status-pulse-dot');

  if (typeof loadPyodide === 'undefined') {
    if (badgeText) badgeText.textContent = 'Server Python (Local)';
    console.warn('[PYTHON] Pyodide script not loaded, using local server Python.');
    return;
  }

  try {
    AppState.pyodideLoading = true;
    if (badgeText) badgeText.textContent = 'Loading Pyodide Wasm...';
    if (pulseDot) pulseDot.style.backgroundColor = 'var(--color-warning)';

    AppState.pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
    });

    // Pre-load standard scientific computation packages
    if (badgeText) badgeText.textContent = 'Loading NumPy & Pandas...';
    await AppState.pyodide.loadPackage(['numpy', 'pandas', 'matplotlib']);

    AppState.pyodideReady = true;
    AppState.pyodideLoading = false;

    if (badgeText) badgeText.textContent = 'Pyodide Python 3.12 (Ready)';
    if (pulseDot) {
      pulseDot.style.backgroundColor = 'var(--color-success)';
      pulseDot.style.boxShadow = '0 0 8px var(--color-success)';
    }

    const wsRuntime = document.getElementById('ws-runtime-msg');
    if (wsRuntime) {
      wsRuntime.textContent = 'Pyodide WebAssembly Python 3.12 Ready (NumPy, Pandas, Matplotlib loaded)';
    }

    console.log('[PYODIDE] Python 3.12 runtime initialized successfully.');
  } catch (err) {
    AppState.pyodideLoading = false;
    AppState.pyodideReady = false;
    console.warn('[PYODIDE] Failed to load Pyodide WebAssembly, falling back to local Python server:', err);
    if (badgeText) badgeText.textContent = 'Server Python (Active)';
    if (pulseDot) pulseDot.style.backgroundColor = 'var(--primary-indigo)';
  }
}

// ==============================================================================
// NAVIGATION (TOP-NAV STYLE, matching reference site)
// ==============================================================================
function showSection(sectionId, btnEl) {
  AppState.activeSection = sectionId;
  window.location.hash = sectionId;

  // Deactivate all sections
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active-section'));
  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active-section');

  // Update nav-link active state
  document.querySelectorAll('.nav-link').forEach(btn => btn.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  else {
    const matchBtn = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
    if (matchBtn) matchBtn.classList.add('active');
  }

  // Close mobile menu if open
  const nav = document.getElementById('topnav');
  if (nav) nav.classList.remove('open');

  // Animate home stats when navigating to home
  if (sectionId === 'home') animateHomeStats();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
  const nav = document.getElementById('topnav');
  if (nav) nav.classList.toggle('open');
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      showSection('labs', document.querySelector('[data-section=labs]'));
      setTimeout(() => { const inp = document.getElementById('exp-search-input'); if (inp) { inp.focus(); inp.select(); } }, 120);
    }
    if (e.key === 'Escape') closeAllModals();
  });
}

function focusExperimentSearch() {
  showSection('labs', document.querySelector('[data-section=labs]'));
  setTimeout(() => { const inp = document.getElementById('exp-search-input'); if (inp) { inp.focus(); inp.select(); } }, 120);
}

// ==============================================================================
// DATA FETCHING & RENDERING
// ==============================================================================

// 1. Profile
async function loadProfile() {
  try {
    let profileData = null;
    if (window.SupabaseService && window.SupabaseService.isConfigured) {
      const res = await window.SupabaseService.getProfile();
      if (res && res.data) profileData = res.data;
    }

    if (!profileData) {
      const res = await fetch('/api/profile');
      const json = await res.json();
      if (json.success && json.data) profileData = json.data;
    }

    if (profileData) {
      AppState.profile = { ...AppState.profile, ...profileData };
      renderProfileUI();
    }
  } catch (err) {
    console.warn('[PROFILE] Failed to load profile:', err);
    renderProfileUI();
  }
}

function renderProfileUI() {
  const p = AppState.profile;

  // Header and Sidebar elements
  const welcomeName = document.getElementById('welcome-student-name');
  if (welcomeName) {
    // First name or full name
    const firstName = p.full_name.split(' ')[0] || 'Anand';
    welcomeName.textContent = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  }

  const sidebarName = document.getElementById('sidebar-user-name');
  if (sidebarName) sidebarName.textContent = p.full_name;

  // Profile Page displays
  const profFullName = document.getElementById('profile-full-name');
  if (profFullName) profFullName.textContent = p.full_name;

  const profCollege = document.getElementById('profile-college-name');
  if (profCollege) profCollege.textContent = p.college;

  const profBranch = document.getElementById('profile-branch-name');
  if (profBranch) profBranch.textContent = `${p.branch} • ${p.academic_year}`;

  const dispFullName = document.getElementById('disp-full-name');
  if (dispFullName) dispFullName.textContent = p.full_name;

  const dispCollege = document.getElementById('disp-college');
  if (dispCollege) dispCollege.textContent = p.college;

  const dispBranch = document.getElementById('disp-branch');
  if (dispBranch) dispBranch.textContent = p.branch;

  const dispYear = document.getElementById('disp-year');
  if (dispYear) dispYear.textContent = p.academic_year;

  const dispProject = document.getElementById('disp-project');
  if (dispProject) dispProject.textContent = p.project_title;

  // Unsupplied fields handling
  const dispRoll = document.getElementById('disp-roll');
  if (dispRoll) {
    if (p.roll_number && p.roll_number.trim()) {
      dispRoll.textContent = p.roll_number;
      dispRoll.classList.remove('unsupplied');
    } else {
      dispRoll.textContent = 'Not supplied yet';
      dispRoll.classList.add('unsupplied');
    }
  }

  const dispEmail = document.getElementById('disp-email');
  if (dispEmail) {
    if (p.email && p.email.trim()) {
      dispEmail.textContent = p.email;
      dispEmail.classList.remove('unsupplied');
    } else {
      dispEmail.textContent = 'Not supplied yet';
      dispEmail.classList.add('unsupplied');
    }
  }

  const dispSection = document.getElementById('disp-section');
  if (dispSection) {
    if (p.section && p.section.trim()) {
      dispSection.textContent = p.section;
      dispSection.classList.remove('unsupplied');
    } else {
      dispSection.textContent = 'Not supplied yet';
      dispSection.classList.add('unsupplied');
    }
  }

  // Social Links
  const ghLink = document.getElementById('profile-github-link');
  if (ghLink) {
    if (p.github_url && p.github_url.trim()) {
      ghLink.href = p.github_url;
      ghLink.style.display = 'inline-flex';
    } else {
      ghLink.href = '#';
      ghLink.style.display = 'none';
    }
  }

  const liLink = document.getElementById('profile-linkedin-link');
  if (liLink) {
    if (p.linkedin_url && p.linkedin_url.trim()) {
      liLink.href = p.linkedin_url;
      liLink.style.display = 'inline-flex';
    } else {
      liLink.href = '#';
      liLink.style.display = 'none';
    }
  }

  // Skills tags
  const skillsContainer = document.getElementById('profile-skills-tags');
  if (skillsContainer) {
    skillsContainer.innerHTML = '';
    const skillsList = p.skills ? p.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
    skillsList.forEach(s => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.textContent = s;
      skillsContainer.appendChild(tag);
    });
  }

  // Avatar photos — new HTML IDs
  const avatarPath = p.avatar_path || 'assets/profile.jpg';
  ['topbar-avatar', 'id-card-photo', 'profile-img-display', 'modal-photo-preview'].forEach(id => {
    const img = document.getElementById(id);
    if (img) img.src = avatarPath;
  });

  // Topbar user details
  const topbarName = document.getElementById('topbar-name');
  if (topbarName) topbarName.textContent = p.full_name;
  const topbarRoll = document.getElementById('topbar-roll');
  if (topbarRoll) topbarRoll.textContent = p.roll_number ? `ID: ${p.roll_number}` : 'MBU · 3rd Year';

  // ID Card
  const idName = document.getElementById('id-card-name');
  if (idName) idName.textContent = p.full_name;
  const idRoll = document.getElementById('id-card-roll');
  if (idRoll) idRoll.textContent = p.academic_year;

  // GitHub/LinkedIn on hero
  const heroGH = document.getElementById('hero-github-link');
  if (heroGH) {
    if (p.github_url && p.github_url.trim()) {
      heroGH.href = p.github_url;
      heroGH.style.display = 'inline-flex';
    } else {
      heroGH.style.display = 'none';
    }
  }

  // Metric GitHub
  const metricGHStatus = document.getElementById('metric-github-status');
  const metricGHLink = document.getElementById('metric-github-link');
  const metricGHPlaceholder = document.getElementById('metric-github-placeholder');
  if (p.github_url && p.github_url.trim()) {
    if (metricGHStatus) metricGHStatus.textContent = 'Linked';
    if (metricGHLink) { metricGHLink.href = p.github_url; metricGHLink.style.display = 'inline'; }
    if (metricGHPlaceholder) metricGHPlaceholder.style.display = 'none';
  } else {
    if (metricGHStatus) metricGHStatus.textContent = 'Not Set';
    if (metricGHLink) metricGHLink.style.display = 'none';
    if (metricGHPlaceholder) metricGHPlaceholder.style.display = 'inline';
  }
}

// 2. Experiments
async function loadExperiments() {
  try {
    const res = await fetch('/api/experiments');
    const json = await res.json();
    if (json.success && json.data) {
      AppState.experiments = json.data;
      renderExperimentsList();
      renderHomeCurriculumLedger();
    }
  } catch (err) {
    console.error('[EXPERIMENTS] Error loading experiments:', err);
  }
}

function renderExperimentsList() {
  const container = document.getElementById('experiments-grid');
  if (!container) return;

  container.innerHTML = '';
  const filter = AppState.filterStatus;
  const filtered = AppState.experiments.filter(exp => {
    if (filter === 'all') return true;
    return exp.status.toLowerCase() === filter.toLowerCase();
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🔬</div>
        <div class="empty-state-title">No experiments match filter '${filter}'</div>
        <div class="empty-state-text">Try selecting 'All (10)' or clear your search input.</div>
      </div>
    `;
    return;
  }

  filtered.forEach(exp => {
    const card = document.createElement('div');
    card.className = 'experiment-card';
    card.onclick = () => openExperimentWorkspace(exp.code);

    const statusClass = exp.status.toLowerCase().replace(/\s+/g, '-');
    const statusIcon = exp.status === 'Completed' ? '✅' : exp.status === 'Running' ? '⏳' : exp.status === 'Failed' ? '❌' : '⚪';

    card.innerHTML = `
      <div class="exp-card-header">
        <span class="exp-code">${exp.code}</span>
        <span class="status-badge ${statusClass}">${statusIcon} ${exp.status}</span>
      </div>
      <h4 class="exp-card-title">${exp.title}</h4>
      <p class="exp-card-desc">${exp.objective}</p>
      <div class="exp-card-meta">
        <span class="exp-tools-tag">🛠️ ${exp.required_libraries}</span>
        <button class="btn-sm primary" onclick="event.stopPropagation(); openExperimentWorkspace('${exp.code}')">
          Open Workspace →
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderHomeCurriculumLedger() {
  const container = document.getElementById('home-ledger-list');
  if (!container) return;
  container.innerHTML = '';

  AppState.experiments.forEach(exp => {
    const item = document.createElement('div');
    item.className = 'ledger-item';
    item.onclick = () => {
      showSection('labs', document.querySelector('[data-section=labs]'));
      setTimeout(() => openExperimentWorkspace(exp.code), 80);
    };
    const isDone = exp.status === 'Completed';
    const statusIcon = isDone ? '✅' : exp.status === 'Running' ? '⏳' : '⚪';
    item.innerHTML = `
      <div class="ledger-item-left">
        <span class="ledger-code">${exp.code}</span>
        <div>
          <div class="ledger-title">${exp.title}</div>
          <div class="ledger-libs">${exp.required_libraries}</div>
        </div>
      </div>
      <span class="status-badge ${exp.status.toLowerCase().replace(/\s+/g,'\u002D')}">${statusIcon} ${exp.status}</span>
    `;
    container.appendChild(item);
  });
}

// 3. Stats
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const json = await res.json();
    if (json.success && json.data) {
      AppState.stats = json.data;
      animateHomeStats();
      renderRecentActivity();
    }
  } catch (err) {
    console.error('[STATS] Error loading stats:', err);
  }
}

function animateHomeStats() {
  const s = AppState.stats;
  // New metric IDs
  const setEl = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
  animateCountUp('metric-total', s.total || 10);
  animateCountUp('metric-completed', s.completed || 0);
  const pct = s.percentage || 0;
  const pctEl = document.getElementById('metric-percent');
  if (pctEl) {
    let start = 0;
    const dur = 650;
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min((now - t0) / dur, 1);
      const v = Math.round(start + (pct - start) * (1 - Math.pow(1 - p, 3)));
      pctEl.textContent = v + '%';
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  // Legacy IDs (won't error if absent)
  animateCountUp('stat-total-val', s.total || 10);
  animateCountUp('stat-completed-val', s.completed || 0);
  animateCountUp('stat-pending-val', s.pending || 0);
  animateCountUp('stat-percent-val', pct);
  const bar = document.getElementById('stat-progress-bar');
  if (bar) bar.style.width = `${pct}%`;
}

function animateCountUp(elementId, targetValue) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const duration = 650;
  const start = 0;
  const startTime = performance.now();

  function updateCount(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out curve
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentVal = Math.round(start + (targetValue - start) * easeOut);
    el.textContent = currentVal;

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      el.textContent = targetValue;
    }
  }

  requestAnimationFrame(updateCount);
}

function renderRecentActivity() {
  // No longer a separate container in new layout; stats are in metric grid
  // Refresh ledger which shows all experiments
  renderHomeCurriculumLedger();
}

// ==============================================================================
// MODULES
// ==============================================================================
async function loadModules() {
  try {
    const res = await fetch('/api/modules');
    const json = await res.json();
    if (json.success && json.data) {
      AppState.modules = json.data;
      renderModules();
    }
  } catch (err) {
    console.warn('[MODULES] Error loading modules:', err);
    renderModules(); // render built-in fallback
  }
}

const BUILTIN_MODULES = [
  { id:1, number:'01', kicker:'FOUNDATIONS', title:'Introduction to Data Science & Python', description:'Data science lifecycle, Python fundamentals, collections and scientific tools.', symbol_class:'green', symbol_icon:'fa-seedling', notes: 'Module 1 covers data science fundamentals, the data science lifecycle, Python programming basics, data types, collections (lists, dicts, tuples), NumPy arrays, and an introduction to Pandas DataFrames.' },
  { id:2, number:'02', kicker:'DATA PREPARATION', title:'Data Collection & Preprocessing', description:'Data sources, missing values, duplicates, transformations and leakage.', symbol_class:'orange', symbol_icon:'fa-filter', notes: 'Module 2 covers data collection methods, handling missing values (imputation strategies), detecting and removing duplicates, data type conversions, feature engineering basics, and preventing data leakage.' },
  { id:3, number:'03', kicker:'EXPLORATION', title:'EDA & Visualization', description:'Summaries, distributions, outliers, chart selection and insight communication.', symbol_class:'blue-bg', symbol_icon:'fa-chart-column', notes: 'Module 3 covers Exploratory Data Analysis techniques: five-number summary, box plots, histograms, scatter plots, correlation heatmaps, outlier detection using IQR and Z-score, and effective data storytelling.' },
  { id:4, number:'04', kicker:'MODELING', title:'Statistics & Machine Learning', description:'Probability, learning types, validation, overfitting and evaluation metrics.', symbol_class:'lilac-bg', symbol_icon:'fa-brain', notes: 'Module 4 covers probability theory, Bayes theorem, supervised vs unsupervised learning, bias-variance tradeoff, cross-validation, train-test split, overfitting, regularization (L1/L2), and evaluation metrics (Accuracy, Precision, Recall, F1, AUC-ROC).' },
  { id:5, number:'05', kicker:'APPLICATIONS', title:'Advanced Data Science & Applications', description:'Ensembles, deep learning, time series, deployment, MLOps and responsible use.', symbol_class:'pink-bg', symbol_icon:'fa-rocket', notes: 'Module 5 covers ensemble methods (Random Forests, Gradient Boosting, XGBoost), neural networks and deep learning basics, time series analysis (ARIMA, SARIMA), model deployment via Flask/FastAPI, MLOps pipelines, and responsible AI/data ethics.' }
];

function renderModules() {
  const container = document.getElementById('modules-container');
  if (!container) return;
  container.innerHTML = '';

  const mods = (AppState.modules && AppState.modules.length > 0) ? AppState.modules : BUILTIN_MODULES;

  mods.forEach((mod, i) => {
    const bm = BUILTIN_MODULES[i] || {};
    const symbolClass = mod.symbol_class || bm.symbol_class || 'green';
    const symbolIcon = mod.symbol_icon || bm.symbol_icon || 'fa-book';
    const kicker = mod.kicker || bm.kicker || 'MODULE';
    const num = String(i + 1).padStart(2, '0');

    const card = document.createElement('article');
    card.className = 'module-card';
    card.innerHTML = `
      <div class="module-top">
        <span class="module-number">${num}</span>
        <span class="module-symbol ${symbolClass}"><i class="fa-solid ${symbolIcon}"></i></span>
      </div>
      <span class="module-kicker">${kicker}</span>
      <h3>${mod.title}</h3>
      <p>${mod.description || mod.notes_preview || bm.description || ''}</p>
      <div class="file-actions">
        <a href="#" onclick="event.preventDefault(); openModuleReader(${i})">Read online <i class="fa-solid fa-book-open"></i></a>
        <a href="#" onclick="event.preventDefault(); downloadModuleNotes(${i})">Download <i class="fa-solid fa-arrow-down"></i></a>
      </div>
    `;
    container.appendChild(card);
  });

  // Add "Up next" placeholder card
  const next = document.createElement('article');
  next.className = 'next-card';
  next.innerHTML = `
    <span class="next-icon"><i class="fa-solid fa-compass"></i></span>
    <span class="eyebrow" style="border:none;padding:0;font-size:0.65rem;">UP NEXT</span>
    <h3>What I've learned</h3>
    <p>This section will track completed topics, practical skills and progress.</p>
    <button class="quiet-btn" disabled>Coming later</button>
  `;
  container.appendChild(next);
}

function openModuleReader(index) {
  const mods = (AppState.modules && AppState.modules.length > 0) ? AppState.modules : BUILTIN_MODULES;
  const bm = BUILTIN_MODULES[index];
  const mod = mods[index] || bm;
  AppState.currentModuleForReader = { mod, bm, index };

  const modal = document.getElementById('module-reader-modal');
  const kicker = document.getElementById('reader-modal-kicker');
  const title = document.getElementById('reader-modal-title');
  const content = document.getElementById('reader-modal-content');

  if (kicker) kicker.textContent = bm ? bm.kicker : 'MODULE';
  if (title) title.textContent = mod.title;
  if (content) {
    const notes = mod.notes || (bm && bm.notes) || mod.notes_full || 'Notes for this module are being prepared. Please check back soon.';
    content.innerHTML = notes.split('\n').map(line => line.trim() ? `<p style="margin-bottom:0.75rem;">${line}</p>` : '').join('');
  }
  if (modal) modal.classList.add('open');
}

function closeModuleReaderModal() {
  const modal = document.getElementById('module-reader-modal');
  if (modal) modal.classList.remove('open');
}

function downloadModuleNotes(index) {
  const mods = (AppState.modules && AppState.modules.length > 0) ? AppState.modules : BUILTIN_MODULES;
  const bm = BUILTIN_MODULES[index];
  const mod = mods[index] || bm;
  const notes = mod.notes || (bm && bm.notes) || 'Module notes not available.';
  const blob = new Blob([notes], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Module_${String(index+1).padStart(2,'0')}_Notes.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCurrentModuleNotes() {
  if (!AppState.currentModuleForReader) return;
  downloadModuleNotes(AppState.currentModuleForReader.index);
}

// 4. Tools Library
async function loadTools() {
  try {
    const res = await fetch('/api/tools');
    const json = await res.json();
    if (json.success && json.data) {
      AppState.tools = json.data;
      renderToolsList();
    }
  } catch (err) {
    console.error('[TOOLS] Error loading tools:', err);
  }
}

function renderToolsList(filteredTools = null) {
  const container = document.getElementById('tools-grid');
  if (!container) return;

  container.innerHTML = '';
  const tools = filteredTools || AppState.tools;

  if (tools.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">⚙️</div>
        <div class="empty-state-title">No tools match your search</div>
      </div>
    `;
    return;
  }

  tools.forEach(tool => {
    const card = document.createElement('div');
    card.className = 'tool-card';

    const chips = (tool.experiments || []).map(code => 
      `<a href="#" class="exp-chip" onclick="event.preventDefault(); showSection('labs', document.querySelector('[data-section=labs]')); setTimeout(()=>openExperimentWorkspace('${code}'),80)">${code}</a>`
    ).join(' ');

    card.innerHTML = `
      <div class="tool-header">
        <div class="tool-icon-box">${tool.icon || '🛠️'}</div>
        <span class="tool-category-badge">${tool.category}</span>
      </div>
      <h3 class="tool-name">${tool.name}</h3>
      <p class="tool-purpose">${tool.purpose}</p>
      <div class="tool-footer">
        <div class="tool-exp-chips">${chips}</div>
        <a href="${tool.doc_url}" target="_blank" rel="noopener" class="btn-sm" title="Official Documentation">
          Docs ↗
        </a>
      </div>
    `;
    container.appendChild(card);
  });
}

function filterToolsList(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) { renderToolsList(); return; }
  const filtered = AppState.tools.filter(t => 
    t.name.toLowerCase().includes(q) ||
    t.category.toLowerCase().includes(q) ||
    t.purpose.toLowerCase().includes(q)
  );
  renderToolsList(filtered);
}

// ==============================================================================
// RESOURCES
// ==============================================================================
async function loadResources() {
  try {
    const res = await fetch('/api/resources');
    const json = await res.json();
    if (json.success && json.data) {
      AppState.resources = json.data;
      renderResources();
    }
  } catch (err) {
    console.warn('[RESOURCES] Error loading resources:', err);
    renderResources(); // will render fallback
  }
}

const BUILTIN_RESOURCES = [
  { id:1, icon:'📘', category:'TEXTBOOK', name:'Introduction to Data Science (MIT OCW)', description:'MIT OpenCourseWare introductory data science curriculum covering Python, statistics, and ML fundamentals.', url:'https://ocw.mit.edu/courses/6-0002-introduction-to-computational-thinking-and-data-science-fall-2016/' },
  { id:2, icon:'📗', category:'REFERENCE', name:'Python Data Science Handbook', description:'Jake VanderPlas comprehensive guide to NumPy, Pandas, Matplotlib, and Scikit-Learn with interactive Jupyter notebooks.', url:'https://jakevdp.github.io/PythonDataScienceHandbook/' },
  { id:3, icon:'📊', category:'CHEATSHEET', name:'Pandas Cheat Sheet', description:'Official Pandas quick reference card covering DataFrame operations, indexing, merging, grouping, and pivoting.', url:'https://pandas.pydata.org/Pandas_Cheat_Sheet.pdf' },
  { id:4, icon:'🤖', category:'CHEATSHEET', name:'Scikit-Learn Cheat Sheet', description:'Machine learning algorithm selection guide and Scikit-Learn API reference for classification, regression, and clustering.', url:'https://scikit-learn.org/stable/tutorial/machine_learning_map/' },
  { id:5, icon:'📈', category:'VISUALIZATION', name:'Matplotlib Gallery', description:'Official gallery of 400+ Matplotlib plot examples with full source code for charts, plots, and scientific visualizations.', url:'https://matplotlib.org/stable/gallery/' },
  { id:6, icon:'🗃️', category:'DATASET', name:'UCI Machine Learning Repository', description:'Classic machine learning datasets repository. Iris, Wine, Boston Housing, Heart Disease and 600+ more academic benchmark datasets.', url:'https://archive.ics.uci.edu/ml/index.php' },
];

function renderResources() {
  const container = document.getElementById('resources-grid');
  if (!container) return;
  container.innerHTML = '';

  const resources = (AppState.resources && AppState.resources.length > 0) ? AppState.resources : BUILTIN_RESOURCES;

  resources.forEach(r => {
    const card = document.createElement('div');
    card.className = 'resource-card';
    card.innerHTML = `
      <div class="resource-icon">${r.icon || '📄'}</div>
      <span class="resource-category">${r.category || 'RESOURCE'}</span>
      <div class="resource-name">${r.name}</div>
      <div class="resource-desc">${r.description || ''}</div>
      <a href="${r.url || '#'}" target="_blank" rel="noopener">
        <i class="fa-solid fa-arrow-up-right-from-square"></i> Open Resource ↗
      </a>
    `;
    container.appendChild(card);
  });
}

// ==============================================================================
// SEARCH AND FILTERS (LAB EXECUTIONS)
// ==============================================================================
function handleExpSearchInput(event) {
  if (event.key === 'Enter') {
    triggerCodeSearch();
    return;
  }
  // Title or keyword search in real-time
  const query = event.target.value.trim().toLowerCase();
  clearSearchFeedback();

  if (!query) {
    renderExperimentsList();
    return;
  }

  const matches = AppState.experiments.filter(e => 
    e.code.toLowerCase().includes(query) ||
    e.title.toLowerCase().includes(query) ||
    e.required_libraries.toLowerCase().includes(query)
  );

  renderCustomExperiments(matches);
}

function triggerCodeSearch() {
  const input = document.getElementById('exp-search-input');
  if (!input) return;
  const rawCode = input.value.trim().toUpperCase();

  if (!rawCode) {
    clearExpSearch();
    return;
  }

  // Exact matching for DS01 through DS10
  const found = AppState.experiments.find(e => e.code.toUpperCase() === rawCode);
  if (found) {
    clearSearchFeedback();
    openExperimentWorkspace(found.code);
  } else {
    // Check partial
    const partials = AppState.experiments.filter(e => 
      e.code.toUpperCase().includes(rawCode) || e.title.toUpperCase().includes(rawCode)
    );
    if (partials.length === 1) {
      clearSearchFeedback();
      openExperimentWorkspace(partials[0].code);
    } else if (partials.length > 1) {
      clearSearchFeedback();
      renderCustomExperiments(partials);
    } else {
      showSearchFeedback(`No experiment found matching "${rawCode}". Please enter a valid code (DS01 to DS10) or experiment title.`);
    }
  }
}

function showSearchFeedback(msg) {
  const banner = document.getElementById('search-feedback-banner');
  if (banner) {
    banner.textContent = msg;
    banner.style.display = 'block';
  }
}

function clearSearchFeedback() {
  const banner = document.getElementById('search-feedback-banner');
  if (banner) {
    banner.style.display = 'none';
    banner.textContent = '';
  }
}

function clearExpSearch() {
  const input = document.getElementById('exp-search-input');
  if (input) input.value = '';
  clearSearchFeedback();
  AppState.filterStatus = 'all';
  updateFilterPillActive('all');
  renderExperimentsList();
}

function filterExperiments(status) {
  AppState.filterStatus = status;
  updateFilterPillActive(status);
  renderExperimentsList();
}

function updateFilterPillActive(status) {
  document.querySelectorAll('.filter-pill').forEach(pill => {
    if (pill.getAttribute('data-filter') === status) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });
}

function renderCustomExperiments(list) {
  const container = document.getElementById('experiments-grid');
  if (!container) return;
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">No matching experiments found</div>
        <div class="empty-state-text">Please search for a code between DS01 and DS10.</div>
      </div>
    `;
    return;
  }

  list.forEach(exp => {
    const card = document.createElement('div');
    card.className = 'experiment-card';
    card.onclick = () => openExperimentWorkspace(exp.code);

    const statusClass = exp.status.toLowerCase().replace(/\s+/g, '-');
    const statusIcon = exp.status === 'Completed' ? '✅' : exp.status === 'Running' ? '⏳' : '⚪';

    card.innerHTML = `
      <div class="exp-card-header">
        <span class="exp-code">${exp.code}</span>
        <span class="status-badge ${statusClass}">${statusIcon} ${exp.status}</span>
      </div>
      <h4 class="exp-card-title">${exp.title}</h4>
      <p class="exp-card-desc">${exp.objective}</p>
      <div class="exp-card-meta">
        <span class="exp-tools-tag">🛠️ ${exp.required_libraries}</span>
        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); openExperimentWorkspace('${exp.code}')">
          Open Workspace &rarr;
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// ==============================================================================
// INDIVIDUAL EXPERIMENT WORKSPACE & REAL PYTHON EXECUTION
// ==============================================================================
function openExperimentWorkspace(expCode) {
  const exp = AppState.experiments.find(e => e.code.toUpperCase() === expCode.toUpperCase());
  if (!exp) return;

  AppState.currentWorkspaceExp = exp;
  const ws = document.getElementById('experiment-workspace');
  if (!ws) return;

  // Populate workspace UI elements
  document.getElementById('ws-exp-code').textContent = exp.code;
  document.getElementById('ws-exp-title').textContent = exp.title;
  document.getElementById('ws-exp-objective').textContent = exp.objective;
  document.getElementById('ws-exp-instructions').innerHTML = (exp.instructions || '').replace(/\\n/g, '<br>');

  const statusBadge = document.getElementById('ws-exp-status');
  if (statusBadge) {
    statusBadge.textContent = exp.status;
    statusBadge.className = `status-badge ${exp.status.toLowerCase().replace(/\s+/g, '-')}`;
  }

  const timeBadge = document.getElementById('ws-exp-time');
  if (timeBadge) {
    timeBadge.textContent = exp.last_run_at ? `Last run: ${exp.last_run_at}` : 'Not run yet';
  }

  // Populate Code Editor
  const editor = document.getElementById('ws-code-editor');
  if (editor) {
    editor.value = exp.starter_code || '# Write Python code here...';
  }

  // Clear output preview
  clearWorkspaceOutput();

  // Scroll to workspace
  ws.classList.add('open');
  ws.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeWorkspace() {
  const ws = document.getElementById('experiment-workspace');
  if (ws) ws.classList.remove('open');
  AppState.currentWorkspaceExp = null;
}

function resetCurrentStarterCode() {
  if (!AppState.currentWorkspaceExp) return;
  const editor = document.getElementById('ws-code-editor');
  if (editor) {
    editor.value = AppState.currentWorkspaceExp.starter_code || '';
    showToast('Starter code restored to original state.', 'info');
  }
}

function clearWorkspaceOutput() {
  const outBody = document.getElementById('ws-output-body');
  if (outBody) {
    outBody.innerHTML = '<div style="color:var(--text-muted); font-style:italic;">Click \'Run Code\' to execute this experiment...</div>';
  }
  const plotContainer = document.getElementById('ws-plot-container');
  if (plotContainer) plotContainer.style.display = 'none';

  const durationBadge = document.getElementById('ws-duration-badge');
  if (durationBadge) durationBadge.textContent = '0ms';
}

function continueRecentExperiment() {
  // Find first in-progress or completed or default to DS01
  const recent = AppState.experiments.find(e => e.status === 'Running' || e.status === 'Completed') || AppState.experiments[0];
  if (recent) {
    navigateTab('executions');
    openExperimentWorkspace(recent.code);
  }
}

// REAL PYTHON EXECUTION (Pyodide Wasm + Server Fallback)
async function executeCurrentExperiment() {
  if (!AppState.currentWorkspaceExp || AppState.isExecuting) return;

  const editor = document.getElementById('ws-code-editor');
  const code = editor ? editor.value : '';
  const outBody = document.getElementById('ws-output-body');
  const runBtn = document.getElementById('ws-run-btn');
  const spinner = document.getElementById('ws-run-spinner');
  const runIcon = document.getElementById('ws-run-icon');
  const runText = document.getElementById('ws-run-text');
  const durationBadge = document.getElementById('ws-duration-badge');
  const statusBadge = document.getElementById('ws-exp-status');
  const plotContainer = document.getElementById('ws-plot-container');
  const plotImg = document.getElementById('ws-plot-img');

  // Set running state
  AppState.isExecuting = true;
  if (runBtn) runBtn.disabled = true;
  if (spinner) spinner.style.display = 'inline-block';
  if (runIcon) runIcon.style.display = 'none';
  if (runText) runText.textContent = 'Executing...';
  if (statusBadge) {
    statusBadge.textContent = 'Running';
    statusBadge.className = 'status-badge running';
  }
  if (outBody) {
    outBody.innerHTML = '<div style="color:var(--secondary-indigo);">⚡ Executing Python program in Pyodide WebAssembly runtime...</div>';
  }
  if (plotContainer) plotContainer.style.display = 'none';

  const startTime = performance.now();
  let stdoutCaptured = '';
  let stderrCaptured = '';
  let exitCode = 0;
  let plotBase64 = null;

  try {
    // If Pyodide is loaded, execute client-side
    if (AppState.pyodideReady && AppState.pyodide) {
      // Setup stdout/stderr redirection in Python
      const runnerCode = `
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()

_user_code_err = None
try:
    # User Code Execution
    exec('''${code.replace(/\\/g, '\\\\').replace(/'''/g, "\\'\\'\\'")}''', globals())
except Exception as _e:
    import traceback
    _user_code_err = traceback.format_exc()

# Capture Matplotlib figure if generated
_plot_b64 = None
try:
    import matplotlib.pyplot as _plt
    if _plt.get_fignums():
        _buf = io.BytesIO()
        _plt.savefig(_buf, format='png', bbox_inches='tight', facecolor='#1B2440', edgecolor='none')
        _plt.close('all')
        _buf.seek(0)
        import base64
        _plot_b64 = base64.b64encode(_buf.read()).decode('ascii')
except Exception:
    pass

_stdout_result = sys.stdout.getvalue()
_stderr_result = sys.stderr.getvalue()
if _user_code_err:
    _stderr_result += "\\n" + _user_code_err
`;

      await AppState.pyodide.runPythonAsync(runnerCode);

      stdoutCaptured = AppState.pyodide.globals.get('_stdout_result') || '';
      stderrCaptured = AppState.pyodide.globals.get('_stderr_result') || '';
      plotBase64 = AppState.pyodide.globals.get('_plot_b64') || null;

      if (stderrCaptured && stderrCaptured.trim()) {
        exitCode = 1;
      }
    } else {
      // Fallback to local server /api/execute
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exp_id: AppState.currentWorkspaceExp.id,
          code: code
        })
      });
      const json = await res.json();
      stdoutCaptured = json.output || '';
      stderrCaptured = json.stderr || '';
      exitCode = json.exit_code || 0;
    }
  } catch (err) {
    exitCode = 1;
    stderrCaptured = `Runtime Execution Exception: ${err.message || String(err)}`;
  }

  const durationMs = Math.round(performance.now() - startTime);
  if (durationBadge) durationBadge.textContent = `${durationMs}ms`;

  const isSuccess = exitCode === 0;
  const finalStatus = isSuccess ? 'Completed' : 'Failed';

  // Render Output
  if (outBody) {
    outBody.innerHTML = '';
    if (stdoutCaptured) {
      const pre = document.createElement('div');
      pre.style.color = '#E2E8F0';
      pre.textContent = stdoutCaptured;
      outBody.appendChild(pre);
    }
    if (stderrCaptured) {
      const errPre = document.createElement('div');
      errPre.style.color = 'var(--color-error)';
      errPre.style.marginTop = '0.5rem';
      errPre.textContent = stderrCaptured;
      outBody.appendChild(errPre);
    }
    if (!stdoutCaptured && !stderrCaptured) {
      outBody.innerHTML = '<div style="color:var(--text-muted); font-style:italic;">Program completed with 0 output bytes written to stdout.</div>';
    }
  }

  // Render Matplotlib plot if captured
  if (plotBase64 && plotContainer && plotImg) {
    plotImg.src = `data:image/png;base64,${plotBase64}`;
    plotContainer.style.display = 'block';
  }

  // Update Status Badges
  if (statusBadge) {
    statusBadge.textContent = finalStatus;
    statusBadge.className = `status-badge ${finalStatus.toLowerCase()}`;
  }

  // Update Exp in State and sync with DB
  AppState.currentWorkspaceExp.status = finalStatus;
  const expIdx = AppState.experiments.findIndex(e => e.id === AppState.currentWorkspaceExp.id);
  if (expIdx !== -1) {
    AppState.experiments[expIdx].status = finalStatus;
    AppState.experiments[expIdx].last_run_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  // Save telemetry run to Backend
  await recordRunTelemetry({
    experiment_id: AppState.currentWorkspaceExp.id,
    experiment_code: AppState.currentWorkspaceExp.code,
    status: finalStatus,
    execution_duration_ms: durationMs,
    stdout: stdoutCaptured,
    stderr: stderrCaptured,
    exit_code: exitCode
  });

  // Re-enable Run Button
  AppState.isExecuting = false;
  if (runBtn) runBtn.disabled = false;
  if (spinner) spinner.style.display = 'none';
  if (runIcon) runIcon.style.display = 'inline';
  if (runText) runText.textContent = 'Run Code';

  // Refresh lists & counters
  renderExperimentsList();
  renderHomeCurriculumLedger();
  await loadStats();

  if (isSuccess) {
    showToast(`Experiment ${AppState.currentWorkspaceExp.code} executed successfully! (${durationMs}ms)`, 'success');
  } else {
    showToast(`Experiment ${AppState.currentWorkspaceExp.code} execution encountered errors.`, 'error');
  }
}

async function recordRunTelemetry(runData) {
  try {
    if (window.SupabaseService) {
      await window.SupabaseService.recordRun(runData);
    } else {
      await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(runData)
      });
    }
  } catch (err) {
    console.warn('[RUN] Failed to record run telemetry:', err);
  }
}

// ==============================================================================
// EXPERIMENT OUTPUT UPLOAD & STORAGE
// ==============================================================================
function openUploadOutputModal() {
  if (!AppState.currentWorkspaceExp) return;
  const modal = document.getElementById('upload-output-modal');
  const label = document.getElementById('upload-modal-exp-label');
  if (label) {
    label.textContent = `Experiment: ${AppState.currentWorkspaceExp.code} — ${AppState.currentWorkspaceExp.title}`;
  }
  AppState.selectedUploadFile = null;
  const nameLabel = document.getElementById('output-file-chosen-name');
  if (nameLabel) nameLabel.textContent = 'Max file size: 10MB';
  const fileInput = document.getElementById('output-file-input');
  if (fileInput) fileInput.value = '';

  if (modal) modal.classList.add('open');
}

function closeUploadOutputModal() {
  const modal = document.getElementById('upload-output-modal');
  if (modal) modal.classList.remove('open');
}

function handleOutputFileSelect(input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];

  // Validation: Size < 10MB
  if (file.size > 10 * 1024 * 1024) {
    showToast('File size exceeds 10MB limit.', 'error');
    input.value = '';
    return;
  }

  // Allowed types
  const allowed = ['.png', '.jpg', '.jpeg', '.csv', '.txt', '.pdf', '.svg'];
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!allowed.includes(ext)) {
    showToast(`Unsupported file extension "${ext}". Allowed: PNG, JPG, CSV, TXT, PDF, SVG`, 'error');
    input.value = '';
    return;
  }

  AppState.selectedUploadFile = file;
  const nameLabel = document.getElementById('output-file-chosen-name');
  if (nameLabel) {
    nameLabel.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    nameLabel.style.color = 'var(--secondary-indigo)';
  }
}

async function handleOutputUpload(event) {
  event.preventDefault();
  if (!AppState.currentWorkspaceExp) return;

  if (!AppState.selectedUploadFile) {
    showToast('Please select a file to upload.', 'error');
    return;
  }

  const submitBtn = document.getElementById('upload-output-submit-btn');
  const spinner = document.getElementById('upload-output-spinner');
  if (submitBtn) submitBtn.disabled = true;
  if (spinner) spinner.style.display = 'inline-block';

  try {
    const file = AppState.selectedUploadFile;
    const reader = new FileReader();

    reader.onload = async () => {
      const base64Data = reader.result;
      const payload = {
        file_name: file.name,
        file_content: base64Data,
        content_type: file.type || 'application/octet-stream',
        file_size: file.size
      };

      const res = await fetch(`/api/upload_output/${AppState.currentWorkspaceExp.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();

      if (json.success) {
        showToast(`Output artifact "${file.name}" saved securely.`, 'success');
        closeUploadOutputModal();
        // Update local experiment status
        AppState.currentWorkspaceExp.status = 'Completed';
        const expIdx = AppState.experiments.findIndex(e => e.id === AppState.currentWorkspaceExp.id);
        if (expIdx !== -1) AppState.experiments[expIdx].status = 'Completed';
        renderExperimentsList();
        renderHomeCurriculumLedger();
        await loadStats();
      } else {
        showToast(json.error || 'Failed to save output artifact.', 'error');
      }

      if (submitBtn) submitBtn.disabled = false;
      if (spinner) spinner.style.display = 'none';
    };

    reader.readAsDataURL(file);
  } catch (err) {
    showToast(`Upload error: ${err.message}`, 'error');
    if (submitBtn) submitBtn.disabled = false;
    if (spinner) spinner.style.display = 'none';
  }
}

async function openSavedOutputsModal() {
  if (!AppState.currentWorkspaceExp) return;
  const modal = document.getElementById('saved-outputs-modal');
  const title = document.getElementById('saved-outputs-title');
  const listContainer = document.getElementById('saved-outputs-list');
  const previewBox = document.getElementById('file-preview-box');

  if (title) title.textContent = `Saved Outputs & Artifacts — ${AppState.currentWorkspaceExp.code}`;
  if (previewBox) previewBox.style.display = 'none';
  if (listContainer) listContainer.innerHTML = '<div style="color:var(--text-muted);">Loading outputs...</div>';
  if (modal) modal.classList.add('open');

  try {
    const res = await fetch(`/api/outputs/${AppState.currentWorkspaceExp.id}`);
    const json = await res.json();
    const outputs = json.data || [];

    if (outputs.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📂</div>
          <div class="empty-state-title">No outputs uploaded yet</div>
          <div class="empty-state-text">Use the 'Upload Output' button to attach laboratory charts, metrics, or CSV files.</div>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = '';
    outputs.forEach(out => {
      const item = document.createElement('div');
      item.className = 'activity-item';

      const ext = (out.file_name || '').slice(out.file_name.lastIndexOf('.')).toLowerCase();
      const isImg = ['.png', '.jpg', '.jpeg', '.svg'].includes(ext);
      const isText = ['.txt', '.csv'].includes(ext);

      item.innerHTML = `
        <div class="activity-left">
          <div style="font-size:1.5rem;">${isImg ? '🖼️' : ext === '.pdf' ? '📄' : '📊'}</div>
          <div class="activity-details">
            <span class="activity-name">${out.file_name}</span>
            <span class="activity-time">${(out.file_size / 1024).toFixed(1)} KB &bull; Uploaded ${out.created_at || 'Recently'}</span>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          ${(isImg || isText) ? `<button class="btn btn-outline btn-sm" onclick="previewOutputFile('${out.storage_path}', '${out.file_name}', '${ext}')">Preview</button>` : ''}
          <a href="/${out.storage_path}" download="${out.file_name}" class="btn btn-secondary btn-sm" target="_blank">
            Download &darr;
          </a>
        </div>
      `;
      listContainer.appendChild(item);
    });
  } catch (err) {
    if (listContainer) {
      listContainer.innerHTML = `<div style="color:var(--color-error);">Error loading saved outputs: ${err.message}</div>`;
    }
  }
}

function closeSavedOutputsModal() {
  const modal = document.getElementById('saved-outputs-modal');
  if (modal) modal.classList.remove('open');
}

async function previewOutputFile(path, filename, ext) {
  const previewBox = document.getElementById('file-preview-box');
  const previewName = document.getElementById('preview-filename');
  const previewContent = document.getElementById('file-preview-content');
  if (!previewBox || !previewContent) return;

  previewName.textContent = `Preview: ${filename}`;
  previewBox.style.display = 'block';

  if (['.png', '.jpg', '.jpeg', '.svg'].includes(ext)) {
    previewContent.innerHTML = `<img src="/${path}" alt="${filename}" style="max-width:100%; max-height:380px; border-radius:6px; display:block; margin:0 auto;">`;
  } else if (['.txt', '.csv'].includes(ext)) {
    try {
      const res = await fetch(`/${path}`);
      const text = await res.text();
      previewContent.innerHTML = `<pre style="font-family:var(--font-mono); font-size:0.82rem; color:#E2E8F0; max-height:280px; overflow-y:auto; white-space:pre-wrap; background:#12182B; padding:0.85rem; border-radius:6px;">${escapeHtml(text)}</pre>`;
    } catch (e) {
      previewContent.innerHTML = `<div style="color:var(--color-error);">Could not read file preview.</div>`;
    }
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ==============================================================================
// PROFILE EDITING & PHOTO UPLOAD
// ==============================================================================
function openEditProfileModal() {
  const p = AppState.profile;
  const modal = document.getElementById('edit-profile-modal');
  if (!modal) return;

  // Pre-fill fields
  document.getElementById('edit-full-name').value = p.full_name || 'CHOWDA ANAND';
  document.getElementById('edit-college').value = p.college || 'MOHAN BABU UNIVERSITY';
  document.getElementById('edit-branch').value = p.branch || 'CSE - Data Science';
  document.getElementById('edit-year').value = p.academic_year || '3rd Year';
  document.getElementById('edit-roll').value = p.roll_number || '';
  document.getElementById('edit-email').value = p.email || '';
  document.getElementById('edit-section').value = p.section || '';
  document.getElementById('edit-github').value = p.github_url || '';
  document.getElementById('edit-linkedin').value = p.linkedin_url || '';
  document.getElementById('edit-skills').value = p.skills || '';

  const preview = document.getElementById('modal-photo-preview');
  if (preview) preview.src = p.avatar_path || 'assets/profile.jpg';

  modal.classList.add('open');
}

function closeEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  if (modal) modal.classList.remove('open');
}

function previewProfilePhoto(input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  if (file.size > 5 * 1024 * 1024) {
    showToast('Photo size exceeds 5MB limit.', 'error');
    input.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result;
    const preview = document.getElementById('modal-photo-preview');
    if (preview) preview.src = base64;

    // Send immediately to backend
    try {
      const res = await fetch('/api/upload_photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_content: base64 })
      });
      const json = await res.json();
      if (json.success && json.avatar_path) {
        AppState.profile.avatar_path = json.avatar_path;
        renderProfileUI();
        showToast('Profile photo updated successfully!', 'success');
      }
    } catch (err) {
      console.warn('Photo upload failed:', err);
    }
  };
  reader.readAsDataURL(file);
}

async function handleProfileSubmit(event) {
  event.preventDefault();
  const saveBtn = document.getElementById('save-profile-btn');
  const spinner = document.getElementById('save-profile-spinner');
  if (saveBtn) saveBtn.disabled = true;
  if (spinner) spinner.style.display = 'inline-block';

  const updatedData = {
    full_name: document.getElementById('edit-full-name').value.trim(),
    college: document.getElementById('edit-college').value.trim(),
    branch: document.getElementById('edit-branch').value.trim(),
    academic_year: document.getElementById('edit-year').value.trim(),
    roll_number: document.getElementById('edit-roll').value.trim(),
    email: document.getElementById('edit-email').value.trim(),
    section: document.getElementById('edit-section').value.trim(),
    github_url: document.getElementById('edit-github').value.trim(),
    linkedin_url: document.getElementById('edit-linkedin').value.trim(),
    skills: document.getElementById('edit-skills').value.trim()
  };

  try {
    let result = null;
    if (window.SupabaseService && window.SupabaseService.isConfigured) {
      result = await window.SupabaseService.updateProfile(updatedData);
    } else {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      result = await res.json();
    }

    if (result && result.success) {
      AppState.profile = { ...AppState.profile, ...updatedData };
      renderProfileUI();
      closeEditProfileModal();
      showToast('Profile updated and persisted successfully!', 'success');
    } else {
      showToast(result.error || 'Failed to update profile.', 'error');
    }
  } catch (err) {
    showToast(`Error updating profile: ${err.message}`, 'error');
  } finally {
    if (saveBtn) saveBtn.disabled = false;
    if (spinner) spinner.style.display = 'none';
  }
}

// ==============================================================================
// TOAST NOTIFICATIONS & UTILITIES
// ==============================================================================

// ==============================================================================
// 7. CSV DATASET ANALYZER & EDA STUDIO
// ==============================================================================

function parseCsvString(csvText) {
  if (!csvText || !csvText.trim()) return { headers: [], rows: [] };
  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line) => {
    const result = [];
    let insideQuotes = false;
    let entry = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        result.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    result.push(entry.trim());
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseLine(lines[i]);
    if (row.length === headers.length || row.length > 1) {
      rows.push(row);
    }
  }
  return { headers, rows };
}

async function loadSelectedSampleDataset(datasetName) {
  if (!datasetName) datasetName = 'student_performance.csv';
  AppState.edaCurrentFile = datasetName;

  const selectEl = document.getElementById('eda-dataset-select');
  if (selectEl && selectEl.value !== datasetName) {
    selectEl.value = datasetName;
  }

  const tableContainer = document.getElementById('eda-table-container');
  if (tableContainer) {
    tableContainer.innerHTML = '<div style="padding:1.5rem;text-align:center;color:var(--text-3);"><span class="spinner" style="display:inline-block;margin-right:0.5rem;"></span> Loading dataset...</div>';
  }

  try {
    const res = await fetch(`/api/sample_datasets/${encodeURIComponent(datasetName)}`);
    const json = await res.json();
    if (json.success && json.csv) {
      const parsed = parseCsvString(json.csv);
      AppState.edaData = {
        headers: parsed.headers,
        rows: parsed.rows,
        rawCsv: json.csv,
        filename: datasetName
      };
      renderEdaView();
    } else {
      showToast(`Could not load dataset '${datasetName}'.`, 'error');
    }
  } catch (err) {
    console.error('[EDA] Error loading dataset:', err);
    showToast(`Error fetching ${datasetName}: ${err.message}`, 'error');
  }
}

function reloadCurrentEdaDataset() {
  const target = AppState.edaCurrentFile || 'student_performance.csv';
  loadSelectedSampleDataset(target);
  showToast(`Reloaded ${target}.`, 'info');
}

function handleEdaCustomCsvUpload(input) {
  if (!input.files || input.files.length === 0) return;
  const file = input.files[0];
  if (!file.name.toLowerCase().endsWith('.csv')) {
    showToast('Please select a valid .csv file.', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    const parsed = parseCsvString(text);
    if (parsed.headers.length === 0 || parsed.rows.length === 0) {
      showToast('Could not parse any records from CSV file.', 'error');
      return;
    }

    AppState.edaCurrentFile = file.name;
    AppState.edaData = {
      headers: parsed.headers,
      rows: parsed.rows,
      rawCsv: text,
      filename: file.name
    };

    const selectEl = document.getElementById('eda-dataset-select');
    if (selectEl) {
      let found = false;
      for (let i = 0; i < selectEl.options.length; i++) {
        if (selectEl.options[i].value === file.name) {
          selectEl.selectedIndex = i;
          found = true;
          break;
        }
      }
      if (!found) {
        const opt = document.createElement('option');
        opt.value = file.name;
        opt.textContent = `${file.name} (Uploaded · ${parsed.rows.length} rows)`;
        selectEl.appendChild(opt);
        selectEl.value = file.name;
      }
    }

    renderEdaView();
    showToast(`Successfully loaded '${file.name}' (${parsed.rows.length} rows, ${parsed.headers.length} columns)!`, 'success');
  };
  reader.onerror = function() {
    showToast('Failed to read file.', 'error');
  };
  reader.readAsText(file);
}

function downloadCurrentCsvDataset() {
  if (!AppState.edaData || !AppState.edaData.rawCsv) {
    showToast('No dataset currently loaded to download.', 'error');
    return;
  }
  const blob = new Blob([AppState.edaData.rawCsv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = AppState.edaCurrentFile || 'dataset.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Downloading '${AppState.edaCurrentFile || 'dataset.csv'}'...`, 'info');
}

async function downloadSampleCsv(datasetName) {
  try {
    const res = await fetch(`/api/sample_datasets/${encodeURIComponent(datasetName)}`);
    const json = await res.json();
    if (json.success && json.csv) {
      const blob = new Blob([json.csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = datasetName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Downloading '${datasetName}'...`, 'info');
    } else {
      showToast(`Failed to fetch dataset '${datasetName}'.`, 'error');
    }
  } catch (err) {
    showToast(`Error downloading ${datasetName}: ${err.message}`, 'error');
  }
}

function loadSampleIntoEda(filename) {
  showSection('csvstudio', document.querySelector('[data-section=csvstudio]'));
  loadSelectedSampleDataset(filename);
  showToast(`Switched to CSV Studio and loaded ${filename}!`, 'info');
}

function renderEdaView() {
  const data = AppState.edaData;
  if (!data || !data.headers || data.headers.length === 0) return;

  const rowCount = data.rows.length;
  const colCount = data.headers.length;

  let missingCells = 0;
  const rowStrings = new Set();
  let duplicateRows = 0;

  data.rows.forEach(row => {
    row.forEach(cell => {
      if (cell === '' || cell === null || cell === undefined || String(cell).toLowerCase() === 'nan' || String(cell).toLowerCase() === 'null') {
        missingCells++;
      }
    });
    const serialized = row.join('|');
    if (rowStrings.has(serialized)) {
      duplicateRows++;
    } else {
      rowStrings.add(serialized);
    }
  });

  const rowsEl = document.getElementById('eda-rows-count');
  const colsEl = document.getElementById('eda-cols-count');
  const missingEl = document.getElementById('eda-missing-count');
  const dupEl = document.getElementById('eda-dup-count');
  const tableInfo = document.getElementById('eda-table-info');

  if (rowsEl) rowsEl.textContent = rowCount;
  if (colsEl) colsEl.textContent = colCount;
  if (missingEl) {
    missingEl.textContent = missingCells;
    missingEl.style.color = missingCells > 0 ? '#F59E0B' : '#10B981';
  }
  if (dupEl) {
    dupEl.textContent = duplicateRows;
    dupEl.style.color = duplicateRows > 0 ? '#EF4444' : '#A78BFA';
  }
  if (tableInfo) {
    tableInfo.textContent = `Showing all ${rowCount} records · ${colCount} features (${AppState.edaCurrentFile || 'Dataset'})`;
  }

  const chartColSelect = document.getElementById('eda-chart-col-select');
  if (chartColSelect) {
    chartColSelect.innerHTML = '';
    data.headers.forEach((h, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.textContent = `${h} (col ${idx + 1})`;
      chartColSelect.appendChild(opt);
    });
    if (chartColSelect.options.length > 4) {
      chartColSelect.selectedIndex = 4;
    }
  }

  const tableContainer = document.getElementById('eda-table-container');
  if (tableContainer) {
    let html = '<table class="eda-table">';
    html += '<thead><tr><th style="width:40px;text-align:center;">#</th>';
    data.headers.forEach(h => {
      html += `<th>${escapeHtml(h)}</th>`;
    });
    html += '</tr></thead><tbody>';

    data.rows.forEach((row, rIdx) => {
      html += `<tr><td style="text-align:center;color:var(--text-3);font-size:0.75rem;">${rIdx + 1}</td>`;
      row.forEach(cell => {
        const isNull = (cell === '' || cell === null || cell === undefined || String(cell).toLowerCase() === 'nan' || String(cell).toLowerCase() === 'null');
        if (isNull) {
          html += `<td><span style="background:rgba(239,68,68,0.2);color:#F87171;padding:0.12rem 0.45rem;border-radius:4px;font-size:0.75rem;font-weight:700;">NULL</span></td>`;
        } else {
          const isNum = !isNaN(parseFloat(cell)) && isFinite(cell);
          html += `<td style="${isNum ? 'font-family:var(--font-mono);' : ''}">${escapeHtml(String(cell))}</td>`;
        }
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    tableContainer.innerHTML = html;
  }

  generateEdaColumnChart();
}

function generateEdaColumnChart() {
  const chartArea = document.getElementById('eda-chart-canvas-area');
  const colSelect = document.getElementById('eda-chart-col-select');
  if (!chartArea || !colSelect || !AppState.edaData) return;

  const colIdx = parseInt(colSelect.value, 10);
  const colName = AppState.edaData.headers[colIdx] || `Column ${colIdx + 1}`;
  const values = AppState.edaData.rows.map(r => r[colIdx]).filter(v => v !== undefined && v !== null && v !== '');

  if (values.length === 0) {
    chartArea.innerHTML = `<span style="color:#6B7280;font-style:italic;">No valid data points found in '${escapeHtml(colName)}'.</span>`;
    return;
  }

  const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
  const isNumeric = numericValues.length >= values.length * 0.7;

  if (isNumeric && numericValues.length > 0) {
    numericValues.sort((a, b) => a - b);
    const min = numericValues[0];
    const max = numericValues[numericValues.length - 1];
    const sum = numericValues.reduce((acc, v) => acc + v, 0);
    const mean = sum / numericValues.length;
    const mid = Math.floor(numericValues.length / 2);
    const median = numericValues.length % 2 === 0 ? (numericValues[mid - 1] + numericValues[mid]) / 2 : numericValues[mid];
    const variance = numericValues.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / numericValues.length;
    const stdDev = Math.sqrt(variance);

    const numBins = Math.min(8, Math.max(4, Math.floor(Math.sqrt(numericValues.length))));
    const range = (max - min) || 1;
    const binWidth = range / numBins;
    const bins = Array.from({ length: numBins }, (_, i) => ({
      min: min + i * binWidth,
      max: min + (i + 1) * binWidth,
      count: 0,
      label: `${(min + i * binWidth).toFixed(1)}-${(min + (i + 1) * binWidth).toFixed(1)}`
    }));

    numericValues.forEach(v => {
      let bIdx = Math.floor((v - min) / binWidth);
      if (bIdx >= numBins) bIdx = numBins - 1;
      bins[bIdx].count++;
    });

    const maxCount = Math.max(...bins.map(b => b.count), 1);
    const svgWidth = 600;
    const svgHeight = 220;
    const margin = { top: 25, right: 25, bottom: 45, left: 40 };
    const chartW = svgWidth - margin.left - margin.right;
    const chartH = svgHeight - margin.top - margin.bottom;
    const barW = chartW / numBins;

    let barsSvg = '';
    bins.forEach((b, i) => {
      const barH = (b.count / maxCount) * (chartH - 20);
      const x = margin.left + i * barW + 4;
      const y = margin.top + (chartH - barH);
      const width = Math.max(barW - 8, 4);

      barsSvg += `
        <g class="eda-bar-group">
          <rect x="${x}" y="${y}" width="${width}" height="${barH}" rx="4" fill="url(#indigoGrad)" opacity="0.9">
            <title>${b.label}: ${b.count} observations (${((b.count / numericValues.length) * 100).toFixed(1)}%)</title>
          </rect>
          <text x="${x + width / 2}" y="${y - 6}" text-anchor="middle" font-size="11" font-weight="700" fill="#E2E8F0">${b.count}</text>
          <text x="${x + width / 2}" y="${margin.top + chartH + 18}" text-anchor="middle" font-size="9.5" fill="#94A3B8" transform="rotate(-15, ${x + width / 2}, ${margin.top + chartH + 18})">${b.label}</text>
        </g>
      `;
    });

    chartArea.innerHTML = `
      <div style="width:100%;display:flex;flex-direction:column;gap:1rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;padding:0 0.5rem;">
          <div style="font-weight:700;font-size:0.95rem;color:#F1F5F9;">
            Distribution of <span style="color:#818CF8;">${escapeHtml(colName)}</span> (Continuous Numeric)
          </div>
          <div style="display:flex;gap:0.75rem;font-size:0.75rem;color:#94A3B8;flex-wrap:wrap;">
            <span>Min: <strong style="color:#F1F5F9;">${min.toFixed(2)}</strong></span>
            <span>Max: <strong style="color:#F1F5F9;">${max.toFixed(2)}</strong></span>
            <span>Mean (μ): <strong style="color:#818CF8;">${mean.toFixed(2)}</strong></span>
            <span>Median: <strong style="color:#10B981;">${median.toFixed(2)}</strong></span>
            <span>Std Dev (σ): <strong style="color:#A78BFA;">${stdDev.toFixed(2)}</strong></span>
          </div>
        </div>

        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="width:100%;max-height:240px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid rgba(255,255,255,0.06);">
          <defs>
            <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#818CF8"/>
              <stop offset="100%" stop-color="#4F46E5"/>
            </linearGradient>
          </defs>
          <line x1="${margin.left}" y1="${margin.top + chartH}" x2="${svgWidth - margin.right}" y2="${margin.top + chartH}" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
          ${barsSvg}
        </svg>
      </div>
    `;
  } else {
    const counts = {};
    values.forEach(v => {
      counts[v] = (counts[v] || 0) + 1;
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const maxVal = Math.max(...entries.map(e => e[1]), 1);

    let barsHtml = '<div style="display:flex;flex-direction:column;gap:0.6rem;width:100%;padding:0.5rem;">';
    barsHtml += `<div style="font-weight:700;font-size:0.95rem;color:#F1F5F9;margin-bottom:0.25rem;">Category Frequencies: <span style="color:#A78BFA;">${escapeHtml(colName)}</span> (Categorical)</div>`;

    entries.forEach(([cat, cnt]) => {
      const pct = ((cnt / values.length) * 100).toFixed(1);
      barsHtml += `
        <div style="display:flex;align-items:center;gap:0.75rem;font-size:0.8rem;">
          <span style="width:140px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#E2E8F0;font-weight:600;" title="${escapeHtml(cat)}">${escapeHtml(cat)}</span>
          <div style="flex:1;background:rgba(255,255,255,0.06);height:20px;border-radius:4px;overflow:hidden;position:relative;">
            <div style="width:${(cnt / maxVal) * 100}%;height:100%;background:linear-gradient(90deg, #6366F1, #A78BFA);border-radius:4px;transition:width 0.3s ease;"></div>
          </div>
          <span style="width:75px;text-align:right;color:#94A3B8;font-family:var(--font-mono);">${cnt} (${pct}%)</span>
        </div>
      `;
    });
    barsHtml += '</div>';

    chartArea.innerHTML = barsHtml;
  }
}

// ==============================================================================
// 8. INTERACTIVE CODE PLAYGROUND / SANDBOX
// ==============================================================================

const SANDBOX_TEMPLATES = {
  numpy: `# Data Science Playground · NumPy Vectorized Matrix Algebra
import numpy as np

print("=" * 55)
print("NumPy Vectorized Operations & Matrix Decomposition")
print("=" * 55)

# 1. Array Creation & Reshaping
A = np.array([[3, 2, -1], [2, -2, 4], [-1, 0.5, -1]], dtype=float)
B = np.array([1, -2, 0], dtype=float)

print("Matrix A (3x3):\\n", A)
print("\\nVector B (3x1):", B)

# 2. Linear System Solver: A * X = B
X = np.linalg.solve(A, B)
print("\\nSolution Vector X:", np.round(X, 4))
print("Verification (A @ X - B):", np.allclose(A @ X, B))

# 3. Eigenvalues & Eigenvectors
eigenvalues, eigenvectors = np.linalg.eig(A)
print("\\nEigenvalues:", np.round(eigenvalues, 4))

# 4. Statistical Vector Operations
random_matrix = np.random.normal(loc=50, scale=10, size=(100, 3))
print("\\nGenerated 100x3 Gaussian sample:")
print("  Mean per feature:  ", np.round(random_matrix.mean(axis=0), 2))
print("  Std dev per feature:", np.round(random_matrix.std(axis=0), 2))
print("\\n[SUCCESS] Matrix computations completed.")
`,

  pandas: `# Data Science Playground · Pandas Data Wrangling & Aggregation
import pandas as pd
import numpy as np

print("=" * 55)
print("Pandas Tabular Pipeline · Cohort Analysis & Pivot Tables")
print("=" * 55)

# 1. Synthesize Departmental Student Performance Record
np.random.seed(42)
departments = ["CSE-DS", "CSE-AI", "ECE", "IT"]
genders = ["Female", "Male"]

data = {
    "StudentID": [f"MBU-{i:04d}" for i in range(1001, 1021)],
    "Department": np.random.choice(departments, 20),
    "Gender": np.random.choice(genders, 20),
    "StudyHoursPerWeek": np.round(np.random.uniform(5, 25, 20), 1),
    "AttendanceRate": np.round(np.random.uniform(70, 99, 20), 1),
    "LabGrade": np.random.randint(65, 100, 20)
}

df = pd.DataFrame(data)

# Inject intentional NaN for imputation practice
df.loc[3, "AttendanceRate"] = np.nan
df.loc[7, "StudyHoursPerWeek"] = np.nan

print("--- Raw Sample DataFrame Head ---")
print(df.head(6))

# 2. Missing Value Imputation
print("\\nMissing cells detected:")
print(df.isnull().sum()[df.isnull().sum() > 0])
df["AttendanceRate"] = df["AttendanceRate"].fillna(df["AttendanceRate"].median())
df["StudyHoursPerWeek"] = df["StudyHoursPerWeek"].fillna(df["StudyHoursPerWeek"].mean())

# 3. GroupBy Aggregation by Department
agg_report = df.groupby("Department").agg(
    StudentCount=("StudentID", "count"),
    AvgStudyHours=("StudyHoursPerWeek", "mean"),
    AvgAttendance=("AttendanceRate", "mean"),
    AvgGrade=("LabGrade", "mean")
).round(2)

print("\\n--- Departmental Aggregate Metrics ---")
print(agg_report)

print("\\n[SUCCESS] Pandas wrangling pipeline executed successfully.")
`,

  matplotlib: `# Data Science Playground · Statistical Visualization with Matplotlib
import matplotlib.pyplot as plt
import numpy as np

print("=" * 55)
print("Rendering Multi-Panel Statistical Visualization")
print("=" * 55)

np.random.seed(101)
x = np.linspace(0, 10, 100)
y_signal = np.sin(x) + np.random.normal(0, 0.15, 100)
sample_dist = np.random.normal(72, 12, 500)

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4), facecolor='#111827')

# Left Plot: Signal with Gaussian Noise
ax1.set_facecolor('#1F2937')
ax1.plot(x, np.sin(x), color='#818CF8', linewidth=2.5, label='Underlying Model')
ax1.scatter(x, y_signal, color='#34D399', s=16, alpha=0.7, label='Observations')
ax1.set_title('Signal Regression Curve', color='#F1F5F9', fontsize=12, fontweight='bold')
ax1.set_xlabel('Predictor X', color='#94A3B8')
ax1.set_ylabel('Target Y', color='#94A3B8')
ax1.tick_params(colors='#94A3B8')
ax1.legend(facecolor='#111827', edgecolor='#374151', labelcolor='#F1F5F9')
ax1.grid(color='#374151', linestyle='--', alpha=0.5)

# Right Plot: Normal Distribution Histogram
ax2.set_facecolor('#1F2937')
n, bins, patches = ax2.hist(sample_dist, bins=25, color='#A78BFA', edgecolor='#4C1D95', alpha=0.85)
ax2.axvline(np.mean(sample_dist), color='#EF4444', linestyle='--', linewidth=2, label=f'Mean = {np.mean(sample_dist):.1f}')
ax2.set_title('Exam Scores Distribution (N=500)', color='#F1F5F9', fontsize=12, fontweight='bold')
ax2.set_xlabel('Score', color='#94A3B8')
ax2.set_ylabel('Frequency', color='#94A3B8')
ax2.tick_params(colors='#94A3B8')
ax2.legend(facecolor='#111827', edgecolor='#374151', labelcolor='#F1F5F9')
ax2.grid(color='#374151', linestyle='--', alpha=0.5)

plt.tight_layout()
plt.show()
print("[SUCCESS] Matplotlib figure generated and displayed below.")
`,

  ml: `# Data Science Playground · Machine Learning Linear Regression
import numpy as np
import pandas as pd

print("=" * 55)
print("Supervised Learning · Simple OLS Linear Regression")
print("=" * 55)

# 1. Feature Synthesis: X = Weekly Coding Hours, Y = Project Score
np.random.seed(42)
n_samples = 40
hours = np.random.uniform(4, 28, n_samples)
noise = np.random.normal(0, 3.5, n_samples)
scores = 35.0 + 2.25 * hours + noise
scores = np.clip(scores, 40, 100)

# Train/Test Split (80/20)
indices = np.random.permutation(n_samples)
train_idx, test_idx = indices[:32], indices[32:]

X_train, y_train = hours[train_idx], scores[train_idx]
X_test, y_test = hours[test_idx], scores[test_idx]

# 2. Closed-Form Parameter Estimation
x_bar = np.mean(X_train)
y_bar = np.mean(y_train)

slope = np.sum((X_train - x_bar) * (y_train - y_bar)) / np.sum((X_train - x_bar)**2)
intercept = y_bar - slope * x_bar

print(f"Fitted Model: Score = {slope:.3f} * Hours + {intercept:.3f}")

# 3. Model Evaluation on Test Set
y_pred = slope * X_test + intercept
mae = np.mean(np.abs(y_test - y_pred))
mse = np.mean((y_test - y_pred)**2)
rmse = np.sqrt(mse)
ss_tot = np.sum((y_test - np.mean(y_test))**2)
ss_res = np.sum((y_test - y_pred)**2)
r2 = 1.0 - (ss_res / ss_tot)

print("\\n--- Test Set Evaluation ---")
print(f"Test Samples:                 {len(X_test)}")
print(f"Mean Absolute Error (MAE):     {mae:.3f} points")
print(f"Root Mean Squared Error (RMSE): {rmse:.3f} points")
print(f"Coefficient of Determination R²: {r2:.4f} ({r2*100:.1f}% variance explained)")

# 4. Scenario Predictions
scenarios = np.array([8.0, 16.0, 24.0, 32.0])
preds = slope * scenarios + intercept
print("\\n--- Forward Projections ---")
for h, p in zip(scenarios, preds):
    print(f"  Effort: {h:4.1f} hrs/week -> Projected Score: {p:5.1f} / 100")

print("\\n[SUCCESS] ML Regression model trained and evaluated.")
`
};

function loadSandboxTemplate(templateName) {
  const code = SANDBOX_TEMPLATES[templateName];
  if (!code) return;
  const editor = document.getElementById('sandbox-editor');
  if (editor) {
    editor.value = code;
    editor.focus();
  }
  showToast(`Loaded ${templateName.toUpperCase()} template into Sandbox!`, 'info');
}

function clearSandboxCode() {
  const editor = document.getElementById('sandbox-editor');
  if (editor) editor.value = '';
  showToast('Sandbox editor cleared.', 'info');
}

function clearSandboxOutput() {
  const outputBody = document.getElementById('sandbox-output-body');
  if (outputBody) {
    outputBody.innerHTML = '<div style="color:#6B7280;font-style:italic;">Click \'Run Playground\' to execute your code...</div>';
  }
  const durBadge = document.getElementById('sandbox-duration');
  if (durBadge) durBadge.textContent = '0ms';
  const plotContainer = document.getElementById('sandbox-plot-container');
  if (plotContainer) plotContainer.style.display = 'none';
  const plotImg = document.getElementById('sandbox-plot-img');
  if (plotImg) plotImg.src = '';
}

async function executeSandboxCode() {
  const editor = document.getElementById('sandbox-editor');
  const code = editor ? editor.value.trim() : '';
  if (!code) {
    showToast('Sandbox editor is empty. Load a template or write Python code first.', 'warning');
    return;
  }

  const runBtn = document.getElementById('sandbox-run-btn');
  const spinner = document.getElementById('sandbox-spinner');
  const runIcon = document.getElementById('sandbox-run-icon');
  const outputBody = document.getElementById('sandbox-output-body');
  const durBadge = document.getElementById('sandbox-duration');
  const plotContainer = document.getElementById('sandbox-plot-container');
  const plotImg = document.getElementById('sandbox-plot-img');

  if (runBtn) runBtn.disabled = true;
  if (spinner) spinner.style.display = 'inline-block';
  if (runIcon) runIcon.style.display = 'none';
  if (plotContainer) plotContainer.style.display = 'none';

  if (outputBody) {
    outputBody.innerHTML = '<div style="color:var(--text-3);"><span class="spinner" style="display:inline-block;margin-right:0.5rem;"></span> Executing in Python runtime...</div>';
  }

  const startTime = performance.now();

  try {
    if (AppState.pyodideReady && AppState.pyodide) {
      const runnerCode = `
import sys, io, base64

_stdout_trap = io.StringIO()
_stderr_trap = io.StringIO()
_orig_stdout = sys.stdout
_orig_stderr = sys.stderr
sys.stdout = _stdout_trap
sys.stderr = _stderr_trap
_img_b64 = ""

try:
    exec(${JSON.stringify(code)}, globals())
    import matplotlib.pyplot as _plt
    if _plt.get_fignums():
        _buf = io.BytesIO()
        _plt.savefig(_buf, format='png', bbox_inches='tight', dpi=110, facecolor='#111827', edgecolor='none')
        _buf.seek(0)
        _img_b64 = base64.b64encode(_buf.read()).decode('ascii')
        _plt.close('all')
except Exception as _e:
    import traceback
    traceback.print_exc(file=_stderr_trap)
finally:
    sys.stdout = _orig_stdout
    sys.stderr = _orig_stderr

_out_str = _stdout_trap.getvalue()
_err_str = _stderr_trap.getvalue()
`;
      await AppState.pyodide.runPythonAsync(runnerCode);
      const stdout = AppState.pyodide.globals.get('_out_str') || '';
      const stderr = AppState.pyodide.globals.get('_err_str') || '';
      const plotB64 = AppState.pyodide.globals.get('_img_b64') || '';

      const durationMs = Math.round(performance.now() - startTime);
      if (durBadge) durBadge.textContent = `${durationMs}ms`;

      renderSandboxOutput(stdout, stderr, plotB64);
    } else {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exp_id: 1, code: code })
      });
      const data = await res.json();
      const durationMs = Math.round(performance.now() - startTime);
      if (durBadge) durBadge.textContent = `${durationMs}ms`;

      renderSandboxOutput(data.output || '', data.stderr || '', '');
    }
    showToast('Playground execution finished!', 'success');
  } catch (err) {
    const durationMs = Math.round(performance.now() - startTime);
    if (durBadge) durBadge.textContent = `${durationMs}ms`;
    if (outputBody) {
      outputBody.innerHTML = `<pre style="color:#EF4444;font-family:var(--font-mono);font-size:0.82rem;white-space:pre-wrap;">${escapeHtml(err.message || String(err))}</pre>`;
    }
    showToast(`Execution error: ${err.message}`, 'error');
  } finally {
    if (runBtn) runBtn.disabled = false;
    if (spinner) spinner.style.display = 'none';
    if (runIcon) runIcon.style.display = 'inline';
  }
}

function renderSandboxOutput(stdout, stderr, plotB64) {
  const outputBody = document.getElementById('sandbox-output-body');
  const plotContainer = document.getElementById('sandbox-plot-container');
  const plotImg = document.getElementById('sandbox-plot-img');

  if (outputBody) {
    let html = '';
    if (stdout && stdout.trim()) {
      html += `<pre style="color:#E2E8F0;font-family:var(--font-mono);font-size:0.83rem;white-space:pre-wrap;margin:0;">${escapeHtml(stdout)}</pre>`;
    }
    if (stderr && stderr.trim()) {
      html += `<pre style="color:#F87171;font-family:var(--font-mono);font-size:0.83rem;white-space:pre-wrap;margin-top:0.75rem;padding:0.5rem;background:rgba(239,68,68,0.1);border-radius:4px;">${escapeHtml(stderr)}</pre>`;
    }
    if (!html) {
      html = '<div style="color:#6B7280;font-style:italic;">Code executed with no stdout output.</div>';
    }
    outputBody.innerHTML = html;
  }

  if (plotB64 && plotContainer && plotImg) {
    plotImg.src = `data:image/png;base64,${plotB64}`;
    plotContainer.style.display = 'block';
  }
}

// ==============================================================================
// 9. AI STUDY ASSISTANT (DATA SCIENCE COPILOT)
// ==============================================================================

function formatMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/```python([\s\S]*?)```/g, '<div style="background:#0F172A;border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:0.65rem 0.85rem;margin:0.5rem 0;font-family:var(--font-mono);font-size:0.8rem;overflow-x:auto;color:#38BDF8;"><div style="font-size:0.68rem;color:#94A3B8;margin-bottom:0.35rem;font-weight:700;"><i class="fa-brands fa-python"></i> Python</div><pre style="margin:0;"><code>$1</code></pre></div>')
    .replace(/```([\s\S]*?)```/g, '<div style="background:#0F172A;border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:0.65rem;margin:0.5rem 0;font-family:var(--font-mono);font-size:0.8rem;overflow-x:auto;color:#E2E8F0;"><pre style="margin:0;"><code>$1</code></pre></div>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(99,102,241,0.15);color:#A5B4FC;padding:0.12rem 0.35rem;border-radius:4px;font-family:var(--font-mono);font-size:0.82rem;">$1</code>')
    .replace(/^### (.*$)/gim, '<h4 style="margin:0.6rem 0 0.25rem;color:#818CF8;font-size:0.95rem;font-weight:700;">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 style="margin:0.75rem 0 0.35rem;color:#A78BFA;font-size:1.05rem;font-weight:700;">$1</h3>')
    .replace(/^\s*[-•]\s+(.*$)/gim, '<li style="margin-left:1.2rem;margin-bottom:0.3rem;color:#CBD5E1;">$1</li>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
  return html;
}

const AI_KNOWLEDGE_BASE = [
  {
    keywords: ['precision', 'recall', 'f1', 'difference between precision and recall'],
    title: 'Precision, Recall, and F1-Score in Classification',
    answer: `Here is the comprehensive breakdown of classification evaluation metrics:

### 1. Precision (Exactness)
Precision answers: **"Out of all instances predicted as Positive, how many are actually Positive?"**
- **Formula:** \`Precision = TP / (TP + FP)\`
- **When to prioritize:** When the cost of False Positives is severe (e.g., spam filter classifying important business email as spam).

### 2. Recall / Sensitivity (Completeness)
Recall answers: **"Out of all actual Positive cases, how many did the model detect?"**
- **Formula:** \`Recall = TP / (TP + FN)\`
- **When to prioritize:** When missing a positive case is dangerous or fatal (e.g., medical cancer diagnosis, fraudulent financial transaction detection).

### 3. F1-Score (Harmonic Balance)
The harmonic mean of Precision and Recall. It penalizes extreme disparities:
- **Formula:** \`F1-Score = 2 * (Precision * Recall) / (Precision + Recall)\`
- Unlike arithmetic mean, if either Precision or Recall drops to zero, F1 drops to zero.

\`\`\`python
from sklearn.metrics import precision_score, recall_score, f1_score

# Example binary calculation
y_true = [1, 0, 1, 1, 0, 1]
y_pred = [1, 0, 1, 0, 0, 1]

p = precision_score(y_true, y_pred) # 1.0 (3 TP, 0 FP)
r = recall_score(y_true, y_pred)    # 0.75 (3 TP, 1 FN)
f1 = f1_score(y_true, y_pred)       # 0.857
print(f"Precision: {p:.2f}, Recall: {r:.2f}, F1: {f1:.2f}")
\`\`\`
`
  },
  {
    keywords: ['k-means', 'kmeans', 'elbow method', 'clustering'],
    title: 'K-Means Clustering Algorithm & Elbow Method',
    answer: `K-Means is an unsupervised iterative vector quantization algorithm:

### Algorithm Steps:
1. **Initialize:** Randomly choose \`K\` initial centroids in feature space.
2. **Assignment Step:** Assign each observation to the nearest centroid using Euclidean distance: \`d(x, c) = sqrt(sum((x_i - c_i)^2))\`.
3. **Update Step:** Recalculate each centroid as the geometric mean of all assigned points.
4. **Convergence:** Repeat steps 2 and 3 until centroids stabilize (inertia stops decreasing below tolerance).

### The Elbow Method:
To find the optimal number of clusters \`K\`:
- Compute the **Within-Cluster Sum of Squares (WCSS / Inertia)** for \`K = 1\` to \`K = 10\`.
- Plot \`K\` on the x-axis vs. Inertia on the y-axis.
- The point where the rate of decrease abruptly bends and slows down resembles an **"elbow"** — indicating diminishing returns for adding further clusters.

\`\`\`python
from sklearn.cluster import KMeans
import matplotlib.pyplot as plt

inertia = []
K_range = range(1, 10)
for k in K_range:
    km = KMeans(n_clusters=k, random_state=42, n_init='auto')
    km.fit(X)
    inertia.append(km.inertia_)

# The 'elbow' indicates the optimal K
\`\`\`
`
  },
  {
    keywords: ['loc', 'iloc', 'pandas loc vs iloc', 'loc vs iloc'],
    title: 'Pandas loc vs. iloc Indexing Differences',
    answer: `In Pandas, both \`.loc\` and \`.iloc\` are indexers used for row and column slicing:

### 1. \`.loc[]\` (Label-Based Indexer)
- Selects by index labels and column names.
- **Slicing includes both endpoints** (\`stop\` is INCLUDED!).

### 2. \`.iloc[]\` (Integer Position-Based Indexer)
- Selects strictly by 0-indexed integer numerical positions (\`0\` to \`n-1\`).
- **Slicing excludes the endpoint**, following Python's standard \`half-open [start, stop)\` convention.

\`\`\`python
import pandas as pd
df = pd.DataFrame({
    'Name': ['Aarav', 'Bhavna', 'Chirag'],
    'Score': [85, 92, 78]
}, index=['st1', 'st2', 'st3'])

# Label-based: includes 'st2'
print(df.loc['st1':'st2', 'Name':'Score'])

# Position-based: excludes index 2 (returns rows 0 and 1)
print(df.iloc[0:2, 0:2])
\`\`\`
`
  },
  {
    keywords: ['central limit theorem', 'clt', 'inferential statistics'],
    title: 'Central Limit Theorem (CLT) & Its Significance',
    answer: `The **Central Limit Theorem (CLT)** states:

> *As the sample size \`n\` becomes sufficiently large (typically \`n >= 30\`), the sampling distribution of the sample mean approaches a Gaussian (Normal) Distribution, regardless of the underlying population's shape.*

### Key Mathematical Properties:
- **Expected Mean of Sample Means:** \`μ_x_bar = μ\` (unbiased estimator)
- **Standard Error of the Mean:** \`SE = σ / sqrt(n)\`
- As sample size increases, the sampling distribution becomes narrower and more peaked.

### Why CLT is Critical in Data Science:
1. Allows hypothesis testing (\`Z-test\`, \`t-test\`) and A/B testing on non-normal real-world distributions.
2. Forms the mathematical foundation for calculating confidence intervals (\`mean ± 1.96 * SE\` for 95% confidence).
3. Underpins inferential statistical modeling across DS07 and linear modeling in DS09.
`
  },
  {
    keywords: ['multicollinearity', 'collinearity', 'vif'],
    title: 'Detecting and Treating Multicollinearity in Regression',
    answer: `Multicollinearity occurs when two or more independent predictor features in a Multiple Linear Regression model are highly correlated.

### Why It Causes Issues:
- Makes regression coefficient estimates (\`w1, w2, ...\`) unstable and wildly sensitive to small data variations.
- Inflates standard errors, causing statistically significant predictors to appear insignificant (\`p > 0.05\`).

### Detection Methods:
1. **Correlation Matrix:** Correlation \`|r| > 0.8\` between two features (see Experiment **DS08**).
2. **Variance Inflation Factor (VIF):**
   - \`VIF = 1 / (1 - R_i^2)\`
   - \`VIF = 1\`: No correlation.
   - \`VIF > 5\`: Moderate multicollinearity.
   - \`VIF > 10\`: Severe multicollinearity requiring intervention.

### Remediation Strategies:
- **Feature Dropping:** Remove redundant correlated features based on domain knowledge.
- **Feature Synthesis:** Combine features (e.g., \`ScreenTime / StudyHours\`).
- **Principal Component Analysis (PCA):** Transform features into orthogonal components.
- **Regularization:** Use **Ridge Regression (L2)** which constrains coefficient variance.
`
  },
  {
    keywords: ['scaling', 'normalization', 'standardization', 'min-max', 'z-score'],
    title: 'Feature Scaling: Min-Max Normalization vs. Z-Score Standardization',
    answer: `Feature scaling normalizes continuous predictors to prevent high-magnitude features from dominating distance calculations or gradient steps:

### 1. Min-Max Normalization (Rescaling to [0, 1])
- **Formula:** \`X_norm = (X - X_min) / (X_max - X_min)\`
- Compresses all values bounded strictly between 0 and 1.
- Sensitive to extreme outliers (an outlier will squash inliers into a tiny subrange).
- Best for neural networks, image pixel intensities, and algorithms requiring bounded values.

### 2. Z-Score Standardization (Standard Normal Distribution)
- **Formula:** \`Z = (X - μ) / σ\`
- Centers data around mean \`μ = 0\` with unit standard deviation \`σ = 1\`.
- Preserves relative distance and handles outliers much better.
- Recommended for Linear Regression (DS09), Logistic Regression (DS10), SVM, and PCA.

\`\`\`python
from sklearn.preprocessing import MinMaxScaler, StandardScaler
import numpy as np

data = np.array([[10], [20], [30], [100]]) # 100 is an outlier

minmax = MinMaxScaler().fit_transform(data)
zscore = StandardScaler().fit_transform(data)
\`\`\`
`
  }
];

function askAiPrompt(promptText) {
  const input = document.getElementById('ai-user-input');
  if (input) {
    input.value = promptText;
  }
  handleAiQuestionSubmit(null);
}

function handleAiQuestionSubmit(event) {
  if (event) event.preventDefault();

  const input = document.getElementById('ai-user-input');
  if (!input) return;
  const question = input.value.trim();
  if (!question) return;

  const chatHistory = document.getElementById('ai-chat-history');
  if (!chatHistory) return;

  // 1. Append User Message
  const userMsgDiv = document.createElement('div');
  userMsgDiv.className = 'ai-message user';
  userMsgDiv.innerHTML = `
    <div class="ai-msg-avatar" style="overflow:hidden;">
      <img src="${AppState.profile.avatar_path || 'assets/profile.jpg'}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" onerror="this.parentElement.textContent='👤';">
    </div>
    <div>
      <strong>${escapeHtml(AppState.profile.full_name || 'Chowda Anand')}:</strong>
      <p style="margin-top:0.35rem;color:#F1F5F9;background:rgba(99,102,241,0.12);padding:0.6rem 0.85rem;border-radius:8px;border:1px solid rgba(99,102,241,0.25);display:inline-block;text-align:left;">
        ${escapeHtml(question)}
      </p>
    </div>
  `;
  chatHistory.appendChild(userMsgDiv);
  input.value = '';
  chatHistory.scrollTop = chatHistory.scrollHeight;

  // 2. Append Thinking Indicator
  const thinkingId = 'ai-thinking-' + Date.now();
  const thinkingDiv = document.createElement('div');
  thinkingDiv.className = 'ai-message assistant';
  thinkingDiv.id = thinkingId;
  thinkingDiv.innerHTML = `
    <div class="ai-msg-avatar">🤖</div>
    <div>
      <strong>Data Science Copilot:</strong>
      <p style="margin-top:0.35rem;color:#94A3B8;font-style:italic;">
        <span class="spinner" style="display:inline-block;margin-right:0.4rem;"></span>
        Synthesizing academic explanation...
      </p>
    </div>
  `;
  chatHistory.appendChild(thinkingDiv);
  chatHistory.scrollTop = chatHistory.scrollHeight;

  // 3. Generate Intelligent Response
  setTimeout(() => {
    const responseHtml = generateAiResponseContent(question);
    const target = document.getElementById(thinkingId);
    if (target) {
      target.innerHTML = `
        <div class="ai-msg-avatar">🤖</div>
        <div style="flex:1;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong>Data Science Copilot:</strong>
            <span style="font-size:0.7rem;color:#64748B;">MBU Academic Knowledge Base</span>
          </div>
          <div style="margin-top:0.5rem;color:#E2E8F0;line-height:1.65;font-size:0.86rem;">
            ${responseHtml}
          </div>
        </div>
      `;
    }
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }, 450);
}

function generateAiResponseContent(query) {
  const qLower = query.toLowerCase();

  // 1. Search Knowledge Base
  for (const item of AI_KNOWLEDGE_BASE) {
    if (item.keywords.some(k => qLower.includes(k))) {
      return formatMarkdown(item.answer);
    }
  }

  // 2. Search Experiments DS01 to DS10
  const matchExp = AppState.experiments.find(e => 
    qLower.includes(e.code.toLowerCase()) || 
    qLower.includes(e.title.toLowerCase())
  );
  if (matchExp) {
    return formatMarkdown(`
### Experiment ${matchExp.code}: ${matchExp.title}

- **Academic Objective:** ${matchExp.objective}
- **Required Libraries:** \`${matchExp.required_libraries}\`
- **Output Expectations:** ${matchExp.output_expectations}

\`\`\`python
# Starter code snippet for ${matchExp.code}
${matchExp.starter_code.slice(0, 320)}...
\`\`\`

*Tip:* You can run and modify this experiment live under the **Lab Practice** tab!
`);
  }

  // 3. Fallback Dynamic Generator
  return formatMarkdown(`
### Insight for: "${query}"

In Data Science and Machine Learning at **Mohan Babu University**, this concept connects to several core statistical and algorithmic principles:

1. **Analytical Formulation:**
   - When evaluating data or modeling outcomes, distinguish between sample properties (observed empirical data) and population parameters (theoretical truth).
   - Ensure proper validation (e.g., cross-validation or train/test holdouts) to prevent data leakage and overfitting.

2. **Practical Python Implementation:**
\`\`\`python
import numpy as np
import pandas as pd

# Core workflow pattern
# 1. Load & clean data -> 2. Transform/scale -> 3. Fit model -> 4. Evaluate metrics
\`\`\`

3. **Recommended Exploration:**
   - Open the **Live Code Sandbox** tab to test this concept with live Python code.
   - Explore **CSV Studio** to inspect distributions and verify data cleanliness.

*Feel free to ask about any specific formula, code bug, or lab experiment (DS01 to DS10)!*
`);
}


function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 240ms ease';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}
