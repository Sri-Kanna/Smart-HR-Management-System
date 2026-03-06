# Local Setup Guide for Smart HR Management System

Follow these steps to get the project running on your local machine.

## Prerequisites
- **Node.js**: (v18 or higher recommended) [Download here](https://nodejs.org/)
- **PostgreSQL**: A running PostgreSQL instance. [Download here](https://www.postgresql.org/download/)
- **Git**: To clone the repository (if applicable).

## Step 1: Clone or Download
Download the project files to a folder on your computer.

## Step 2: Install Dependencies
Open your terminal/command prompt in the project folder and run:
```bash
npm install
```

## Step 3: Configure Database
1. Create a new database in your PostgreSQL instance (e.g., named `hr_system`).
2. Create a file named `.env` in the root of the project.
3. Add your database connection string to the `.env` file:
   ```env
   DATABASE_URL=postgres://username:password@localhost:5432/hr_system
   ```
   *Replace `username`, `password`, and `hr_system` with your actual PostgreSQL credentials.*

## Step 4: Initialize the Database
Run the following command to create the tables:
```bash
npm run db:push
```

## Step 5: Start the Application
Run the development server:
```bash
npm run dev
```
The app should now be running! Open your browser and go to `http://localhost:5000`.

## Scripts Summary
- `npm run dev`: Starts both the backend (Express) and frontend (Vite).
- `npm run db:push`: Syncs your TypeScript schema with the database.
- `npm run build`: Prepares the app for production.
