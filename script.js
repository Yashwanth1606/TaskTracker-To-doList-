// script.js - renders tasks and status donuts and includes examples for Google Sheets fetching

// Helper function to get today's date as YYYY-MM-DD string
function getTodayDateString() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Task model now includes: id, title, description, priority, status, created, started, deadline
const sampleTasks = [
  {
    id: 1,
    title: 'Design homepage wireframe',
    description: 'Create initial wireframe for homepage layout',
    priority: 'High',
    status: 'Not Started',
    created: getTodayDateString(),
    started: null,
    deadline: null
  },
  {
    id: 2,
    title: 'Review PR feedback',
    description: 'Go through the PR comments and make adjustments',
    priority: 'High',
    status: 'In Progress',
    created: getTodayDateString(),
    started: getTodayDateString() + 'T09:30',
    deadline: getTodayDateString()
  },
  {
    id: 3,
    title: 'Update documentation',
    description: 'Add new API endpoints to the docs',
    priority: 'Medium',
    status: 'Not Started',
    created: getTodayDateString(),
    started: null,
    deadline: getTodayDateString()
  },
  {
    id: 4,
    title: 'Fix responsive bug',
    description: 'Mobile layout breaks on tablet screens',
    priority: 'High',
    status: 'In Progress',
    created: '2025-01-13',
    started: '2025-01-15T11:00',
    deadline: null
  },
  {
    id: 5,
    title: 'Write unit tests',
    description: 'Add test coverage for auth module',
    priority: 'Medium',
    status: 'Completed',
    created: '2025-01-10',
    started: '2025-01-12T10:00',
    deadline: '2025-01-15'
  }
];

const tasksListEl = document.querySelector('.tasks-list');
const inprogressListEl = document.querySelector('.inprogress-list');
const deadlineListEl = document.querySelector('.deadline-list');
const completedListEl = document.getElementById('completedList');
const pctCompletedEl = document.getElementById('pctCompleted');
const pctInProgressEl = document.getElementById('pctInProgress');
const pctNotStartedEl = document.getElementById('pctNotStarted');

function renderTasks(tasks){
  // Clear all sections
  tasksListEl.innerHTML = '';
  inprogressListEl.innerHTML = '';
  deadlineListEl.innerHTML = '';
  completedListEl.innerHTML = '';

  const today = getTodayDateString();
  let tasksCount = 0, inProgressCount = 0, deadlineCount = 0, completedCount = 0;

  // Helper function to create a task card element
    function createTaskCard(task, showDescription = true) {
    const t = document.createElement('div');
    t.className = 'task';
    const marker = document.createElement('div');
    marker.className = 'left-marker';
    
    if (task.status === 'Completed') marker.style.background = '#0dbb7b';
    else if (task.status === 'In Progress') marker.style.background = '#1e90ff';
    else marker.style.background = '#ff6b6b';

    const content = document.createElement('div');
    content.className = 'content';
    const title = document.createElement('h4');
    title.textContent = task.title;
      if (!showDescription) {
        content.appendChild(title);
        t.appendChild(marker);
        t.appendChild(content);
        return t;
      }
    const desc = document.createElement('p');
    desc.textContent = task.description;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `<span>Priority: ${task.priority}</span><span>Status: ${task.status}</span>`;
    
    content.appendChild(title);
    content.appendChild(desc);
    content.appendChild(meta);
    
    t.appendChild(marker);
    t.appendChild(content);
    return t;
  }

  // Process all tasks
  tasks.forEach(task => {
    if (task.status === 'Completed') {
      // Add to completed section
      completedCount++;
      const citem = document.createElement('div');
      citem.className = 'completed-item';
      citem.innerHTML = `<div class="info"><h5>${task.title}</h5><p>${task.description}</p></div><div class="when">Completed</div>`;
      completedListEl.appendChild(citem);
    } else {
      // Filter into three active sections
      
      // Section 1: Tasks created today, not yet started
      if (task.created === today && task.status === 'Not Started') {
        tasksCount++;
          tasksListEl.appendChild(createTaskCard(task, false));
      }
      
      // Section 2: In Progress - sorted by longest-working-duration (oldest started first)
      if (task.status === 'In Progress' && task.started && !task.deadline) {
        inProgressCount++;
        inprogressListEl.appendChild(createTaskCard(task));
      }
      
      // Section 3: Tasks with deadline today
      if (task.deadline === today) {
        deadlineCount++;
        deadlineListEl.appendChild(createTaskCard(task));
      }
    }
  });

  // Sort in-progress section by longest working duration (oldest started first)
  const inprogressCards = Array.from(inprogressListEl.querySelectorAll('.task'));
  if (inprogressCards.length > 1) {
    inprogressCards.sort((a, b) => {
      // Find corresponding tasks to get started times
      const aTask = tasks.find(t => t.title === a.querySelector('h4').textContent);
      const bTask = tasks.find(t => t.title === b.querySelector('h4').textContent);
      if (aTask && bTask && aTask.started && bTask.started) {
        return new Date(aTask.started) - new Date(bTask.started);
      }
      return 0;
    });
    inprogressListEl.innerHTML = '';
    inprogressCards.forEach(card => inprogressListEl.appendChild(card));
  }

  // Update status percentages
  const totalCount = tasks.length || 1;
  const completedTotal = tasks.filter(t => t.status === 'Completed').length;
  const inProgressTotal = tasks.filter(t => t.status === 'In Progress').length;
  const notStartedTotal = tasks.filter(t => t.status === 'Not Started').length;

  const pctCompleted = Math.round((completedTotal / totalCount) * 100);
  const pctInProgress = Math.round((inProgressTotal / totalCount) * 100);
  const pctNotStarted = Math.round((notStartedTotal / totalCount) * 100);

  pctCompletedEl.textContent = `${pctCompleted}%`;
  pctInProgressEl.textContent = `${pctInProgress}%`;
  pctNotStartedEl.textContent = `${pctNotStarted}%`;

  // Update donut visuals
  document.querySelectorAll('.donut').forEach((d, i) => {
    let pct = 0;
    if (i === 0) pct = pctCompleted;
    if (i === 1) pct = pctInProgress;
    if (i === 2) pct = pctNotStarted;
    d.style.setProperty('--pct', pct);
    const color = d.dataset.color || '#0dbb7b';
    d.style.setProperty('--c', color);
    d.style.background = `conic-gradient(${color} ${pct}%, #e6eef6 ${pct}%)`;
  });
}

