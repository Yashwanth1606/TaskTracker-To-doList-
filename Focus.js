const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://taskmanager-05hb.onrender.com";



const userId = localStorage.getItem('userId');
const taskListEl = document.getElementById('taskList');
const searchInput = document.getElementById('taskSearch');

let allTasks = [];
let selectedTask = null;

/* =========================
   LOAD TASKS (NOT COMPLETED)
========================= */
async function loadTasks() {
  if (!userId) return;

  const res = await fetch(`${API_BASE}/tasks?userId=${userId}`);
  const data = await res.json();

  allTasks = (data.tasks || []).filter(
    t => t.status !== 'Completed'
  );

  renderTasks(allTasks);
}

function renderTasks(tasks) {
  taskListEl.innerHTML = '';
  tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'focus-task';
    div.textContent = task.title;
    div.onclick = () => selectTask(task, div);
    taskListEl.appendChild(div);
  });
}

function selectTask(task, el) {
  selectedTask = task;
  document.querySelectorAll('.focus-task')
    .forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

/* =========================
   SEARCH
========================= */
searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase();
  renderTasks(
    allTasks.filter(t => t.title.toLowerCase().includes(q))
  );
});

/* =========================
   TIMER
========================= */
let timer = null;
let remaining = 25 * 60;

const display = document.getElementById('timerDisplay');
const durationSelect = document.getElementById('focusDuration');

durationSelect.addEventListener('change', () => {
  remaining = Number(durationSelect.value) * 60;
  updateDisplay();
});

function updateDisplay() {
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  display.textContent = `${m}:${String(s).padStart(2,'0')}`;
}

document.getElementById('startTimer').onclick = () => {
  if (!selectedTask) {
    alert('Select a task first');
    return;
  }
  if (timer) return;

  timer = setInterval(() => {
    remaining--;
    updateDisplay();
    if (remaining <= 0) {
      clearInterval(timer);
      timer = null;
      alert('Focus session completed 🎉');
    }
  }, 1000);
};

document.getElementById('pauseTimer').onclick = () => {
  clearInterval(timer);
  timer = null;
};

loadTasks();
updateDisplay();
