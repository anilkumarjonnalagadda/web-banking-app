// ============================================================
// seed.js — Populate MongoDB Atlas with sample data
// ============================================================
// Run this once to load the JSON sample data into MongoDB.
// Usage: npm run seed
// ============================================================

require("dotenv").config();
const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "web_banking_app";

async function seed() {
  // Check that the connection string is available
  if (!MONGODB_URI) {
    console.error("Error: MONGODB_URI environment variable is not set.");
    console.error('Create a .env file with: MONGODB_URI=mongodb+srv://...');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");

    const db = client.db(DB_NAME);

    // --- Read JSON data files ---
    const users = JSON.parse(
      fs.readFileSync(path.join(__dirname, "data", "users.json"), "utf-8")
    );
    const accounts = JSON.parse(
      fs.readFileSync(path.join(__dirname, "data", "accounts.json"), "utf-8")
    );
    const transactions = JSON.parse(
      fs.readFileSync(path.join(__dirname, "data", "transactions.json"), "utf-8")
    );

    // --- Drop existing collections (safe to re-run) ---
    const collections = await db.listCollections().toArray();
    const collNames = collections.map((c) => c.name);

    if (collNames.includes("users")) await db.collection("users").drop();
    if (collNames.includes("accounts")) await db.collection("accounts").drop();
    if (collNames.includes("transactions")) await db.collection("transactions").drop();

    console.log("Cleared existing collections");

    // --- Insert data ---
    await db.collection("users").insertMany(users);
    console.log(`Inserted ${users.length} users`);

    await db.collection("accounts").insertMany(accounts);
    console.log(`Inserted ${accounts.length} accounts`);

    await db.collection("transactions").insertMany(transactions);
    console.log(`Inserted ${transactions.length} transactions`);

    // --- Create indexes for performance ---
    await db.collection("users").createIndex({ username: 1 });
    await db.collection("accounts").createIndex({ userId: 1 });
    await db.collection("accounts").createIndex({ accountNumber: 1 }, { unique: true });
    await db.collection("transactions").createIndex({ accountNumber: 1, date: -1 });

    console.log("Indexes created");
    console.log("");
    console.log("Seed completed successfully!");
    console.log(`  - ${users.length} users`);
    console.log(`  - ${accounts.length} accounts`);
    console.log(`  - ${transactions.length} transactions`);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

seed();
