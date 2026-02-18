# Kore Banking — Internet Web Banking Application

A fully functional internet banking web application with an integrated **Kore.ai virtual assistant chatbot**. Built with HTML/CSS/vanilla JavaScript on the frontend, Node.js/Express on the backend, and MongoDB Atlas for data storage. Deployed live on **Vercel**.

**Live URL:** Deployed on Vercel (auto-deploys on every push to GitHub)
**Repository:** [github.com/anilkumarjonnalagadda/web-banking-app](https://github.com/anilkumarjonnalagadda/web-banking-app)

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Demo Credentials](#demo-credentials)
6. [Application Pages](#application-pages)
7. [API Endpoints](#api-endpoints)
8. [Database (MongoDB Atlas)](#database-mongodb-atlas)
9. [Kore.ai Chatbot Integration](#koreai-chatbot-integration)
10. [Deployment (Vercel)](#deployment-vercel)
11. [Customization](#customization)
12. [Git Quick Reference](#git-quick-reference)
13. [Troubleshooting](#troubleshooting)
14. [Security Notes](#security-notes)

---

## Features

- **User Login** — Authenticate with username/password against MongoDB user records
- **Dashboard** — Welcome banner with user's name, account summary cards, quick action buttons, mini statement
- **Fund Transfer** — Transfer money between accounts with real-time validation (insufficient balance, same-account check, etc.)
- **Transaction History** — View full transaction history with date range filtering
- **Mini Statement** — Quick view of the last 5 transactions per account
- **Logout** — Clears session and returns to login
- **Kore.ai Chatbot** — Virtual assistant on the dashboard page with dynamic user greeting via `customData`
- **Responsive Design** — Works on both desktop and mobile devices
- **Live Deployment** — Hosted on Vercel with auto-deploy from GitHub

---

## Tech Stack

| Layer           | Technology                                    |
|-----------------|-----------------------------------------------|
| Frontend        | HTML5, CSS3, Vanilla JavaScript               |
| Backend         | Node.js, Express.js v4.18                     |
| Database        | MongoDB Atlas (cloud-hosted)                  |
| Chatbot         | Kore.ai Web SDK v3 (11.21.1)                  |
| Hosting         | Vercel (serverless)                           |
| Version Control | Git + GitHub                                  |
| Font            | Space Grotesk (Google Fonts — Kore.ai brand)  |

---

## Project Structure

```
web-banking-app/
├── server.js                    # Express backend — all API routes (MongoDB)
├── package.json                 # Project config & dependencies
├── package-lock.json            # Dependency lock file
├── vercel.json                  # Vercel routing configuration
├── seed.js                      # Database seeder — loads sample data into MongoDB
├── .env                         # Environment variables (local only, not in git)
├── .gitignore                   # Excludes node_modules/ and .env
├── README.md                    # This documentation file
│
├── api/
│   └── index.js                 # Vercel serverless entry point
│
├── lib/
│   └── db.js                    # MongoDB connection with serverless caching
│
├── data/                        # Sample JSON data (used by seed.js)
│   ├── users.json               # 3 demo users
│   ├── accounts.json            # 5 bank accounts
│   └── transactions.json        # Sample transaction records
│
├── public/                      # Frontend files (served by Express / Vercel CDN)
│   ├── index.html               # Login page (no chatbot)
│   ├── dashboard.html           # Dashboard page (with chatbot)
│   ├── style.css                # Complete Kore.ai-branded stylesheet
│   ├── app.js                   # Frontend JavaScript (navigation, API calls, rendering)
│   │
│   └── kore-sdk/                # Kore.ai Web SDK v3 files
│       ├── kore-web-sdk-umd-chat.min.js   # SDK v3 bundled script (single file)
│       ├── kore-config.js                  # Bot credentials & chat configuration
│       ├── kore-init.js                    # Bot initialization (chatWindow API)
│       ├── kore-banking-theme.css          # Custom theme matching banking UI
│       └── plugins/
│           ├── kore-picker-plugin-umd.js          # Picker plugin
│           └── kore-graph-templates-plugin-umd.js  # Graph templates plugin
```

---

## Getting Started

### Prerequisites

- **Node.js** (v14 or higher) — Download from [nodejs.org](https://nodejs.org)
- **Git** (optional, for cloning) — Download from [git-scm.com](https://git-scm.com)
- **MongoDB Atlas** account — Free tier at [mongodb.com/atlas](https://www.mongodb.com/atlas)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/anilkumarjonnalagadda/web-banking-app.git

# 2. Navigate to the project folder
cd web-banking-app

# 3. Install dependencies
npm install

# 4. Create a .env file with your MongoDB connection string
#    (Create a file named .env in the project root)
#    MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<appName>

# 5. Seed the database with sample data (run once)
npm run seed

# 6. Start the server
npm start
```

### Access the Application

Open your browser and go to:

```
http://localhost:3000
```

> **Note:** The app runs locally on port 3000. Press `Ctrl+C` in the terminal to stop the server.

---

## Demo Credentials

The app comes pre-loaded with 3 demo users (after running `npm run seed`):

| Username   | Password | Full Name  | Accounts                                          |
|------------|----------|------------|---------------------------------------------------|
| johndoe    | pass123  | John Doe   | Savings (1001001001), Current (1001001002)        |
| janesmith  | pass456  | Jane Smith | Savings (2002002001)                              |
| bobwilson  | pass789  | Bob Wilson | Savings (3003003001), Current (3003003002)        |

---

## Application Pages

### 1. Login Page (`index.html`)

- Clean, centered login card with gradient background (charcoal to blue)
- Username/password form with validation
- Displays demo credentials for easy testing
- On successful login, stores user data in `sessionStorage` and redirects to dashboard
- **No chatbot** on this page (bot only appears after login)

### 2. Dashboard Page (`dashboard.html`)

The dashboard uses a **single-page architecture** — three views toggled by JavaScript:

#### Dashboard View (default)
- **Welcome banner** — Greets the logged-in user by name
- **Account cards** — Shows all accounts with type, number, and balance
- **Quick action buttons** — Shortcuts to Transfer and History
- **Mini Statement** — Last 5 transactions for the selected account

#### Transfer View
- **From Account** dropdown (user's own accounts)
- **To Account** text field (any account number)
- **Amount** field with validation
- **Description** memo field
- Validates: required fields, same-account check, positive amount, sufficient balance
- On success: shows confirmation, clears form, refreshes dashboard balances

#### History View
- **Account selector** dropdown
- **Date filters** — From date and To date (optional)
- **Filter button** — Fetches filtered results
- **Transaction table** — Date, Description, Amount (color-coded), Type, Balance After

### Navigation
- **Desktop:** Horizontal nav buttons in the navbar
- **Mobile (<768px):** Hamburger menu with dropdown
- **Logout:** Clears `sessionStorage` and redirects to login

---

## API Endpoints

The Express backend (`server.js`) provides 6 API routes, all using MongoDB:

### 1. POST `/api/login`

Authenticates a user.

- **Request body:** `{ "username": "johndoe", "password": "pass123" }`
- **Success (200):** `{ "success": true, "user": { "id", "username", "fullName", "email" } }`
- **Failure (401):** `{ "success": false, "message": "Invalid username or password" }`

### 2. GET `/api/accounts/:userId`

Returns all bank accounts for a user.

- **Example:** `GET /api/accounts/user1`
- **Response:** `{ "success": true, "accounts": [...] }`

### 3. GET `/api/transactions/:accountNumber`

Returns transaction history, optionally filtered by date.

- **Example:** `GET /api/transactions/1001001001?from=2026-02-01&to=2026-02-28`
- **Query params:** `from` (YYYY-MM-DD), `to` (YYYY-MM-DD) — both optional
- **Response:** `{ "success": true, "transactions": [...] }` (sorted newest first)

### 4. GET `/api/mini-statement/:accountNumber`

Returns the last 5 transactions for an account.

- **Example:** `GET /api/mini-statement/1001001001`
- **Response:** `{ "success": true, "transactions": [...] }` (max 5, newest first)

### 5. POST `/api/transfer`

Transfers funds between accounts.

- **Request body:** `{ "fromAccount": "1001001001", "toAccount": "1001001002", "amount": 500, "description": "Rent" }`
- **Validations:** All fields required, cannot transfer to same account, positive amount, sufficient balance, both accounts must exist
- **Success (200):** `{ "success": true, "message": "Successfully transferred...", "newBalance": 14500 }`
- **Side effects:** Updates both account balances, creates debit + credit transaction records

### 6. GET `/api/all-accounts`

Returns all account numbers (used for transfer form reference).

- **Response:** `{ "success": true, "accounts": [{ "accountNumber", "type" }] }`

---

## Database (MongoDB Atlas)

The application uses **MongoDB Atlas** (cloud-hosted MongoDB) instead of local JSON files. This allows the app to run on Vercel's serverless platform.

### Collections

| Collection     | Purpose                          | Key Fields                              |
|---------------|----------------------------------|-----------------------------------------|
| `users`       | User credentials and profile     | id, username, password, fullName, email |
| `accounts`    | Bank accounts with balances      | accountNumber, userId, type, balance    |
| `transactions`| Transaction records              | accountNumber, date, description, amount, type, balanceAfter |

### Database Name

`web_banking_app`

### Indexes (created by seed.js)

- `users.username`
- `accounts.userId`
- `accounts.accountNumber` (unique)
- `transactions.accountNumber + date` (compound)

### Connection Module (`lib/db.js`)

Uses a **serverless caching pattern** — the MongoDB connection is cached on `global._mongoClientPromise` so that warm Vercel containers reuse it instead of reconnecting on every request.

### Seeding the Database

Sample data lives in `data/` as JSON files. Run the seeder to load them into MongoDB:

```bash
npm run seed
```

This drops existing collections, inserts all sample data, and creates indexes.

### Environment Variable

The MongoDB connection string is stored in a `.env` file (locally) and as an environment variable on Vercel:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<appName>
```

---

## Kore.ai Chatbot Integration

The app includes a **Kore.ai Web SDK v3 (11.21.1)** chatbot on the **dashboard page only** (not on the login page).

### How It Works

1. **SDK v3 bundle** — Single file `kore-web-sdk-umd-chat.min.js` replaces 30+ individual scripts from older SDK versions
2. **`kore-config.js`** — Sets bot credentials, chat window settings, and dynamically passes the logged-in user's name via `customData`
3. **`kore-init.js`** — Initializes the chat widget using the `KoreChatSDK.chatWindow` API
4. **`kore-banking-theme.css`** — Overrides SDK default colors to match the Kore.ai branded banking UI

### Dynamic User Greeting

The bot receives the logged-in user's name dynamically via `customData`:

```javascript
// In kore-config.js
var user = JSON.parse(sessionStorage.getItem("user"));
botOptions.botInfo.customData = {"name": user.fullName};
```

On the **Bot Builder** side, access the name using:
```
{{context.session.BotUserSession.lastMessage.customData.name}}
```

### SDK Script Loading (dashboard.html)

```html
<script src="kore-sdk/kore-web-sdk-umd-chat.min.js"></script>
<script src="kore-sdk/plugins/kore-picker-plugin-umd.js"></script>
<link href="kore-sdk/kore-banking-theme.css" rel="stylesheet">
<script src="kore-sdk/kore-config.js"></script>
<script src="kore-sdk/kore-init.js"></script>
```

### Key Configuration (`kore-config.js`)

| Setting                    | Purpose                                              |
|----------------------------|------------------------------------------------------|
| `JWTUrl`                   | JWT token endpoint for bot authentication            |
| `userIdentity`             | Email address identifying the chat user              |
| `botInfo.name`             | Bot name on the Kore.ai platform                     |
| `botInfo._id`              | Unique bot identifier                                |
| `clientId` / `clientSecret`| API credentials for SDK authentication               |
| `botInfo.customData`       | Dynamic data passed to bot (logged-in user's name)   |
| `chatTitle`                | Title shown in the chat widget header                |
| `minimizeMode: true`       | Bot starts as a small floating icon                  |
| `loadHistory: true`        | Loads recent chat history on open                    |
| `multiPageApp.enable`      | Preserves chat state across page navigation          |

### Bot Initialization (`kore-init.js`)

Uses the SDK v3 API:

```javascript
var chatConfig = window._koreChatConfig || KoreChatSDK.chatConfig;
var chatWindow = KoreChatSDK.chatWindow;
var chatWindowInstance = new chatWindow();
chatWindowInstance.show(chatConfig);
```

### Custom Theme

The `kore-banking-theme.css` overrides SDK colors to match the Kore.ai brand palette:

| Element               | Color                    |
|-----------------------|--------------------------|
| Chat header           | `#181818` (Charcoal)     |
| User message bubbles  | `#1077d7` (Kore blue)    |
| Bot message bubbles   | `#f0f6f9` (Light gray)   |
| Chat body background  | `#f0f6f9`                |
| Minimized chat icon   | `#181818` (Charcoal)     |
| Quick reply buttons   | `#1077d7` border/text    |

---

## Deployment (Vercel)

The app is deployed on **Vercel** as a serverless application.

### How It Works

1. **`api/index.js`** — Vercel serverless entry point that re-exports the Express app
2. **`vercel.json`** — Routes all `/api/*` requests to the serverless function
3. **`public/`** — Static files served via Vercel's CDN
4. **Auto-deploy** — Every `git push origin master` triggers a new deployment

### Vercel Configuration (`vercel.json`)

```json
{
  "version": 2,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" }
  ]
}
```

### Environment Variables on Vercel

Set `MONGODB_URI` in the Vercel dashboard:
- Go to **Project Settings > Environment Variables**
- Add: `MONGODB_URI` = your MongoDB Atlas connection string

### Deploying Updates

```bash
# Make your changes, then:
git add <files>
git commit -m "Your change description"
git push origin master
# Vercel auto-deploys within 1-2 minutes
```

---

## Customization

### Changing the Color Theme

All colors are defined as CSS variables in `style.css` (Kore.ai brand palette):

```css
:root {
  --primary: #181818;       /* Charcoal — navbar, headers */
  --primary-light: #1077d7; /* Kore blue — buttons, accents */
  --primary-hover: #0d5ea8; /* Darker blue — hover states */
  --accent: #2F8FFF;        /* Light blue — links, highlights */
  --success: #38a169;       /* Green — success messages */
  --danger: #e53e3e;        /* Red — errors, debit amounts */
  --bg-light: #f0f6f9;      /* Light gray — page background */
  --text-dark: #181818;     /* Charcoal — main text */
}
```

If you change these, also update `kore-banking-theme.css` to keep the chatbot in sync.

### Changing the Bot

Edit `public/kore-sdk/kore-config.js` and update the bot credentials:

```javascript
botOptions.botInfo = {
  name: "Your Bot Name",
  _id: "st-your-bot-id",
};
botOptions.clientId = "cs-your-client-id";
botOptions.clientSecret = "your-client-secret";
```

Make sure the **Web/Mobile SDK channel** is enabled and published for the bot on the Kore.ai platform.

### Adding New Users

After adding users to `data/users.json` and accounts to `data/accounts.json`, re-run the seeder:

```bash
npm run seed
```

> **Warning:** This drops and re-creates all collections. Any transfers made during testing will be lost.

---

## Git Quick Reference

| Command                     | What it does                         |
|-----------------------------|--------------------------------------|
| `git status`                | See what files have changed          |
| `git add <file>`            | Stage a specific file                |
| `git add .`                 | Stage all changes                    |
| `git commit -m "message"`   | Save changes with a description      |
| `git push origin master`    | Push to GitHub (triggers Vercel deploy) |
| `git pull`                  | Download latest changes from GitHub  |
| `git log --oneline`         | View commit history (compact)        |
| `git diff`                  | See unstaged changes                 |
| `git revert <commit-hash>`  | Undo a specific commit safely        |

### GitHub Repository

```
https://github.com/anilkumarjonnalagadda/web-banking-app
```

---

## Troubleshooting

### Port 3000 already in use (EADDRINUSE)

Another process is using port 3000. Find and stop it:

```bash
# Windows (PowerShell)
netstat -ano | findstr :3000
Stop-Process -Id <PID> -Force

# Or change the port in server.js
```

### "Cannot find module" or ENOENT errors

Make sure you're in the correct directory and have installed dependencies:

```bash
cd D:\ClaudeProjects\web-banking-app
npm install
npm start
```

### MongoDB connection error

- Verify your `.env` file contains the correct `MONGODB_URI`
- Check that your IP address is whitelisted in MongoDB Atlas (Network Access)
- Ensure the database user has read/write permissions

### Chatbot not loading

- Check browser console (F12) for JavaScript errors
- **401 Unauthorized** — JWT credentials (clientId, clientSecret) don't match the bot on Kore.ai platform. Verify the Web/Mobile SDK channel is enabled and published.
- **KoreChatSDK is not defined** — SDK script failed to load. Check that `kore-web-sdk-umd-chat.min.js` exists in `public/kore-sdk/`
- Verify the bot is published (not in draft) on the Kore.ai platform

### Data resets

To reset to original sample data, re-run the seeder:

```bash
npm run seed
```

---

## Security Notes

> **This is a demo/training application.** It is NOT suitable for production use.

- Passwords are stored in plain text (no hashing)
- No server-side session management (uses client-side `sessionStorage`)
- No HTTPS encryption (handled by Vercel in production)
- Bot credentials (`clientId`, `clientSecret`) are exposed in the frontend code
- No rate limiting or CSRF protection

For a production app, you would need: password hashing (bcrypt), server-side sessions or JWT tokens, HTTPS, environment variables for secrets, input sanitization, rate limiting, and proper authentication middleware.

---

*Built as a training/demo project for Kore.ai — learning web development and chatbot integration.*