// initial render: no tasks by default so the To-Do card is empty and only shows header/button
renderTasks(sampleTasks);

// Update the header date dynamically so it always shows today's day and date
function updateHeaderDate() {
  const headerDateEl = document.querySelector('.top-right .date');
  if (!headerDateEl) return;
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[now.getDay()];
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  headerDateEl.innerHTML = `${dayName} <span>${dd}/${mm}/${yyyy}</span>`;
}

// call it once on load
updateHeaderDate();

// set avatar initials and welcome first name based on the profile name in the sidebar
function syncProfileDisplay(){
  const nameEl = document.querySelector('.profile .name');
  const avatarEl = document.querySelector('.profile .avatar');
  const welcomeNameEl = document.querySelector('.welcome-name');
  if(!nameEl) return;

  const full = String(nameEl.textContent || '').trim();
  if(!full) return;
  const parts = full.split(/\s+/);
  const firstName = parts[0] || full;

  // initials: first char of first and last (if present)
  let initials = '';
  if(parts.length === 1){
    initials = (parts[0][0] || '').toUpperCase();
  } else {
    initials = ((parts[0][0] || '') + (parts[parts.length-1][0] || '')).toUpperCase();
  }

  if(avatarEl) avatarEl.textContent = initials;
  // make avatar focusable + create tooltip with email (hide the visible email in the sidebar)
  const emailEl = document.querySelector('.profile .email');
  if(emailEl && avatarEl){
    const emailText = String(emailEl.textContent || '').trim();
    // hide the visible email in the sidebar
    emailEl.style.display = 'none';

      // make avatar keyboard-focusable to reveal tooltip
      avatarEl.setAttribute('tabindex','0');

      // attach tooltip to the .profile container but position it above the avatar
      const profileEl = document.querySelector('.profile');
      const avatarElLocal = avatarEl; // use existing avatar element
      let tooltip = profileEl ? profileEl.querySelector('.avatar-tooltip') : null;
      if(!tooltip && profileEl){
        tooltip = document.createElement('div');
        tooltip.className = 'avatar-tooltip';
        profileEl.appendChild(tooltip);
      }
    tooltip.textContent = emailText;
    // also put email on data-email attribute if needed
    avatarEl.dataset.email = emailText;
      // connect accessible relation
      if(tooltip) {
        tooltip.id = tooltip.id || 'avatar-tooltip';
        avatarEl.setAttribute('aria-describedby', tooltip.id);
      }

      // position tooltip above the avatar so it doesn't overlap other elements
          // expose a shared helper to accurately position the avatar tooltip above the avatar
          function positionTooltipAbove(){
            if(!tooltip || !avatarElLocal || !profileEl) return;
            // measure positions relative to profileEl
            const avatarRect = avatarElLocal.getBoundingClientRect();
            const profileRect = profileEl.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            // compute left so tooltip is centered above avatar
            const left = (avatarRect.left - profileRect.left) + (avatarRect.width / 2) - (tooltipRect.width / 2);
            const top = (avatarRect.top - profileRect.top) - tooltipRect.height - 8; // 8px gap

            tooltip.style.left = Math.max(6, left) + 'px';
            tooltip.style.top = Math.max(-9999, top) + 'px';
          }

      // update position after DOM paint when tooltip is added
      requestAnimationFrame(()=>{
        positionTooltipAbove();
      });

      // reposition on resize or scroll
      window.addEventListener('resize', positionTooltipAbove);
      window.addEventListener('scroll', positionTooltipAbove, true);
  }
  if(welcomeNameEl) welcomeNameEl.textContent = firstName;
}

