// script.js - renders tasks and status donuts and includes examples for Google Sheets fetching

const sampleTasks = [
  {
    id: 1,
    title: "Attend Nischal's Birthday Party",
    description: "Buy gifts on the way and pick up cake from bakery. (6 PM | Fresh Elements)",
    priority: "Moderate",
    status: "Not Started",
    created: "20/06/2023",
    image: ""
  },
  {
    id: 2,
    title: "Landing Page Design for TravelDays",
    description: "Get the work done by EOD and discuss with client before leaving. (4 PM | Meeting Room)",
    priority: "Moderate",
    status: "In Progress",
    created: "20/06/2023",
    image: ""
  },
  {
    id: 3,
    title: "Presentation on Final Product",
    description: "Make sure everything is functioning and all necessities are prepared",
    priority: "Moderate",
    status: "In Progress",
    created: "19/06/2023",
    image: ""
  },
  {
    id: 4,
    title: "Walk the dog",
    description: "Take the dog to the park and bring treats as well",
    priority: "Low",
    status: "Completed",
    created: "18/06/2023",
    image: ""
  }
];

const taskListEl = document.getElementById('taskList');
const completedListEl = document.getElementById('completedList');
const pctCompletedEl = document.getElementById('pctCompleted');
const pctInProgressEl = document.getElementById('pctInProgress');
const pctNotStartedEl = document.getElementById('pctNotStarted');

function renderTasks(tasks){
  taskListEl.innerHTML = '';
  completedListEl.innerHTML = '';
  const totals = {completed:0, inProgress:0, notStarted:0};

  tasks.forEach(task=>{
    // main task card
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
    const desc = document.createElement('p');
    desc.textContent = task.description;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `<span>Priority: ${task.priority}</span><span>Status: ${task.status}</span><span>Created: ${task.created}</span>`;

    content.appendChild(title);
    content.appendChild(desc);
    content.appendChild(meta);

    t.appendChild(marker);
    t.appendChild(content);

    if(task.status === 'Completed'){
      // add to completed area
      totals.completed++;
      const citem = document.createElement('div');
      citem.className = 'completed-item';
      citem.innerHTML = `<div class="info"><h5>${task.title}</h5><p>${task.description}</p></div><div class="when">Completed</div>`;
      completedListEl.appendChild(citem);
    } else {
      taskListEl.appendChild(t);
      if(task.status === 'In Progress') totals.inProgress++;
      else totals.notStarted++;
    }
  });

  // totals for percentage calculations
  const totalCount = tasks.length || 1;
  const pctCompleted = Math.round((totals.completed/totalCount)*100);
  const pctInProgress = Math.round((totals.inProgress/totalCount)*100);
  const pctNotStarted = Math.round((totals.notStarted/totalCount)*100);

  pctCompletedEl.textContent = `${pctCompleted}%`;
  pctInProgressEl.textContent = `${pctInProgress}%`;
  pctNotStartedEl.textContent = `${pctNotStarted}%`;

  // update donut visuals
  document.querySelectorAll('.donut').forEach((d,i)=>{
    let pct = 0;
    if(i===0) pct = pctCompleted;
    if(i===1) pct = pctInProgress;
    if(i===2) pct = pctNotStarted;
    d.style.setProperty('--pct', pct);
    const color = d.dataset.color || '#0dbb7b';
    d.style.setProperty('--c', color);
    d.style.background = `conic-gradient(${color} ${pct}%, #e6eef6 ${pct}%)`;
  });

}

// initial render with sample tasks
renderTasks(sampleTasks);

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
