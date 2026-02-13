// ============================================================
// app.js — Main frontend JavaScript for the Web Banking App
// ============================================================
// This file handles:
// 1. Session management (checking if user is logged in)
// 2. Navigation between views (Dashboard, Transfer, History)
// 3. Loading account data from the server
// 4. Fund transfers
// 5. Transaction history with date filtering
// 6. Mini statement on the dashboard
// ============================================================

// ============================================================
// SECTION 1: SESSION CHECK
// ============================================================
// When the dashboard page loads, check if the user is logged in.
// If not, send them back to the login page.

// Try to get the logged-in user from sessionStorage
const user = JSON.parse(sessionStorage.getItem("user"));

if (!user) {
  // No user found — redirect to login page
  window.location.href = "index.html";
}

// We'll store the user's accounts here after loading them
let userAccounts = [];

// ============================================================
// SECTION 2: NAVIGATION (switching between views)
// ============================================================

// Get all the navigation buttons (both desktop and mobile)
const allNavBtns = document.querySelectorAll(".nav-btn[data-view]");

// Get all the view sections
const allViews = document.querySelectorAll(".view");

/**
 * switchView() — Shows the selected view and hides all others.
 * Also updates which nav button appears "active".
 *
 * @param {string} viewName — The name of the view to show
 *                            ("dashboard", "transfer", or "history")
 */
function switchView(viewName) {
  // Hide all views
  allViews.forEach((v) => {
    v.classList.add("hidden");
    v.classList.remove("active");
  });

  // Show the selected view
  const targetView = document.getElementById("view-" + viewName);
  if (targetView) {
    targetView.classList.remove("hidden");
    targetView.classList.add("active");
  }

  // Update nav button styles (remove "active" from all, add to clicked one)
  allNavBtns.forEach((btn) => {
    if (btn.getAttribute("data-view") === viewName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Close mobile menu if it's open
  document.getElementById("mobileMenu").classList.add("hidden");

  // Load data for the selected view
  if (viewName === "history") {
    loadTransactionHistory();
  }
}

// Attach click event to each nav button
allNavBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    switchView(btn.getAttribute("data-view"));
  });
});

// Quick action buttons on the dashboard
document.getElementById("quickTransfer").addEventListener("click", () => {
  switchView("transfer");
});
document.getElementById("quickHistory").addEventListener("click", () => {
  switchView("history");
});

// ============================================================
// SECTION 3: HAMBURGER MENU (mobile navigation)
// ============================================================

document.getElementById("hamburgerBtn").addEventListener("click", () => {
  const mobileMenu = document.getElementById("mobileMenu");
  // Toggle visibility
  mobileMenu.classList.toggle("hidden");
});

// ============================================================
// SECTION 4: LOGOUT
// ============================================================

/**
 * logout() — Clears the session and returns to the login page.
 */
function logout() {
  sessionStorage.removeItem("user");
  window.location.href = "index.html";
}

// Attach logout to both desktop and mobile logout buttons
document.getElementById("logoutBtn").addEventListener("click", logout);
document.getElementById("logoutBtnMobile").addEventListener("click", logout);

// ============================================================
// SECTION 5: LOAD DASHBOARD DATA
// ============================================================

/**
 * loadDashboard() — Fetches the user's accounts from the server
 * and renders them on the dashboard.
 */
async function loadDashboard() {
  // Set the welcome message
  document.getElementById("userName").textContent = user.fullName;

  try {
    // Fetch this user's accounts from the server
    const response = await fetch("/api/accounts/" + user.id);
    const data = await response.json();

    if (data.success) {
      userAccounts = data.accounts;
      renderAccountCards(userAccounts);
      populateAccountDropdowns(userAccounts);

      // Load mini statement for the first account
      if (userAccounts.length > 0) {
        loadMiniStatement(userAccounts[0].accountNumber);
      }
    }
  } catch (err) {
    console.error("Failed to load accounts:", err);
  }
}

/**
 * renderAccountCards() — Creates the account summary cards on the dashboard.
 *
 * @param {Array} accounts — Array of account objects from the server
 */
function renderAccountCards(accounts) {
  const container = document.getElementById("accountCards");
  container.innerHTML = ""; // Clear any existing cards

  accounts.forEach((acc) => {
    // Create a new card for each account
    const card = document.createElement("div");
    card.className = "account-card";
    card.innerHTML = `
      <div class="account-type">${acc.type} Account</div>
      <div class="account-number">A/C No: ${acc.accountNumber}</div>
      <div class="account-balance">$${acc.balance.toFixed(2)}</div>
    `;
    container.appendChild(card);
  });
}

/**
 * populateAccountDropdowns() — Fills the account selector dropdowns
 * (mini statement, transfer from, and history filter).
 *
 * @param {Array} accounts — Array of account objects
 */
function populateAccountDropdowns(accounts) {
  // The three dropdowns that need account options
  const miniSelect = document.getElementById("miniStatementAccount");
  const fromSelect = document.getElementById("fromAccount");
  const historySelect = document.getElementById("historyAccount");

  // Clear existing options
  miniSelect.innerHTML = "";
  fromSelect.innerHTML = "";
  historySelect.innerHTML = "";

  // Add each account as an option
  accounts.forEach((acc) => {
    const optionText = `${acc.accountNumber} (${acc.type} - $${acc.balance.toFixed(2)})`;

    miniSelect.innerHTML += `<option value="${acc.accountNumber}">${optionText}</option>`;
    fromSelect.innerHTML += `<option value="${acc.accountNumber}">${optionText}</option>`;
    historySelect.innerHTML += `<option value="${acc.accountNumber}">${optionText}</option>`;
  });
}

