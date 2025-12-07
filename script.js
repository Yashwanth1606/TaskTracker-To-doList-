// script.js - renders tasks and status donuts and includes examples for Google Sheets fetching

// Helper function to get today's date as YYYY-MM-DD string
function getTodayDateString() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Task model now includes: id, title, description, priority, status, created, started, deadline, completedAt
const sampleTasks = [
  {
    id: 1,
    title: 'Design homepage wireframe',
    description: 'Create initial wireframe for homepage layout',
    priority: 'High',
    status: 'Not Started',
    created: getTodayDateString(),
    started: null,
    deadline: null,
    completedAt: null
  },
  {
    id: 2,
    title: 'Review PR feedback',
    description: 'Go through the PR comments and make adjustments',
    priority: 'High',
    status: 'In Progress',
    created: getTodayDateString(),
    started: getTodayDateString() + 'T09:30',
    deadline: getTodayDateString(),
    completedAt: null
  },
  {
    id: 3,
    title: 'Update documentation',
    description: 'Add new API endpoints to the docs',
    priority: 'Medium',
    status: 'Not Started',
    created: getTodayDateString(),
    started: null,
    deadline: getTodayDateString(),
    completedAt: null
  },
  {
    id: 4,
    title: 'Fix responsive bug',
    description: 'Mobile layout breaks on tablet screens',
    priority: 'High',
    status: 'In Progress',
    created: '2025-01-13',
    started: '2025-01-15T11:00',
    deadline: null,
    completedAt: null
  },
  {
    id: 5,
    title: 'Write unit tests',
    description: 'Add test coverage for auth module',
    priority: 'Medium',
    status: 'Completed',
    created: '2025-01-10',
    started: '2025-01-12T10:00',
    deadline: '2025-01-15',
    completedAt: getTodayDateString() + 'T14:00'
  }
];

async function loadTasksFromServer() {
  try {
    const res = await fetch('http://localhost:3000/tasks');
    if (!res.ok) throw new Error('Network response was not ok: ' + res.status);
    const data = await res.json();

    // Backend returns: { ok: true, tasks: [ { id, date, time, title, description, priority, dueDate, status, started, completedAt } ] }
    const tasks = (data.tasks || []).map((t) => ({
      id: t.id,                     // use backend id (maps to sheet row)
      title: t.title,
      description: t.description || '',
      priority: t.priority || 'Low',
      status: t.status || 'Not Started',

      // use sheet "Date" column as created date (A)
      created: t.date || getTodayDateString(),

      // read started/completed from the sheet fields (H/I)
      started: t.started || null,

      // use sheet "Due Date" column as deadline (F)
      deadline: t.dueDate || null,

      // completedAt from sheet (I)
      completedAt: t.completedAt || null
    }));

    // store globally for drag/drop updates
    window.currentTasks = tasks;

    // render and then wire drag/drop (must wire after DOM elements exist)
    renderTasks(tasks);
    if (typeof enableTaskDragAndDrop === 'function') enableTaskDragAndDrop();

  } catch (err) {
    console.error('Failed to load tasks from server', err);

    // Fallback: show no tasks (or sampleTasks if you want demo data)
    renderTasks([]);
    window.currentTasks = [];
    if (typeof enableTaskDragAndDrop === 'function') enableTaskDragAndDrop();
  }
}

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
  if(welcomeNameEl) welcomeNameEl.textContent = firstName;

  const emailEl = document.querySelector('.profile .email');
  if(emailEl && avatarEl){
    const emailText = String(emailEl.textContent || '').trim();
    emailEl.style.display = 'none';
    avatarEl.dataset.email = emailText;
  }
}

// DOM element references (these must exist before calling loadTasksFromServer/renderTasks)
const tasksListEl = document.querySelector('.tasks-list');
const inprogressListEl = document.querySelector('.inprogress-list');
const deadlineListEl = document.querySelector('.deadline-list');
const completedListEl = document.getElementById('completedList');
const pctCompletedEl = document.getElementById('pctCompleted');
const pctInProgressEl = document.getElementById('pctInProgress');
const pctNotStartedEl = document.getElementById('pctNotStarted');

// Start the app after DOM nodes and helpers are defined
loadTasksFromServer();
updateHeaderDate();
syncProfileDisplay();

