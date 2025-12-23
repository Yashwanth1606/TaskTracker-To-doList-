# Task Manager Dashboard

A modern, responsive task management dashboard built with vanilla HTML, CSS, and JavaScript. Features a dynamic layout with a sidebar navigation, three-section to-do container, task status visualization, and completed task tracking.

## Quick Start
Open `index.html` in a browser (or run `python -m http.server 8080` for local development) to see the dashboard with today's date, task sections, and completed task display.



## Features

### 1. **Dynamic Date Display**
- Header automatically displays today's day name and date (e.g., "Wednesday 04/12/2025")
- Updates automatically based on system date
- Located in the top-right corner of the topbar
- Function: `updateHeaderDate()` formats the current date and displays day name

### 2. **Responsive Layout**
- Fully fluid and responsive design using CSS `clamp()` for flexible sizing
- Adapts seamlessly across desktop (>980px), tablet (520-980px), and mobile (<520px) screens
- Sidebar always visible with icon-only mode on small screens (<520px)
- Main content uses flexbox grid for proper alignment and stretching
- Single unified background for cohesive UI appearance

### 3. **Sidebar Navigation & Profile**
- Red gradient background (#ff6b6b to #ff8f8f) with circular avatar at top
- Avatar displays user initials (extracted and capitalized from profile name)
- Navigation items with inline SVG icons (Home, Lightning, Clipboard, Folder, Gear, Help)
- **Nav items centered vertically with 16px spacing** between buttons
- Logout button fixed at bottom
- Icon-only mode on mobile: SVG icons only, text labels hidden

### 4. **Avatar & Profile Display**
- Circular avatar: 45px desktop, 44px tablet, 36px mobile (explicit sizes prevent zoom distortion)
- Shows user initials in uppercase on transparent white background
- **Hover/click/focus reveals email tooltip** with auto-dismiss on touch (3000ms configurable)
- Dynamic welcome message with first name from profile
- Multi-layer tooltip interaction:
  - Mouse hover, keyboard focus, click/tap, Enter/Space, Escape to close
  - Touch devices auto-dismiss after 3000ms

### 5. **Three-Section To-Do Container** ⭐ (NEW TODAY)
Three horizontal sections with equal width (33.333% each), white background, subtle borders:

#### **Section 1: Tasks (Blue #dbeafe)**
- Tasks created today with "Not Started" status
- Display: **name only** (description hidden)
- Filter: `task.created === today && task.status === 'Not Started'`

#### **Section 2: In Progress (Green #dcfce7)**
- Tasks currently being worked on (status = "In Progress")
- Sorted by **longest duration** (oldest `started` timestamp first)
- Display: full details visible
- Filter: `task.status === 'In Progress' && task.started && !task.deadline`

#### **Section 3: Deadline (Red #fee2e2)**
- Tasks with deadline today
- Display: full details visible
- Filter: `task.deadline === today`

**Common styling:**
- Section headings: **centered, uppercase, 13px, bold**
- Task titles: **12px, normal weight (#0f172a)** — headers stand out
- Colored backgrounds on individual task cards (not containers)
- White section containers with subtle green borders and shadows

### 6. **Task Status Visualization (Donuts)** ⭐ (REPOSITIONED TODAY)
Three donut charts showing completion percentages:
- **Completed**: Green arc
- **In Progress**: Blue arc  
- **Not Started**: Red arc

**Percentages:**
- Positioned **absolutely inside 46px white inner circle**
- Centered with transform translate(-50%, -50%)
- Font: 12px, bold, dark green
- Does not overlap ring

**Labels:**
- Appear **below each donut**
- Font: 12px, **bold**, dark green
- Text: "Completed", "In Progress", "Not Started"

### 7. **Completed Task Container** ⭐ (NEW TODAY)
Shows **most recent completed task only**:
- Sorted by `completedAt` > `started` > `created` (newest first)
- Display: title only, no description
- Styling: 
  - Green gradient background (#ecfdf5 → #dcfce7)
  - Green border (rgba(16,185,129,0.12)) with shadow
  - Bold dark green title (#065f46)
- **"Completed" badge**: 6px radius, green border/text, semi-transparent background

### 8. **Responsive Breakpoints**

| Desktop (>980px) | Tablet (520-980px) | Mobile (<520px) |
|---|---|---|
| Sidebar: ~260px | Sidebar: ~220px | Sidebar: ~180px |
| Avatar: 45px | Avatar: 44px | Avatar: 36px |
| Full nav text | Compact nav | Icon-only nav |
| All columns visible | All columns visible | Right column hidden |

### 9. **CSS Variables** (Centralized Theming)
```css
--bg: #f5f7fa;                    /* Page background */
--card: #ffffff;                  /* Card background */
--accent: #ff6b6b;                /* Sidebar color */
--shadow: 0 6px 18px ...;         /* Standard shadow */
--gap: 18px;                      /* Standard spacing */
--avatar-size-desktop: 45px;      /* Desktop avatar */
--avatar-size-md: 44px;           /* Tablet avatar */
--avatar-size-sm: 36px;           /* Mobile avatar */
--avatar-tooltip-max: 220px;      /* Tooltip width */
```

### 10. **Accessibility Features**
- Avatar keyboard-focusable (tabindex="0")
- Tooltip via Enter/Space, Escape to close
- Touch auto-dismiss with configurable timeout
- Semantic HTML with proper heading hierarchy
- WCAG-compliant color contrast
- Responsive viewport support

## Technical Stack

- **HTML5**: Semantic markup
- **CSS3**: Flexbox, Grid, custom properties, media queries, conic-gradient
- **JavaScript**: Vanilla (no frameworks) — pure DOM manipulation
- **SVG Icons**: Inline, scalable, themable with currentColor

## File Structure

```
d:\My Projects\
├── index.html       # Main markup (sections, donuts, completed container)
├── script.css       # Responsive styling (grid, flexbox, media queries)
├── script.js        # Task rendering, filtering, profile sync, date updates
└── readme.md        # This file
```

## Configuration

### Tooltip Auto-Dismiss Timeout
`script.js`, line ~269:
```javascript
const TOOLTIP_AUTO_DISMISS_MS = 3000;  // milliseconds
```

### Avatar Sizes
`script.css` variables:
```css
--avatar-size-desktop: 45px;
--avatar-size-md: 44px;
--avatar-size-sm: 36px;
```

### Tooltip Max Width
`script.css`:
```css
--avatar-tooltip-max: 220px;
```

## Sample Data

5 sample tasks included (`sampleTasks` array in `script.js`):
1. **Design homepage wireframe** — Not Started, created today
2. **Review PR feedback** — In Progress, deadline today
3. **Update documentation** — Not Started, deadline today
4. **Fix responsive bug** — In Progress, no deadline
5. **Write unit tests** — Completed, completed today

### Task Object Structure
```javascript
{
  id: 1,
  title: 'Task name',
  description: 'Details',
  priority: 'High|Medium|Low',
  status: 'Not Started|In Progress|Completed',
  created: 'YYYY-MM-DD',
  started: 'YYYY-MM-DDTHH:MM',
  deadline: 'YYYY-MM-DD',
  completedAt: 'YYYY-MM-DDTHH:MM'
}
```

## Usage

### Local Development
```bash
cd "d:\My Projects"
python -m http.server 8080
# Open browser to http://localhost:8080
```

### Adding Tasks
Extend `sampleTasks` array in `script.js`:
```javascript
{
  id: 6,
  title: 'New task',
  description: 'Description here',
  priority: 'High',
  status: 'In Progress',
  created: getTodayDateString(),
  started: getTodayDateString() + 'T10:00',
  deadline: getTodayDateString(),
  completedAt: null
}
```

## Browser Support

Modern browsers with:
- CSS Flexbox & Grid
- CSS Custom Properties
- CSS clamp() and conic-gradient
- ES6 JavaScript
- getBoundingClientRect() API

## Recent Changes (Today's Session) ✅

- ✅ Three-Section To-Do Layout (horizontal, equal widths)
- ✅ Color-Coded Tasks (blue/green/red on individual cards)
- ✅ Name-Only Display (Tasks section, compact view)
- ✅ Section Headings Centered (uppercase, bold, visual hierarchy)
- ✅ Nav Item Spacing Increased (16px gap, centered vertically)
- ✅ Donut Percentages Repositioned (inside 46px white circle, centered)
- ✅ Completed Task Display (most recent only, green styling)
- ✅ Badge Border-Radius (6px, subtle rounded corners)
- ✅ Text Size Reduction (12px titles, font-weight 400)
- ✅ White Section Containers (shadows, subtle borders)

## Future Enhancements

- Task add/edit/delete UI
- Local storage persistence
- Google Sheets integration
- Dark mode theme
- Drag-and-drop task management
- Advanced filtering & search
- Date range selection
- Recurring tasks
- Team collaboration

## Notes

- Avatar uses explicit pixel sizes to prevent zoom distortion across breakpoints
- Tooltip positioned via JavaScript (getBoundingClientRect) for accuracy
- Three-section filtering can be adapted to different criteria
- All colors are customizable via CSS variables or direct editing
- Completed task shows only most recent for focused, minimal view
- Section headings center-aligned for visual balance

## Notes

-- work on creating the comontes on all the things that i havemade the changes till
-- it is not updates it is done till only 3 day of development 


