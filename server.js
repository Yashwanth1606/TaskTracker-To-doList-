const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());


const SHEET_ID =
  process.env.SHEET_ID ||
  '1sYhF7hBK10Ri5Ksj8mpzzJshtsg0IXEm2i_vCC_g2vg';

const KEYFILE =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, 'service-account.json');

/* =========================
   GOOGLE SHEETS CLIENT
========================= */
async function getSheetsClient() {
  const credentials = JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient });
}


function generateUserId(firstName, lastName, dob) {
  const firstLetter = firstName.trim()[0].toUpperCase();
  const lastLetter = lastName.trim()[0].toUpperCase();

  const [dd, mm, yyyy] = dob.split('-').map(Number);
  const dobSum = dd + mm + yyyy;

  const now = new Date();
  const todayDate = now.getDate();
  const timeSum =
    now.getHours() + now.getMinutes() + now.getSeconds();

  return `${firstLetter}${lastLetter}${dobSum + todayDate + timeSum}`;
}

/* =========================
   AUTH: REGISTER
========================= */
app.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, dob, email, phone, password } = req.body;

    if (!firstName || !lastName || !dob || !email || !password) {
      return res.status(400).json({ ok: false, error: 'Missing fields' });
    }

    const userId = generateUserId(firstName, lastName, dob);
    const registerDate = new Date().toISOString();

    const sheets = await getSheetsClient();

    const newRow = [
      userId,
      firstName,
      lastName,
      dob,
      email,
      phone || '',
      registerDate,
      password, // ⚠ plain text for now
      '',
      '',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Users!A:J',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [newRow] },
    });

    res.json({ ok: true, userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* =========================
   AUTH: LOGIN
========================= */
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const sheets = await getSheetsClient();
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Users!A:J',
    });

    const rows = resp.data.values || [];
    const rowIndex = rows.findIndex(
      (r) => r[4] === email && r[7] === password
    );

    if (rowIndex === -1) {
      return res.status(401).json({ ok: false, error: 'Invalid credentials' });
    }

    const userRow = rows[rowIndex];
    const loginTime = new Date().toISOString();

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Users!I${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[loginTime]] },
    });

    res.json({
      ok: true,
      userId: userRow[0],
      firstName: userRow[1],
      lastName: userRow[2],
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* =========================
   AUTH: LOGOUT
========================= */
app.post('/logout', async (req, res) => {
  try {
    const { userId } = req.body;

    const sheets = await getSheetsClient();
    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Users!A:J',
    });

    const rows = resp.data.values || [];
    const rowIndex = rows.findIndex((r) => r[0] === userId);

    if (rowIndex === -1) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    const logoutTime = new Date().toISOString();

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Users!J${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[logoutTime]] },
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* =========================
   TASKS: GET (USER FILTERED)
========================= */
app.get('/tasks', async (req, res) => {
  try {
    const userId = req.query.userId;
    const sheets = await getSheetsClient();

    const resp = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A2:J',
    });

    const rows = resp.data.values || [];

    const tasks = rows
  .map((r, index) => ({ row: index + 2, r })) // +2 because data starts at row 2
  .filter(({ r }) => r[9] === userId)
  .map(({ row, r }) => ({
    id: row, // ✅ REAL sheet row number
    date: r[0],
    time: r[1],
    title: r[2],
    description: r[3],
    priority: r[4],
    dueDate: r[5],
    status: r[6],
    started: r[7],
    completedAt: r[8],
  }));


    res.json({ ok: true, tasks });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* =========================
   TASKS: CREATE
========================= */
app.post('/tasks', async (req, res) => {
  try {
    const { title, description, priority, dueDate, status, userId } = req.body;
    if (!title || !userId) {
      return res.status(400).json({ ok: false, error: 'Missing data' });
    }

    const now = new Date();
    const isoDate = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    const newRow = [
      isoDate,
      time,
      title,
      description || '',
      priority || '',
      dueDate || '',
      status || 'Not Started',
      '',
      '',
      userId,
    ];

    const sheets = await getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A:J',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [newRow] },
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/* =========================
   TASKS: STATUS UPDATE
========================= */
app.patch('/tasks/:id', async (req, res) => {
  try {
    const sheetRow = Number(req.params.id); // ✅ REAL row number
    const { status } = req.body;

    if (!sheetRow || !status) {
      return res.status(400).json({ ok: false, error: 'Invalid data' });
    }

    const sheets = await getSheetsClient();
    const now = new Date().toISOString();

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `Sheet1!G${sheetRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[status]] },
    });

    if (status === 'In Progress') {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!H${sheetRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[now]] },
      });
    }

    if (status === 'Completed') {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `Sheet1!I${sheetRow}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[now]] },
      });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});


/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