// utility: title case
function toTitleCase(str) {
  return String(str || '')
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function createTaskCard(task, showDescription = true) {
  const t = document.createElement('div');
  t.className = 'task card-style';
  t.setAttribute('draggable', 'true');
  t.dataset.taskId = String(task.id);

  // drag visuals
  t.addEventListener('dragstart', function (ev) {
    ev.dataTransfer.setData('text/plain', t.dataset.taskId);
    t.classList.add('dragging');
  });
  t.addEventListener('dragend', function () {
    t.classList.remove('dragging');
  });

  // CONTENT wrapper
  const content = document.createElement('div');
  content.className = 'content';

  // Title (big)
  const title = document.createElement('div');
  title.className = 'task-title';
  title.textContent = toTitleCase(task.title || 'Untitled task');

  // Meta row container
  const meta = document.createElement('div');
  meta.className = 'task-meta';

  // Due date
  let dueText = '';
  if (task.deadline) {
    const d = new Date(task.deadline);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2,'0');
      const mm = String(d.getMonth()+1).padStart(2,'0');
      const yyyy = d.getFullYear();
      dueText = `${dd}-${mm}-${yyyy}`;
    } else {
      dueText = task.deadline;
    }
  }

  const dueEl = document.createElement('div');
  dueEl.className = 'meta-item due';
  dueEl.textContent = dueText ? `Due: ${dueText}` : '';

  // Only append due date (no priority)
  if (dueEl.textContent) meta.appendChild(dueEl);

  // Optional description (only if showDescription true)
  if (showDescription && task.description) {
    const desc = document.createElement('div');
    desc.className = 'task-desc';
    desc.textContent = task.description;
    content.appendChild(title);
    content.appendChild(desc);
    content.appendChild(meta);
  } else {
    content.appendChild(title);
    content.appendChild(meta);
  }

  t.appendChild(content);
  return t;
}

// helper to normalize dates like "12/5/2025" to "2025-12-05"
function normalizeDateString(value) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value; // already correct
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function renderTasks(tasks){
  // Clear all sections
  if (tasksListEl) tasksListEl.innerHTML = '';
  if (inprogressListEl) inprogressListEl.innerHTML = '';
  if (deadlineListEl) deadlineListEl.innerHTML = '';
  if (completedListEl) completedListEl.innerHTML = '';

  const today = getTodayDateString();
  let tasksCount = 0, inProgressCount = 0, deadlineCount = 0, completedCount = 0;

  const completedTasks = [];

  tasks.forEach(task => {
    const status = (task.status || '').trim();

    // Completed → store only, not displayed in columns
    if (status === 'Completed') {
      completedCount++;
      completedTasks.push(task);
      return;
    }

    // TASKS column → Not Started
    if (status === 'Not Started') {
      tasksCount++;
      if (tasksListEl) tasksListEl.appendChild(createTaskCard(task, false));
    }

    // IN PROGRESS column → In Progress
    if (status === 'In Progress') {
      inProgressCount++;
      if (inprogressListEl) inprogressListEl.appendChild(createTaskCard(task, false));
    }

    // DEADLINE column → Due Date = TODAY
    const normalized = normalizeDateString(task.deadline);
    if (normalized === today) {
      deadlineCount++;
      if (deadlineListEl) deadlineListEl.appendChild(createTaskCard(task, false));
    }
  });

  // Render only the most recently completed task (by completedAt, then started, then created)
  if (completedTasks.length > 0 && completedListEl) {
    function getTaskTime(t) {
      // prefer explicit completedAt, then started, then created
      const ts = t.completedAt || t.started || t.created || '';
      const d = new Date(ts);
      return isNaN(d.getTime()) ? 0 : d.getTime();
    }
    completedTasks.sort((a,b) => getTaskTime(b) - getTaskTime(a));
    const latest = completedTasks[0];
    const citem = document.createElement('div');
    citem.className = 'completed-item';
    citem.innerHTML = `<div class="info"><h5>${latest.title}</h5></div><div class="when">Completed</div>`;
    completedListEl.appendChild(citem);
  }

  // Sort in-progress section by longest working duration (oldest started first)
  if (inprogressListEl) {
    const inprogressCards = Array.from(inprogressListEl.querySelectorAll('.task'));
    if (inprogressCards.length > 1) {
      inprogressCards.sort((a, b) => {
        // Find corresponding tasks to get started times (match on .task-title text)
        const aTitleEl = a.querySelector('.task-title');
        const bTitleEl = b.querySelector('.task-title');
        const aTask = tasks.find(t => t.title === (aTitleEl ? aTitleEl.textContent : ''));
        const bTask = tasks.find(t => t.title === (bTitleEl ? bTitleEl.textContent : ''));
        if (aTask && bTask && aTask.started && bTask.started) {
          return new Date(aTask.started) - new Date(bTask.started);
        }
        return 0;
      });
      inprogressListEl.innerHTML = '';
      inprogressCards.forEach(card => inprogressListEl.appendChild(card));
    }
  }

  // Update status percentages
  const totalCount = tasks.length || 1;
  const pctCompleted = Math.round((completedCount / totalCount) * 100);
  const pctInProgress = Math.round((inProgressCount / totalCount) * 100);
  const pctNotStarted = Math.round((tasksCount / totalCount) * 100);

  if (pctCompletedEl) pctCompletedEl.textContent = `${pctCompleted}%`;
  if (pctInProgressEl) pctInProgressEl.textContent = `${pctInProgress}%`;
  if (pctNotStartedEl) pctNotStartedEl.textContent = `${pctNotStarted}%`;

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

// --- Drag & Drop wiring for Tasks -> In Progress -> Completed (deadline column read-only) ---
function enableTaskDragAndDrop() {
  const tasksCol = document.querySelector('.tasks-list');
  const inprogressCol = document.querySelector('.inprogress-list');
  const completedCol = document.getElementById('completedList');

  const interactiveCols = [
    { el: tasksCol, status: 'Not Started' },
    { el: inprogressCol, status: 'In Progress' },
    { el: completedCol, status: 'Completed' }
  ];

  interactiveCols.forEach(col => {
    if (!col.el) return;

    col.el.addEventListener('dragover', function (ev) {
      ev.preventDefault();
      col.el.classList.add('drag-over');
    });

    col.el.addEventListener('dragleave', function () {
      col.el.classList.remove('drag-over');
    });

    col.el.addEventListener('drop', async function (ev) {
      ev.preventDefault();
      col.el.classList.remove('drag-over');

      const taskId = ev.dataTransfer.getData('text/plain');
      if (!taskId) return;

      const draggedEl = document.querySelector(`[data-task-id="${taskId}"]`);
      if (!draggedEl) return;

      // append the card visually
      col.el.appendChild(draggedEl);

      // update in-memory tasks copy
      const idNum = isNaN(taskId) ? taskId : Number(taskId);
      if (window.currentTasks && Array.isArray(window.currentTasks)) {
        const t = window.currentTasks.find(x => x.id === idNum);
        if (t) t.status = col.status;
      }

      // persist to backend
      try {
        await updateTaskStatusOnServer(idNum, col.status);
      } catch (err) {
        console.error('Failed to update task status', err);
        if (typeof loadTasksFromServer === 'function') loadTasksFromServer(); // revert visually
        return;
      }

      // refresh widgets (donuts, completed card) by reloading tasks from server
      if (typeof loadTasksFromServer === 'function') {
        setTimeout(() => loadTasksFromServer(), 200);
      }
    });
  });
}

// Persist status change to backend. Adjust path if your server uses different route.
async function updateTaskStatusOnServer(id, newStatus) {
  const url = `http://localhost:3000/tasks/${id}`; // expects PATCH /tasks/:id on your server
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  });
  if (!res.ok) throw new Error('Server error: ' + res.status);
  return res.json();
}