// ============================================================
// SECTION 6: MINI STATEMENT
// ============================================================

/**
 * loadMiniStatement() — Fetches the last 5 transactions for an account
 * and displays them in the mini statement table.
 *
 * @param {string} accountNumber — The account to get transactions for
 */
async function loadMiniStatement(accountNumber) {
  try {
    const response = await fetch("/api/mini-statement/" + accountNumber);
    const data = await response.json();

    if (data.success) {
      renderTransactionTable("miniStatementBody", data.transactions);
    }
  } catch (err) {
    console.error("Failed to load mini statement:", err);
  }
}

// When the mini statement account selector changes, reload the data
document.getElementById("miniStatementAccount").addEventListener("change", (e) => {
  loadMiniStatement(e.target.value);
});

// ============================================================
// SECTION 7: TRANSACTION HISTORY
// ============================================================

/**
 * loadTransactionHistory() — Fetches transactions for the selected
 * account, optionally filtered by date range.
 */
async function loadTransactionHistory() {
  const accountNumber = document.getElementById("historyAccount").value;
  const from = document.getElementById("dateFrom").value;
  const to = document.getElementById("dateTo").value;

  if (!accountNumber) return;

  // Build the URL with optional date query parameters
  let url = "/api/transactions/" + accountNumber;
  const params = [];
  if (from) params.push("from=" + from);
  if (to) params.push("to=" + to);
  if (params.length > 0) {
    url += "?" + params.join("&");
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      renderTransactionTable("historyBody", data.transactions);

      // Show/hide the "no transactions" message
      const noDataDiv = document.getElementById("noTransactions");
      if (data.transactions.length === 0) {
        noDataDiv.classList.remove("hidden");
      } else {
        noDataDiv.classList.add("hidden");
      }
    }
  } catch (err) {
    console.error("Failed to load transaction history:", err);
  }
}

// Filter button click
document.getElementById("filterBtn").addEventListener("click", loadTransactionHistory);

// When the history account selector changes, also reload
document.getElementById("historyAccount").addEventListener("change", loadTransactionHistory);

// ============================================================
// SECTION 8: RENDER TRANSACTION TABLE
// ============================================================

/**
 * renderTransactionTable() — Fills a <tbody> element with transaction rows.
 *
 * @param {string} tbodyId — The id of the <tbody> to fill
 * @param {Array} transactions — Array of transaction objects
 */
function renderTransactionTable(tbodyId, transactions) {
  const tbody = document.getElementById(tbodyId);
  tbody.innerHTML = ""; // Clear existing rows

  if (transactions.length === 0) {
    // Show a "no data" row
    const row = document.createElement("tr");
    row.innerHTML = '<td colspan="5" style="text-align: center; color: #718096;">No transactions found</td>';
    tbody.appendChild(row);
    return;
  }

  transactions.forEach((txn) => {
    const row = document.createElement("tr");

    // Format the amount with + or - sign and color
    const typeClass = txn.type === "credit" ? "type-credit" : "type-debit";
    const sign = txn.type === "credit" ? "+" : "-";
    const typeLabel = txn.type === "credit" ? "Credit" : "Debit";

    row.innerHTML = `
      <td>${txn.date}</td>
      <td>${txn.description}</td>
      <td class="${typeClass}">${sign}$${txn.amount.toFixed(2)}</td>
      <td class="${typeClass}">${typeLabel}</td>
      <td>$${txn.balanceAfter.toFixed(2)}</td>
    `;

    tbody.appendChild(row);
  });
}

// ============================================================
// SECTION 9: FUND TRANSFER
// ============================================================

document.getElementById("transferForm").addEventListener("submit", async (e) => {
  // Prevent the form from reloading the page
  e.preventDefault();

  // Grab form values
  const fromAccount = document.getElementById("fromAccount").value;
  const toAccount = document.getElementById("toAccount").value.trim();
  const amount = document.getElementById("transferAmount").value;
  const description = document.getElementById("transferDesc").value.trim();
  const messageDiv = document.getElementById("transferMessage");

  // Hide previous messages
  messageDiv.classList.add("hidden");

  try {
    // Send transfer request to the server
    const response = await fetch("/api/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromAccount, toAccount, amount, description }),
    });

    const data = await response.json();

    if (data.success) {
      // Show success message
      messageDiv.className = "success-message";
      messageDiv.textContent = data.message;
      messageDiv.classList.remove("hidden");

      // Clear the form fields
      document.getElementById("toAccount").value = "";
      document.getElementById("transferAmount").value = "";
      document.getElementById("transferDesc").value = "";

      // Reload the dashboard data so balances are updated
      loadDashboard();
    } else {
      // Show error message
      messageDiv.className = "error-message";
      messageDiv.textContent = data.message;
      messageDiv.classList.remove("hidden");
    }
  } catch (err) {
    messageDiv.className = "error-message";
    messageDiv.textContent = "Transfer failed. Please try again.";
    messageDiv.classList.remove("hidden");
  }
});

// ============================================================
// SECTION 10: INITIALIZE THE APP
// ============================================================
// Load all dashboard data when the page first loads
loadDashboard();
