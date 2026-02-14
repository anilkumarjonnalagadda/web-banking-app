// ============================================================
// server.js — Express backend for the Web Banking App
// ============================================================
// This file sets up the web server and all the API endpoints
// (login, accounts, transfers, transactions).
//
// Data is stored in MongoDB Atlas (previously used JSON files).
// The app can run locally with `npm start` or on Vercel as
// a serverless function.
// ============================================================

const express = require("express");
const path = require("path");
const { getDb } = require("./lib/db");

const app = express();

// --- Middleware ---
// express.json() lets us read JSON data sent from the frontend
app.use(express.json());
// express.static() serves our HTML, CSS, and JS files from /public
// (used for local development; Vercel serves these via CDN)
app.use(express.static(path.join(__dirname, "public")));

// ============================================================
// API ROUTES
// ============================================================

// --- 1. LOGIN ---
// POST /api/login
// Expects: { username, password }
// Returns: the user object if credentials match, or an error
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = await getDb();

    // Find a user whose username AND password both match
    const user = await db
      .collection("users")
      .findOne({ username, password });

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
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- 2. GET ACCOUNTS ---
// GET /api/accounts/:userId
// Returns all bank accounts belonging to a specific user
app.get("/api/accounts/:userId", async (req, res) => {
  try {
    const db = await getDb();

    // Find accounts matching the userId
    const userAccounts = await db
      .collection("accounts")
      .find({ userId: req.params.userId })
      .toArray();

    res.json({ success: true, accounts: userAccounts });
  } catch (err) {
    console.error("Accounts error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- 3. GET TRANSACTIONS ---
// GET /api/transactions/:accountNumber
// Optional query params: ?from=2026-01-01&to=2026-02-28
// Returns transaction history for a specific account, optionally filtered by date
app.get("/api/transactions/:accountNumber", async (req, res) => {
  try {
    const db = await getDb();
    const { from, to } = req.query;

    // Build the MongoDB query
    const query = { accountNumber: req.params.accountNumber };

    // Apply date filters if provided
    // (YYYY-MM-DD string comparison works correctly with MongoDB $gte/$lte)
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = from;
      if (to) query.date.$lte = to;
    }

    // Sort by date, newest first
    const filtered = await db
      .collection("transactions")
      .find(query)
      .sort({ date: -1 })
      .toArray();

    res.json({ success: true, transactions: filtered });
  } catch (err) {
    console.error("Transactions error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- 4. GET MINI STATEMENT ---
// GET /api/mini-statement/:accountNumber
// Returns the last 5 transactions for an account
app.get("/api/mini-statement/:accountNumber", async (req, res) => {
  try {
    const db = await getDb();

    // Get transactions for this account, sort newest first, take 5
    const accountTxns = await db
      .collection("transactions")
      .find({ accountNumber: req.params.accountNumber })
      .sort({ date: -1 })
      .limit(5)
      .toArray();

    res.json({ success: true, transactions: accountTxns });
  } catch (err) {
    console.error("Mini statement error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- 5. FUND TRANSFER ---
// POST /api/transfer
// Expects: { fromAccount, toAccount, amount, description }
// Deducts from sender, adds to receiver, creates transaction records
app.post("/api/transfer", async (req, res) => {
  try {
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

    const db = await getDb();
    const accountsColl = db.collection("accounts");
    const txnsColl = db.collection("transactions");

    // Find the sender and receiver accounts
    const sender = await accountsColl.findOne({ accountNumber: fromAccount });
    const receiver = await accountsColl.findOne({ accountNumber: toAccount });

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
    // Calculate new balances (round to 2 decimal places to avoid floating point issues)
    const newSenderBalance = Math.round((sender.balance - transferAmount) * 100) / 100;
    const newReceiverBalance = Math.round((receiver.balance + transferAmount) * 100) / 100;

    // Update balances in MongoDB
    await accountsColl.updateOne(
      { accountNumber: fromAccount },
      { $set: { balance: newSenderBalance } }
    );
    await accountsColl.updateOne(
      { accountNumber: toAccount },
      { $set: { balance: newReceiverBalance } }
    );

    // Create a unique transaction ID
    const now = new Date();
    const txnId = "txn" + Date.now();
    const dateStr = now.toISOString().split("T")[0]; // e.g. "2026-02-14"

    // Create debit and credit transaction records
    await txnsColl.insertMany([
      {
        id: txnId + "_deb",
        accountNumber: fromAccount,
        date: dateStr,
        description: `Transfer to ${toAccount} - ${description}`,
        amount: transferAmount,
        type: "debit",
        balanceAfter: newSenderBalance,
      },
      {
        id: txnId + "_crd",
        accountNumber: toAccount,
        date: dateStr,
        description: `Transfer from ${fromAccount} - ${description}`,
        amount: transferAmount,
        type: "credit",
        balanceAfter: newReceiverBalance,
      },
    ]);

    res.json({
      success: true,
      message: `Successfully transferred $${transferAmount.toFixed(2)} to account ${toAccount}`,
      newBalance: newSenderBalance,
    });
  } catch (err) {
    console.error("Transfer error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- 6. GET ALL ACCOUNT NUMBERS (for transfer dropdown) ---
// GET /api/all-accounts
// Returns a list of all account numbers (used in the transfer form)
app.get("/api/all-accounts", async (req, res) => {
  try {
    const db = await getDb();

    // Return just the account numbers and types (no balances for privacy)
    const accountList = await db
      .collection("accounts")
      .find({}, { projection: { _id: 0, accountNumber: 1, type: 1 } })
      .toArray();

    res.json({ success: true, accounts: accountList });
  } catch (err) {
    console.error("All accounts error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ============================================================
// EXPORT & START THE SERVER
// ============================================================

// Export the app for Vercel serverless usage
module.exports = app;

// Start the server only when running locally (not on Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Banking app is running at http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to stop the server`);
  });
}
