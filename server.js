// ============================================================
// server.js — Express backend for the Web Banking App
// ============================================================
// This file sets up the web server and all the API endpoints
// (login, accounts, transfers, transactions).
// ============================================================

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// --- Middleware ---
// express.json() lets us read JSON data sent from the frontend
app.use(express.json());
// express.static() serves our HTML, CSS, and JS files from /public
app.use(express.static(path.join(__dirname, "public")));

// --- Helper functions to read/write JSON data files ---

// Reads a JSON file and returns the parsed data
function readJSON(filename) {
  const filePath = path.join(__dirname, "data", filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

// Writes data back to a JSON file (pretty-printed for readability)
function writeJSON(filename, data) {
  const filePath = path.join(__dirname, "data", filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ============================================================
// API ROUTES
// ============================================================

// --- 1. LOGIN ---
// POST /api/login
// Expects: { username, password }
// Returns: the user object if credentials match, or an error
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const users = readJSON("users.json");

  // Find a user whose username AND password both match
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // Send back user info (exclude password from the response)
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } else {
    // 401 = Unauthorized
    res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  }
});

// --- 2. GET ACCOUNTS ---
// GET /api/accounts/:userId
// Returns all bank accounts belonging to a specific user
app.get("/api/accounts/:userId", (req, res) => {
  const accounts = readJSON("accounts.json");

  // Filter accounts to only those matching the userId
  const userAccounts = accounts.filter(
    (acc) => acc.userId === req.params.userId
  );

  res.json({ success: true, accounts: userAccounts });
});

// --- 3. GET TRANSACTIONS ---
// GET /api/transactions/:accountNumber
// Optional query params: ?from=2026-01-01&to=2026-02-28
// Returns transaction history for a specific account, optionally filtered by date
app.get("/api/transactions/:accountNumber", (req, res) => {
  const transactions = readJSON("transactions.json");
  const { from, to } = req.query;

  // Get all transactions for this account
  let filtered = transactions.filter(
    (txn) => txn.accountNumber === req.params.accountNumber
  );

  // Apply date filters if provided
  if (from) {
    filtered = filtered.filter((txn) => txn.date >= from);
  }
  if (to) {
    filtered = filtered.filter((txn) => txn.date <= to);
  }

  // Sort by date, newest first
  filtered.sort((a, b) => b.date.localeCompare(a.date));

  res.json({ success: true, transactions: filtered });
});

// --- 4. GET MINI STATEMENT ---
// GET /api/mini-statement/:accountNumber
// Returns the last 5 transactions for an account
app.get("/api/mini-statement/:accountNumber", (req, res) => {
  const transactions = readJSON("transactions.json");

  // Get transactions for this account, sort newest first, take 5
  const accountTxns = transactions
    .filter((txn) => txn.accountNumber === req.params.accountNumber)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  res.json({ success: true, transactions: accountTxns });
});

// --- 5. FUND TRANSFER ---
// POST /api/transfer
// Expects: { fromAccount, toAccount, amount, description }
// Deducts from sender, adds to receiver, creates transaction records
app.post("/api/transfer", (req, res) => {
  const { fromAccount, toAccount, amount, description } = req.body;
  const transferAmount = parseFloat(amount);

  // --- Validation checks ---
  if (!fromAccount || !toAccount || !amount || !description) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (fromAccount === toAccount) {
    return res.status(400).json({
      success: false,
      message: "Cannot transfer to the same account",
    });
  }

  if (isNaN(transferAmount) || transferAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be a positive number",
    });
  }

  // Read current data
  const accounts = readJSON("accounts.json");
  const transactions = readJSON("transactions.json");

  // Find the sender and receiver accounts
  const sender = accounts.find((acc) => acc.accountNumber === fromAccount);
  const receiver = accounts.find((acc) => acc.accountNumber === toAccount);

  if (!sender) {
    return res.status(404).json({
      success: false,
      message: "Your account was not found",
    });
  }

  if (!receiver) {
    return res.status(404).json({
      success: false,
      message: "Recipient account not found. Please check the account number.",
    });
  }

  // Check if sender has enough money
  if (sender.balance < transferAmount) {
    return res.status(400).json({
      success: false,
      message: `Insufficient balance. Your current balance is $${sender.balance.toFixed(2)}`,
    });
  }

  // --- Perform the transfer ---
  sender.balance -= transferAmount;
  receiver.balance += transferAmount;

  // Round to 2 decimal places to avoid floating point issues
  sender.balance = Math.round(sender.balance * 100) / 100;
  receiver.balance = Math.round(receiver.balance * 100) / 100;

  // Create a unique transaction ID
  const now = new Date();
  const txnId = "txn" + Date.now();
  const dateStr = now.toISOString().split("T")[0]; // e.g. "2026-02-13"

  // Create debit transaction (money leaving sender)
  transactions.push({
    id: txnId + "_deb",
    accountNumber: fromAccount,
    date: dateStr,
    description: `Transfer to ${toAccount} - ${description}`,
    amount: transferAmount,
    type: "debit",
    balanceAfter: sender.balance,
  });

  // Create credit transaction (money arriving at receiver)
  transactions.push({
    id: txnId + "_crd",
    accountNumber: toAccount,
    date: dateStr,
    description: `Transfer from ${fromAccount} - ${description}`,
    amount: transferAmount,
    type: "credit",
    balanceAfter: receiver.balance,
  });

  // Save updated data back to JSON files
  writeJSON("accounts.json", accounts);
  writeJSON("transactions.json", transactions);

  res.json({
    success: true,
    message: `Successfully transferred $${transferAmount.toFixed(2)} to account ${toAccount}`,
    newBalance: sender.balance,
  });
});

// --- 6. GET ALL ACCOUNT NUMBERS (for transfer dropdown) ---
// GET /api/all-accounts
// Returns a list of all account numbers (used in the transfer form)
app.get("/api/all-accounts", (req, res) => {
  const accounts = readJSON("accounts.json");

  // Return just the account numbers and types (no balances for privacy)
  const accountList = accounts.map((acc) => ({
    accountNumber: acc.accountNumber,
    type: acc.type,
  }));

  res.json({ success: true, accounts: accountList });
});

// ============================================================
// START THE SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`Banking app is running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop the server`);
});
