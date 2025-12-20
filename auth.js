
const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "RENDER_URL_WILL_GO_HERE";


/* =========================
   LOGIN
========================= */
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    try {
      const res = await fetch('${API_BASE}/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Login failed');
        return;
      }

      // ✅ Save login session
      localStorage.setItem('userId', data.userId);
      if (data.firstName) {
        localStorage.setItem('firstName', data.firstName);
      } else {
        localStorage.removeItem('firstName');
      }

      if (data.lastName) {
        localStorage.setItem('lastName', data.lastName);
      } else {
        localStorage.removeItem('lastName');
      }

      const first = (data.firstName || '').trim();
      const last = (data.lastName || '').trim();

      const fullName = last ? `${first} ${last}` : first;

      localStorage.setItem('fullName', fullName);


      // Redirect to dashboard
      window.location.href = 'index.html';

    } catch (err) {
      console.error(err);
      alert('Server error. Is backend running?');
    }
  });
}

/* =========================
   REGISTER
========================= */
const registerForm = document.getElementById('registerForm');

if (registerForm) {
  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Read form values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const dob = document.getElementById('dob').value; // yyyy-mm-dd
    const email = document.getElementById('registerEmail').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('registerPassword').value.trim();

    // Basic validation
    if (!firstName || !lastName || !dob || !email || !phone || !password) {
      alert('Please fill all fields');
      return;
    }

    try {
      const res = await fetch('${API_BASE}/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          dob,
          email,
          phone,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Registration failed');
        return;
      }

      alert('Registration successful. Please login.');
      window.location.href = 'login.html';

    } catch (err) {
      console.error(err);
      alert('Server error. Is backend running?');
    }
  });
}
