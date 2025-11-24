
const q = (id) => document.getElementById(id);
const setText = (id, v) => { const el = q(id); if (el) el.textContent = v ?? "-"; };

function getUsers() {
  const saved = localStorage.getItem("userData");
  if (saved) return JSON.parse(saved);
  localStorage.setItem("userData", JSON.stringify(loginData)); // from data.js
  return loginData;
}

function getCurrentUser() {
  const u = localStorage.getItem("currentUser");
  return u ? JSON.parse(u) : null;
}

function saveUsers(users) {
  localStorage.setItem("userData", JSON.stringify(users));
}

function saveCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

function removeCurrentUser() {
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

// ---- LOGIN ----
function handleLogin(e) {
  e.preventDefault();
  const username = q("username").value.trim();
  const password = q("password").value.trim();
  const users = getUsers();
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) {
    const box = q("error");
    box.textContent = "Invalid username or password";
    box.style.display = "block";
    return;
  }
  saveCurrentUser(user);
  window.location.href = "dashboard.html";
}

// ---- BOOKS ----
function getBooks() {
  const saved = localStorage.getItem("booksData");
  if (saved) return JSON.parse(saved);
  localStorage.setItem("booksData", JSON.stringify(booksData)); // from data.js
  return booksData;
}

function saveBooks(books) {
  localStorage.setItem("booksData", JSON.stringify(books));
}


function initDashboard() {
  let user = getCurrentUser();
  if (!user) { window.location.href = "index.html"; return; }

  const users = getUsers();
  const idx = users.findIndex((u) => u.username === user.username);
  user = idx !== -1 ? users[idx] : user;

  user.borrowed = user.borrowed || [];
  user.maxBorrow = user.maxBorrow ?? 3;
  user.totalBorrowed = user.totalBorrowed ?? 0;
  user.currentlyBorrowed = user.borrowed.length;
  user.fines = user.fines ?? 0;

  if (idx !== -1) { users[idx] = user; saveUsers(users); }
  saveCurrentUser(user);

  renderUser(user);
  renderStats(user);
  renderBooks(getBooks(), user);
  renderBorrowed(user);
}


function renderUser(user) {
  setText("loggedUser", user.fullName || user.username);
  const avatar = q("userAvatar");
  if (avatar) {
    const initials = (user.fullName || user.username).split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);
    avatar.textContent = initials;
  }
  setText("detailFullName", user.fullName);
  setText("detailUsername", user.username);
  setText("detailEmail", user.email);
  setText("detailBranch", user.branch);
  setText("detailYear", user.year);
  setText("detailRoll", user.rollNo);
  setText("detailJoinedOn", user.joinedOn);
}

function renderStats(user) {
  setText("statCurrentBorrowed", user.currentlyBorrowed);
  setText("statTotalBorrowed", user.totalBorrowed);
  setText("statMaxBorrow", user.maxBorrow);
  setText("statFines", user.fines);
}

function renderBooks(books, user) {
  const tbody = q("booksTableBody");
  const msg = q("noBooksMessage");
  if (!tbody) return;

  const borrowedIds = new Set(user.borrowed.map(b => b.id));
  const available = books.filter(b => b.availableCopies > 0);
  tbody.innerHTML = "";

  if (!available.length) {
    if (msg) msg.style.display = "block";
    return;
  }
  if (msg) msg.style.display = "none";

  available.forEach(book => {
    const tr = document.createElement("tr");
    const disabled = borrowedIds.has(book.id);
    tr.innerHTML = `
      <td>
        <div class="book-title-cell">
          <span class="book-title">${book.title}</span>
          <span class="book-category">${book.category || ""}</span>
        </div>
      </td>
      <td>${book.author}</td>
      <td>${book.category || "-"}</td>
      <td>${book.year || "-"}</td>
      <td>${book.availableCopies}/${book.totalCopies}</td>
      <td>
        <button class="borrow-button" data-id="${book.id}" ${disabled ? "disabled" : ""}>
          ${disabled ? "Borrowed" : "Borrow"}
        </button>
      </td>`;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll(".borrow-button").forEach(btn => {
    btn.onclick = () => borrowBook(parseInt(btn.dataset.id, 10));
  });
}

function renderBorrowed(user) {
  const list = q("borrowedList");
  const msg = q("noBorrowedMessage");
  if (!list) return;

  list.innerHTML = "";
  if (!user.borrowed.length) {
    if (msg) msg.style.display = "block";
    return;
  }
  if (msg) msg.style.display = "none";

  user.borrowed.forEach(b => {
    const li = document.createElement("li");
    li.className = "borrowed-item";
    li.innerHTML = `
      <div>
        <div class="borrowed-title">${b.title}</div>
        <div class="borrowed-meta">
          <span>${b.author}</span>
          <span>• Borrowed on ${b.borrowedOn}</span>
        </div>
      </div>`;
    list.appendChild(li);
  });
}


function borrowBook(bookId) {
  let user = getCurrentUser();
  if (!user) { window.location.href = "index.html"; return; }

  const users = getUsers();
  const books = getBooks();
  const ui = users.findIndex(u => u.username === user.username);
  const bi = books.findIndex(b => b.id === bookId);
  if (ui === -1 || bi === -1) return;

  user = users[ui];
  user.borrowed = user.borrowed || [];
  if (user.borrowed.length >= (user.maxBorrow ?? 3)) { alert("Borrow limit reached."); return; }

  const book = books[bi];
  if (book.availableCopies <= 0) { alert("No copies available."); return; }

  if (user.borrowed.some(b => b.id === bookId)) { alert("Already borrowed."); return; }

  user.borrowed.push({
    id: book.id,
    title: book.title,
    author: book.author,
    borrowedOn: new Date().toISOString().split("T")[0]
  });
  user.currentlyBorrowed = user.borrowed.length;
  user.totalBorrowed = (user.totalBorrowed || 0) + 1;
  book.availableCopies--;

  users[ui] = user;
  books[bi] = book;
  saveUsers(users);
  saveCurrentUser(user);
  saveBooks(books);

  renderStats(user);
  renderBooks(books, user);
  renderBorrowed(user);
}
