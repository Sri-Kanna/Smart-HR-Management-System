# Smart HR Management System — Complete Beginner's Setup Guide 

---

## Important Files Overview

These are the key files you need to know about in this project:

```
HR-Smart-System/
├── package.json              ← Lists all libraries the project needs
├── .env                      ← YOUR database credentials go here (you create this)
├── drizzle.config.ts         ← Database connection config for migrations
├── schema.sql                ← Visual reference of all database tables
│
├── shared/
│   └── schema.ts             ← Database table definitions (the data model)
│
├── server/
│   ├── index.ts              ← App entry point, starts the server
│   ├── routes.ts             ← All API endpoints (GET, POST, DELETE etc.)
│   ├── storage.ts            ← All database read/write logic
│   └── db.ts                 ← Database connection setup
│
└── client/src/
    ├── App.tsx               ← Registers all pages and routes
    ├── main.tsx              ← React app entry point
    ├── index.css             ← Global styles and theme colors
    ├── pages/
    │   ├── dashboard.tsx     ← Main dashboard page
    │   ├── employees.tsx     ← Employee management
    │   ├── attendance.tsx    ← Attendance tracking
    │   ├── performance.tsx   ← Performance reviews
    │   ├── departments.tsx   ← Departments & Job Roles
    │   ├── leaves.tsx        ← Leave management
    │   └── payroll.tsx       ← Payroll overview
    └── components/
        └── app-sidebar.tsx   ← Left navigation sidebar
```

---

## What You Need to Install First (Prerequisites)

Before starting, install these tools on your computer:

### 1. Node.js (version 18 or newer)
- Go to: **https://nodejs.org**
- Click the big green **"LTS"** button to download
- Run the installer — click Next → Next → Install
- To verify it worked, open a terminal (Command Prompt on Windows) and type:
  ```
  node --version
  ```
  You should see something like `v18.17.0` or higher

### 2. PostgreSQL (version 14 or newer)
- Go to: **https://www.postgresql.org/download/**
- Choose your operating system (Windows / Mac / Linux)
- Download and run the installer
- **IMPORTANT**: During installation, you will be asked to set a **password** for the `postgres` user — **write this password down**, you will need it later
- Keep the default port: **5432**
- Finish the installation

### 3. Git (optional, for cloning)
- Go to: **https://git-scm.com/downloads**
- Download and install (all default options are fine)

---

## Step-by-Step Installation

### Step 1: Get the Project Files

**Option A — Download as ZIP from Replit:**
1. On Replit, click the three dots (**...**) menu in the top left
2. Click **"Download as zip"**
3. Unzip/extract the downloaded file to a folder on your Desktop (e.g., `C:\Users\YourName\Desktop\SmartHR`)

**Option B — Clone with Git (if you have Git):**
```bash
git clone YOUR_REPLIT_REPO_URL
cd SmartHR
```

---

### Step 2: Open a Terminal in the Project Folder

**On Windows:**
1. Open File Explorer and navigate to your project folder
2. Click on the address bar at the top (where it shows the folder path)
3. Type `cmd` and press Enter — a Command Prompt window will open inside your project folder

**On Mac:**
1. Open the project folder in Finder
2. Right-click on the folder
3. Select **"Open Terminal at Folder"** (or "New Terminal at Folder")

**On Linux:**
1. Right-click inside the project folder
2. Select **"Open Terminal Here"**

---

### Step 3: Install All Project Libraries

In the terminal window you just opened, type this command and press Enter:

```bash
npm install 
```

This will download all required libraries. It may take 1–3 minutes. You will see a lot of text scrolling — this is normal. Wait until it finishes and you see your cursor again.

---

### Step 4: Create the Database

1. Open **pgAdmin** (installed with PostgreSQL) or open a terminal and type:
   ```bash
   psql -U postgres
   ```
   (Enter the PostgreSQL password you set during installation)

2. Create a new database by running this command:
   ```sql
   CREATE DATABASE hr_system;
   ```

3. Type `\q` and press Enter to exit.

---

### Step 5: Create Your `.env` File (Very Important)

This file tells the app how to connect to your database. You must create it manually.

**On Windows:**
1. Open your project folder in File Explorer
2. Right-click in an empty area → New → Text Document
3. Name it `.env` (make sure to delete the `.txt` extension)
   - If Windows won't let you name it `.env`, open Notepad, type the content below, then click File → Save As → change "Save as type" to "All Files" → name it `.env`

**On Mac/Linux:**
1. In your terminal (inside the project folder), run:
   ```bash
   touch .env
   ```
2. Then open it with any text editor

**Add this content to the `.env` file** (replace `your_password_here` with your actual PostgreSQL password):

```
DATABASE_URL=postgres://postgres:your_password_here@localhost:5432/hr_system
SESSION_SECRET=any_random_long_text_you_choose_here
```

**Example** (if your password is `MyPass123`):
```
DATABASE_URL=postgres://postgres:MyPass123@localhost:5432/hr_system
SESSION_SECRET=mysecretkey_smarthr_2024
```

Save the file.

**Check your folder looks like this:**
```
SmartHR/
├── .env          ← must be here
├── package.json
├── server/
├── client/
└── shared/
```

---

### Step 6: Set Up the Database Tables

Run this command in your terminal to automatically create all the database tables:

```bash
npm run db:push
```

You will see output confirming that tables like `employees`, `departments`, `attendance`, etc. have been created. This only needs to be done once.

---

### Step 7: Start the Application

**On Windows (Command Prompt):**
```cmd
set NODE_ENV=development && npx tsx server/index.ts
```

**On Windows (PowerShell):**
```powershell
$env:NODE_ENV='development'; npx tsx server/index.ts
```

---

### Step 8: Open the App in Your Browser

Once you see the message `serving on port 5000` in your terminal, open your web browser and go to:

```
http://localhost:5000
```

Your Smart HR Management System is now running!

---

## Getting Started with the App (First Time Use)

Because the database starts empty, follow this order when first using the app:

1. **Go to "Departments"** in the sidebar → Add at least one department and job role first
2. **Go to "Employees"** → Now you can add employees (they need a department and job role)
3. **Go to other sections** (Attendance, Leave, Performance, Payroll) → These all use employee data

---

## Available Pages

| Page | What it does |
|------|-------------|
| Dashboard | Overview with charts and key stats |
| Employees | Add, edit, delete employee records |
| Attendance | Track daily check-in/check-out |
| Performance | Set and review employee goals |
| Departments | Manage departments and job roles |
| Leaves | Submit and approve leave requests |
| Payroll | View salary costs by department |

---

## Troubleshooting Common Problems

**Problem: `npm install` fails**
- Make sure Node.js is installed: run `node --version`
- Try deleting the `node_modules` folder and running `npm install` again

**Problem: `npm run db:push` fails with "connection refused"**
- PostgreSQL is not running — open pgAdmin and start the PostgreSQL service
- Check your DATABASE_URL in `.env` — make sure the password is correct

**Problem: `npm run db:push` fails with "database does not exist"**
- You forgot to create the database — go back to Step 4 and create `hr_system`

**Problem: App opens but shows a blank page**
- Make sure you ran `npm run db:push` first
- Check your terminal for any error messages in red

**Problem: Port 5000 already in use**
- Another app is using port 5000. Find and stop it, or ask someone to help change the port.

---

## Quick Reference — Terminal Commands

| Command | What it does |
|---------|-------------|
| `npm install` | Downloads all project dependencies |
| `npm run dev` | Starts the app in development mode |
| `npm run db:push` | Creates/updates database tables |
| `npm run build` | Builds the app for production deployment |
