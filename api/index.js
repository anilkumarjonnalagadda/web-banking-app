// ============================================================
// api/index.js — Vercel serverless entry point
// ============================================================
// This file re-exports the Express app so Vercel can run it
// as a serverless function. All /api/* requests are routed
// here by vercel.json.
// ============================================================

// Load .env for local testing (no-op on Vercel where env vars are injected)
require("dotenv").config();

const app = require("../server");

module.exports = app;
