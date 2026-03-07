# Local Setup Guide for Smart HR Management System

Follow these steps to get the project running on your local machine.

## Project Requirements
These are the core components and libraries the project depends on:
- **Runtime**: Node.js (v18+)
- **Database**: PostgreSQL (v14+)
- **Backend**: Express, Drizzle ORM, Zod, pg
- **Frontend**: React, Tailwind CSS, Recharts, Lucide Icons, TanStack Query

## Step 1: Clone or Download
Download the project files as a ZIP from Replit to a folder on your computer.

## Step 2: Install Dependencies
Open your terminal in the project folder and run:
```bash
npm install
```
*This command automatically downloads all the necessary libraries listed in the project's configuration.*

## Step 3: Configure Database (Detailed)
1. **Install PostgreSQL**: Ensure you have PostgreSQL installed and running on your local machine.
2. **Create Database**: Open your PostgreSQL terminal (psql) or a GUI like pgAdmin and run:
   ```sql
   CREATE DATABASE hr_system;
   ```
3. **Get Connection String**: Your connection string follows this format:
   `postgres://[username]:[password]@localhost:5432/hr_system`
   - Default username is usually `postgres`.
   - Use the password you set during PostgreSQL installation.
4. **Create .env File**: In the root folder of the project, create a new file named `.env`.
5. **Add Database URL**: Open `.env` and paste your connection string:
   ```env
   DATABASE_URL=postgres://postgres:your_password_here@localhost:5432/hr_system
   ```

## Step 4: Initialize the Database (Detailed)
1. **Sync Schema**: In your project terminal, run the following command. This creates all tables (Employees, Attendance, etc.) and relationships automatically:
   ```bash
   npm run db:push
   ```
2. **Verify Tables**: (Optional) You can check your database to see that tables like `employees`, `departments`, and `attendance` have been created.
3. **Seed Data (Optional)**: If you want to start with the example data, go to `server/routes.ts`, uncomment the line `await storage.seedDatabase();`, and restart the server.

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
