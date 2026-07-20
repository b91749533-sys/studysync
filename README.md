# StudySync: Real-Time Collaborative Study Hub

StudySync is a production-quality, high-performance, real-time collaborative study platform designed for students to create study rooms, manage shared tasks, write collaborative Markdown notes, engage in live group chat, and participate in synchronized server-run Pomodoro timers. 

The application utilizes a Node.js/Express/TypeScript backend and a React/TypeScript/Vite frontend styled with a modern glassmorphism dark-themed UI.

---

## Technical Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS (v4 via Vite plugin), Recharts (data visualization), Lucide React (vector icons).
* **Backend**: Node.js, Express, TypeScript, Socket.IO (WebSockets framework), Prisma ORM (relational data mapper), JWT with secure bcrypt password hashing.
* **Database**: PostgreSQL.

---

## Core Features Implemented

1. **Authentication**: JWT-based secure signup, login, and profile updates (bios, custom avatar generators using Dicebear APIs, and password changes).
2. **Interactive Dashboard**: Quick metrics cards (total hours, streak tracker, weekly milestone charts, completed tasks counts) and recent focus sessions history tables.
3. **Synchronized Pomodoro Timer**: Server-driven state machine broadcasted to all room users. Automates focus cycles and break alerts, utilizing Web Audio API for custom sound alerts, and automatically logs study sessions in PostgreSQL for all active members in the room on focus completion.
4. **Real-Time Group Chat**: Seamless message histories, user typing indicators, custom system join/leave notifications, and scroll locking.
5. **Presence Tracking**: Online participants listings showing usernames and live avatars.
6. **Shared Task Board**: Collaborative Kanban board with low/medium/high priority tags, deadline calendar alerts, and assignee assignments.
7. **Collaborative Notes**: Shared Markdown text editor with instant synchronization, editor locks, and local Markdown-to-HTML parser rendering.
8. **Interactive Analytics**: Historical focus breakdowns by subject categories (BarCharts) and weekday activity trends (AreaCharts).
9. **Leaderboard Ranks**: Dynamically filters top students by weekly study hours, monthly study hours, or active streak days, featuring podium highlighting for ranks 1-3.

---

## Installation & Setup Instructions

### Prerequisites
* Node.js (v18 or higher recommended)
* NPM (v9 or higher)
* PostgreSQL database instance running locally or remotely

### 1. Database Setup
Ensure PostgreSQL is active. Create a new database called `studysync`:
```bash
# Using psql command line tool
psql -U postgres -h localhost -c "CREATE DATABASE studysync;"
```

### 2. Backend Installation & Migration
1. Navigate to the `backend/` folder:
   ```bash
   cd backend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Set up the environment file. Create a `.env` file under `backend/`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/studysync?schema=public"
   JWT_SECRET="studysync_secret_key_2026_jwt_token_auth_secret"
   ```
   *Replace `PASSWORD` with your local PostgreSQL user password.*
4. Deploy the schema migrations and generate the Prisma Client:
   ```bash
   npx prisma migrate dev --name init
   ```

### 3. Frontend Installation
1. Navigate to the `frontend/` folder:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```

---

## How to Run the Application

To run the full stack locally:

### Run Backend Server (from `backend/` directory)
```bash
npm run dev
# OR using node-ts directly:
npx nodemon src/index.ts
```
The API server and Socket.IO listener will start on `http://localhost:5000`.

### Run Frontend Development Server (from `frontend/` directory)
```bash
npm run dev
```
The React SPA will start on `http://localhost:5173`. Open this URL in your browser.

---

## How to Test the Real-Time Features

1. Launch both the backend and frontend servers.
2. Open two separate browser windows (or one standard window and one private/incognito window).
3. Register User A in Window A, and User B in Window B.
4. From User A, go to **Study Rooms** and click **Create Room**. Copy the generated **Invite Code** displayed in the room details card.
5. From User B, go to **Study Rooms**, enter the copied **Invite Code** in the "Join Code" input, and click **Join Code**.
6. Both users will now be active in the same workspace. You can test synchronization:
   * **Presence**: Look at the "Active Presence" column. You will see both avatars online.
   * **Typing Indicator**: Click the chat input in Window A and start typing. Window B will show "Alex is typing...".
   * **Chat Messages**: Send messages from Window A. They will appear instantly in Window B.
   * **Synchronized Pomodoro**: As the room creator/host in Window A, click the **Play** button on the Pomodoro timer. Window B will instantly start counting down in absolute sync. Click **Pause** or change modes (Focus vs Breaks) to verify the state broadcasts.
   * **Task Board**: Add a task in Window A. It will pop up in Window B instantly. Complete the task in Window B and look at Window A to verify it synchronizes.
   * **Collaborative Notes**: Click **Edit Note** under Notes in Window A, write some text, and click **Save**. Window B will automatically receive the note synchronization.

---

## Future Improvements

* **Rich WebRTC Video/Audio Call**: Add peer-to-peer audio/video calling inside study rooms for direct face-to-face collaboration.
* **Granular Room Permissions**: Support roles like MODERATOR or VIEWER to allow creators to lock task additions or timer controls.
* **Persistent Timer Log Details**: Enable listing who attended which specific Pomodoro session and provide focus rating reports.
* **Google OAuth2 Integrations**: Connect Google Calendar and Gmail invites to send study room invite link notifications.