// run it on load
syncProfileDisplay();

// tap/click support for touch devices — toggle tooltip on the .profile element
// Config: how long (ms) to auto-dismiss tooltip on touch devices after opening
const TOOLTIP_AUTO_DISMISS_MS = 3000;

function attachTooltipTapSupport(){
  const profileEl = document.querySelector('.profile');
  if(!profileEl) return;
  const avatarEl = profileEl.querySelector('.avatar');
  if(!avatarEl) return;

  let autoDismissTimer = null;

  const closeTooltip = () => {
    profileEl.classList.remove('tooltip-visible');
    avatarEl.setAttribute('aria-expanded','false');
    if(autoDismissTimer){
      clearTimeout(autoDismissTimer);
      autoDismissTimer = null;
    }
  };

  const toggleTooltip = (e) => {
    // keep clicks on the avatar from bubbling to the document close handler
    e.stopPropagation();
    const isVisible = profileEl.classList.toggle('tooltip-visible');
    avatarEl.setAttribute('aria-expanded', String(isVisible));

    // If this is a touch/coarse pointer device and tooltip opened, auto-dismiss after a timeout
    const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    if(isVisible && isTouch){
      if(autoDismissTimer) clearTimeout(autoDismissTimer);
      autoDismissTimer = setTimeout(()=>{
        closeTooltip();
      }, TOOLTIP_AUTO_DISMISS_MS);
    }
    // if closed manually clear timer
    if(!isVisible && autoDismissTimer){
      clearTimeout(autoDismissTimer);
      autoDismissTimer = null;
    }
  };

  // toggle on click/tap for touch / small-pointer devices. Also works for mouse if user clicks.
  avatarEl.addEventListener('click', (e)=>{
    // only toggle where appropriate (touch/small pointer) but allow click too
    toggleTooltip(e);
    // reposition if tooltip is shown (wrapped content may change tooltip width/height)
    setTimeout(()=>{
      // small delay to allow layout changes
      const evt = new Event('resize');
      window.dispatchEvent(evt);
    }, 0);
  });

  // accessibility: toggle with Enter / Space when avatar focused
  avatarEl.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      toggleTooltip(e);
    }
  });

  // close when clicking anywhere outside the profile
  document.addEventListener('click', (e)=>{
    if(profileEl.classList.contains('tooltip-visible') && !profileEl.contains(e.target)){
      closeTooltip();
    }
  });

  // close on Escape
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeTooltip();
  });
}

attachTooltipTapSupport();

/* -------------------------
  Google Sheets connection examples

  1) If your sheet is PUBLIC (easiest):
     - In Google Sheets: File → Publish to web → choose CSV for the sheet.
     - You get a URL like:
       https://docs.google.com/spreadsheets/d/<SHEET_ID>/export?format=csv&gid=<GID>
     - Then fetch from frontend:
       const csvUrl = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0';
       fetch(csvUrl)
         .then(r => r.text())
         .then(txt => {
           // simple CSV parse (doesn't handle quotes/commas inside fields)
           const rows = txt.trim().split('\\n').map(r => r.split(','));
           const headers = rows.shift().map(h => h.trim());
           const data = rows.map(row => {
             const obj = {};
             row.forEach((c,i)=> obj[headers[i]] = c || '');
             return obj;
           });
           // map your sheet columns to task shape
           const tasks = data.map((r, idx)=>({
             id: idx+1,
             title: r.Title || r.title,
             description: r.Description || r.description,
             priority: r.Priority || 'Low',
             status: r.Status || 'Not Started',
             created: r.Created || '',
             image: ''
           }));
           renderTasks(tasks);
         });

  2) If your sheet is PRIVATE: use the Google Sheets API server-side
     - Use service account or OAuth credentials on your server.
     - Server fetches sheet via Google Sheets API and returns JSON to the frontend.
     - This keeps API keys/credentials secret and avoids CORS/public exposure.

  Note on CORS & security:
   - Public CSV approach is easiest for quick prototypes but makes data public.
   - Private sheets require a backend proxy (recommended for production).

------------------------- */
