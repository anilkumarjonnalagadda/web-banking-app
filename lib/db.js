// ============================================================
// lib/db.js — MongoDB connection with serverless caching
// ============================================================
// This module manages the MongoDB connection. In Vercel's
// serverless environment, we cache the connection on a global
// variable so warm containers reuse it instead of reconnecting.
// ============================================================

const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "web_banking_app";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable. " +
      "Create a .env file with: MONGODB_URI=mongodb+srv://..."
  );
}

// Cache the connection on the global object so it persists
// across warm serverless invocations (recommended Vercel pattern)
let cached = global._mongoClientPromise;

if (!cached) {
  cached = global._mongoClientPromise = { conn: null, promise: null };
}

/**
 * getDb() — Returns the MongoDB database instance.
 * Reuses the cached connection if available.
 */
async function getDb() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = MongoClient.connect(MONGODB_URI).then((client) => {
      return client.db(DB_NAME);
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { getDb };