/* ------------------ Add Task Modal & Submit ------------------ */
(function () {
  const backdrop = document.getElementById('at_backdrop');
  const openBtn = document.getElementById('addTaskSmall'); // top + button (adjust id if needed)
  const openBtnTop = document.getElementById('createTaskBtn'); // other button id
  const closeX = document.getElementById('at_close_x');
  const form = document.getElementById('at_form');
  const inputTitle = document.getElementById('at_title');
  const inputDesc = document.getElementById('at_description');
  const inputPriority = document.getElementById('at_priority');
  const inputDue = document.getElementById('at_dueDate');
  const submitBtn = document.getElementById('at_submit');
  const cancelBtn = document.getElementById('at_cancel');

  function openModal(){
    if(!backdrop) return;
    if (inputTitle) inputTitle.value = '';
    if (inputDesc) inputDesc.value = '';
    if (inputPriority) inputPriority.value = 'High';
    if (inputDue) inputDue.value = '';
    setTimeout(()=> inputTitle && inputTitle.focus(), 10);
    backdrop.style.display = 'flex';
    backdrop.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }

  function closeModal(){
    if(!backdrop) return;
    backdrop.style.display = 'none';
    backdrop.setAttribute('aria-hidden','true');
    document.body.style.overflow = ''; // restore
  }

  // OPEN MODAL (your button ONLY)
  if (openBtn) {
    openBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  } else {
    // it's fine if button id differs; top-button handled below
  }
  if (openBtnTop) {
    openBtnTop.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

  // CLOSE MODAL
  if (closeX) closeX.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // CLOSE BY CLICKING ON BACKDROP
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });
  }

  // SUBMIT FORM → SEND TO BACKEND
  if (form) {
    form.addEventListener('submit', async function(ev){
      ev.preventDefault();

      const title = (inputTitle && inputTitle.value || '').trim();
      const description = (inputDesc && inputDesc.value || '').trim();
      const priority = (inputPriority && inputPriority.value) || 'High';
      const dueDate = (inputDue && inputDue.value) || '';
      const status = "Not Started";  // Default

      if(!title){
        alert("Enter a task title");
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Adding.";
      }

      try {
        const res = await fetch("http://localhost:3000/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, priority, dueDate, status })
        });

        if (!res.ok) throw new Error('Network error: ' + res.status);

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Done";
        }

        // close and refresh
        closeModal();
        setTimeout(() => loadTasksFromServer(), 700);

      } catch (err){
        console.error("Add task failed", err);
        alert("Error adding task");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Done";
        }
      }
    });
  }

})(); // end IIFE
