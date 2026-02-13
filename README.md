# SecureBank — Internet Web Banking Application

A fully functional internet banking web application with an integrated Kore.ai virtual assistant chatbot. Built with HTML/CSS/vanilla JavaScript on the frontend and Node.js/Express on the backend, using JSON files for data storage.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Getting Started](#getting-started)
5. [Demo Credentials](#demo-credentials)
6. [Application Pages](#application-pages)
7. [API Endpoints](#api-endpoints)
8. [Data Files](#data-files)
9. [Kore.ai Chatbot Integration](#koreai-chatbot-integration)
10. [Customization](#customization)
11. [Git Quick Reference](#git-quick-reference)
12. [Troubleshooting](#troubleshooting)

---

## Features

- **User Login** — Authenticate with username/password against sample user data
- **Dashboard** — Welcome banner, account summary cards, quick action buttons, mini statement
- **Fund Transfer** — Transfer money between accounts with real-time validation (insufficient balance, same-account check, etc.)
- **Transaction History** — View full transaction history with date range filtering
- **Mini Statement** — Quick view of the last 5 transactions per account
- **Logout** — Clears session and returns to login
- **Kore.ai Chatbot** — Virtual assistant available on every page, themed to match the banking UI
- **Responsive Design** — Works on both desktop and mobile devices

---

## Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript      |
| Backend    | Node.js, Express.js v4.18            |
| Data Store | JSON files (no database required)    |
| Chatbot    | Kore.ai Web SDK                      |
| Version Control | Git + GitHub                    |

---

## Project Structure

```
web-banking-app/
├── server.js                    # Express backend — all API routes
├── package.json                 # Project config & dependencies
├── .gitignore                   # Excludes node_modules from git
│
├── data/                        # JSON data files (our "database")
│   ├── users.json               # User credentials (3 demo users)
│   ├── accounts.json            # Bank accounts (5 accounts)
│   └── transactions.json        # Transaction records
│
├── public/                      # Frontend files (served by Express)
│   ├── index.html               # Login page
│   ├── dashboard.html           # Dashboard (all views: overview, transfer, history)
│   ├── style.css                # Complete banking theme stylesheet
│   ├── app.js                   # Frontend JavaScript (navigation, API calls, rendering)
│   │
│   └── kore-sdk/                # Kore.ai Web SDK files
│       ├── kore-config.js       # Bot credentials & chat window configuration
│       ├── kore-init.js         # Bot initialization & JWT authentication
│       ├── kore-banking-theme.css # Custom theme overrides matching banking UI
│       ├── chatWindow.js        # SDK chat widget core
│       ├── chatWindow.css       # SDK default styles
│       ├── kore-bot-sdk-client.js # SDK client library
│       ├── UI-libs/             # jQuery, jQuery UI, Moment.js, DOMPurify, etc.
│       ├── libs/                # D3, Lodash, emoji, scrollbar, etc.
│       └── custom/              # Custom chat templates
```

---

## Getting Started

### Prerequisites

- **Node.js** (v14 or higher) — Download from [https://nodejs.org](https://nodejs.org)
- **Git** (optional, for cloning) — Download from [https://git-scm.com](https://git-scm.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/anilkumarjonnalagadda/web-banking-app.git

# 2. Navigate to the project folder
cd web-banking-app

# 3. Install dependencies
npm install

# 4. Start the server
npm start
```

### Access the Application

Open your browser and go to:

```
http://localhost:3000
```

> **Note:** The app runs locally on port 3000. It is only available while the Node.js process is running. Press `Ctrl+C` in the terminal to stop the server.

---

## Demo Credentials

The app comes pre-loaded with 3 demo users:

| Username    | Password  | Full Name   | Accounts                        |
|-------------|-----------|-------------|----------------------------------|
| johndoe     | pass123   | John Doe    | Savings (1001001001), Current (1001001002) |
| janesmith   | pass456   | Jane Smith  | Savings (2002002001)            |
| bobwilson   | pass789   | Bob Wilson  | Savings (3003003001), Current (3003003002) |

---

## Application Pages

### 1. Login Page (`index.html`)

- Clean, centered login card with gradient background
- Username/password form with validation
- Displays demo credentials for easy testing
- On successful login, stores user data in `sessionStorage` and redirects to dashboard
- Kore.ai chatbot icon available in the corner

### 2. Dashboard Page (`dashboard.html`)

The dashboard uses a **single-page architecture** — three views toggled by JavaScript:

#### Dashboard View (default)
- **Welcome banner** — Displays logged-in user's name
- **Account cards** — Shows all accounts with type, number, and balance
- **Quick action buttons** — Shortcuts to Transfer and History
- **Mini Statement** — Last 5 transactions for the selected account (dropdown to switch accounts)

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
- "No transactions found" message when filters return empty results

### Navigation
- **Desktop:** Horizontal nav buttons in the navbar
- **Mobile (<768px):** Hamburger menu with dropdown
- **Logout:** Clears `sessionStorage` and redirects to login

---

## API Endpoints

The Express backend (`server.js`) provides 6 API routes:

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

- **Example:** `GET /api/transactions/1001001001?from=2026-02-01&to=2026-02-10`
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
- **Failure (400/404):** `{ "success": false, "message": "error details..." }`
- **Side effects:** Updates both account balances in `accounts.json`, creates debit + credit records in `transactions.json`

### 6. GET `/api/all-accounts`

Returns all account numbers (used for transfer form reference).

- **Response:** `{ "success": true, "accounts": [{ "accountNumber": "...", "type": "..." }] }`

---

## Data Files

All data is stored in the `data/` folder as JSON files. The server reads/writes these files directly.

### `users.json`

```json
[
  {
    "id": "user1",
    "username": "johndoe",
    "password": "pass123",
    "fullName": "John Doe",
    "email": "john.doe@email.com"
  }
]
```

### `accounts.json`

```json
[
  {
    "accountNumber": "1001001001",
    "userId": "user1",
    "type": "Savings",
    "balance": 15000
  }
]
```

### `transactions.json`

```json
[
  {
    "id": "txn001",
    "accountNumber": "1001001001",
    "date": "2026-02-01",
    "description": "Salary Credit",
    "amount": 5000,
    "type": "credit",
    "balanceAfter": 15000
  }
]
```

> **Note:** Fund transfers modify both `accounts.json` (balances) and `transactions.json` (new records) in real time.

---

## Kore.ai Chatbot Integration

The app includes a Kore.ai Web SDK chatbot on every page (login + dashboard).

### How It Works

1. **SDK files** are in `public/kore-sdk/` — copied from the Kore.ai Web SDK package
2. **`kore-config.js`** contains bot credentials and chat window settings
3. **`kore-init.js`** handles JWT authentication and initializes the chat widget
4. **`kore-banking-theme.css`** overrides SDK default colors to match the banking app

### Key Configuration (`kore-config.js`)

| Setting | Purpose |
|---------|---------|
| `JWTUrl` | JWT token endpoint for bot authentication |
| `userIdentity` | Email address identifying the chat user |
| `botInfo.name` | Bot name on the Kore.ai platform |
| `botInfo._id` | Unique bot identifier |
| `clientId` / `clientSecret` | API credentials |
| `minimizeMode: true` | Bot starts as a small floating icon |
| `multiPageApp.enable: true` | Preserves chat state across page navigation (login → dashboard) |
| `multiPageApp.userIdentityStore: "sessionStorage"` | Uses sessionStorage for state |

### Script Loading Order

Both HTML pages load the SDK scripts in this specific order:

```
1. kore-no-conflict-start.js    ← Saves existing jQuery to avoid conflicts
2. jquery.js                     ← jQuery (SDK dependency)
3. jquery.tmpl.min.js            ← jQuery templates
4. jquery-ui.min.js              ← jQuery UI
5. moment.js                     ← Date/time library
6. lodash.min.js                 ← Utility library
7. d3.v4.min.js                  ← Charting library
8. KoreGraphAdapter.js           ← Chart adapter
9. anonymousassertion.js         ← Auth helper
10. kore-bot-sdk-client.js       ← Core SDK client
11. perfect-scrollbar.js         ← Custom scrollbar
12. chatWindow.js                ← Chat widget UI
13. Additional UI libs            ← Date pickers, emoji, etc.
14. chatWindow.css               ← SDK default styles
15. kore-banking-theme.css       ← Our custom theme overrides
16. kore-config.js               ← Bot configuration
17. kore-init.js                 ← Bot initialization
18. kore-no-conflict-end.js      ← Restores original jQuery
```

### Custom Theme

The `kore-banking-theme.css` file overrides SDK CSS variables to match the banking app:

| Element | Color | Matches |
|---------|-------|---------|
| Chat header | `#1a3a5c` (navy) | Banking navbar |
| User message bubbles | `#2c5282` (medium blue) | Primary buttons |
| Bot message bubbles | `#edf2f7` (light gray-blue) | Card backgrounds |
| Chat body background | `#f0f4f8` | Page background |
| Minimized chat icon | `#1a3a5c` (navy) | Navbar |
| Quick reply buttons | `#2c5282` border/text | Link colors |
| Border radius | `12px` | Card styling |

---

## Customization

### Changing the Color Theme

All colors are defined as CSS variables in `style.css`:

```css
:root {
  --primary: #1a3a5c;       /* Dark navy */
  --primary-light: #2c5282; /* Medium blue */
  --primary-hover: #1e4a7a; /* Hover state */
  --accent: #3182ce;        /* Bright blue */
  --success: #38a169;       /* Green */
  --danger: #e53e3e;        /* Red */
  --bg-light: #f0f4f8;      /* Page background */
  --bg-white: #ffffff;       /* Cards */
  --text-dark: #1a202c;     /* Main text */
  --text-muted: #718096;    /* Secondary text */
  --border: #e2e8f0;        /* Borders */
}
```

If you change these, also update `kore-banking-theme.css` to keep the chatbot in sync.

### Adding New Users

Edit `data/users.json` and add a new user object:

```json
{
  "id": "user4",
  "username": "newuser",
  "password": "newpass",
  "fullName": "New User",
  "email": "new.user@email.com"
}
```

Then add corresponding account(s) in `data/accounts.json`:

```json
{
  "accountNumber": "4004004001",
  "userId": "user4",
  "type": "Savings",
  "balance": 10000
}
```

### Changing the Port

Edit `server.js` line 14:

```javascript
const PORT = 3000; // Change to your desired port
```

---

## Git Quick Reference

| Command | What it does |
|---------|-------------|
| `git status` | See what files have changed |
| `git add .` | Stage all changes for commit |
| `git add <file>` | Stage a specific file |
| `git commit -m "message"` | Save changes with a description |
| `git push` | Upload commits to GitHub |
| `git pull` | Download latest changes from GitHub |
| `git log --oneline` | View commit history (compact) |
| `git diff` | See unstaged changes |

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

# Or simply change the port in server.js
```

### "Cannot find module" or ENOENT errors

Make sure you're in the correct directory and have installed dependencies:

```bash
cd D:\ClaudeProjects\web-banking-app
npm install
npm start
```

### Chatbot not loading

- Check browser console (F12) for JavaScript errors
- Verify the JWT URL in `kore-config.js` is accessible
- Ensure all SDK files are present in `public/kore-sdk/`
- The bot credentials (clientId, clientSecret) must match your Kore.ai platform configuration

### Data resets

The JSON data files are modified in place when you make transfers. To reset to original sample data, you can either:
1. Revert with Git: `git checkout -- data/`
2. Manually edit the JSON files

---

## Security Notes

> **This is a demo application for learning purposes.** It is NOT suitable for production use.

- Passwords are stored in plain text (no hashing)
- No server-side session management (uses client-side `sessionStorage`)
- No HTTPS encryption
- Bot credentials (`clientId`, `clientSecret`) are exposed in the frontend code
- No rate limiting or CSRF protection

For a production app, you would need: password hashing (bcrypt), server-side sessions or JWT tokens, HTTPS, environment variables for secrets, input sanitization, rate limiting, and proper authentication middleware.

---

*Built as a training/demo project for learning web development and Kore.ai chatbot integration.*
