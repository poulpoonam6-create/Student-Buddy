# Student Focus Buddy — Your AI Study Companion

A modern, production-ready college study companion built for hackathons and daily student productivity. Combining smart task management, an authentic Pomodoro focus timer, personalized study recommendations, a timetable scheduler, transparent AI study assistance, and verified weekly progress analytics.

---

## 🌟 Key Features

### 1. Smart Academic Dashboard
- **Green-and-white college aesthetic**: Clean emerald/forest/mint styling with high readability and responsive layout.
- **Dynamic Greeting & Today's Date**: Contextual time-of-day greetings and active study streak count.
- **Live Metrics**: Tasks due today, overdue tasks, completed tasks, and overall progress percentage.
- **“What should I study next?” Recommendation Engine**: Evaluates overdue tasks, today's deadlines, and priority levels (High > Medium > Low) to guide students on their highest-yield study objective, with a 1-click launch into the Focus Timer.
- **Clear Empty States**: Helpful prompts to add new tasks or load college sample data.

### 2. Upgraded Task Manager
- **Full CRUD operations**: Create, edit, complete, and delete coursework tasks.
- **Rich Task Metadata**: Title, Subject (with color-coded pills), Priority (High, Medium, Low), Deadline date & time picker, and custom notes.
- **Filtering & Search**: Filter by *All*, *Due Today*, *Upcoming*, *Overdue*, and *Completed*, or filter by subject and keyword search.
- **Smart Sorting**: Sort by Urgency & Priority, Earliest Deadline, Priority (High-to-Low), or Recently Added.
- **Form Validation**: Strict validation preventing empty titles and invalid dates with inline error feedback.
- **Persistent Storage**: All tasks saved in browser `localStorage`.

### 3. Integrated Pomodoro Focus Mode
- **Dual Timing Modes**: 25-minute focus intervals and 5-minute restorative breaks (with 50/10 and 1-minute quick test presets).
- **Full Timer Controls**: Start, Pause, Resume, Reset, and Skip Break.
- **Single Timer Authority**: Guaranteed single running timer state preventing accidental duplicate tickers.
- **Subject & Task Linking**: Link any running timer sprint to a pending coursework task or subject.
- **Session History Logging**: Automatically records completed focus sessions into study history with duration and timestamp.
- **Safe Inter-Page Navigation**: Timer context runs across pages, allowing students to check their timetable or task list while keeping timer ticks accurate via real-time delta tracking.
- **Web Audio Chime**: Synthesized harmonic bell chime upon session completion without external audio dependencies.

### 4. AI Study Assistant (Dual Live AI & Curated Demo Mode)
- **Subject & Concept Breakdown**: Enter any subject and concept (or pick from college presets: Computer Science BSTs, Calculus Integration by Parts, Organic Chem SN1/SN2, etc.).
- **Structured Output**:
  1. *Conceptual Intuition*: Clear explanation with real-world analogies.
  2. *Actionable 4-Step Study Plan*: Step-by-step roadmap with estimated time per step (with one-click "Add as Task" button).
  3. *3 Active-Recall Practice Questions*: Multiple-choice questions with answer verification and explanations.
- **Secure Backend Architecture**: No frontend API key exposure. All AI requests run on the server (`server.ts`) via `@google/genai` with model `gemini-3.8-flash`.
- **Honest Demo Mode**: If no `GEMINI_API_KEY` is provided, the app clearly displays `[Curated Hackathon Demo Guide]` with explicit disclosure, rather than pretending fake responses were AI-generated.

### 5. Verified Weekly Progress Tracker
- **Authentic Metrics**: Statistics are calculated strictly from real recorded `localStorage` events (no hardcoded numbers).
- **Rolling 7-Day Chart**: Visual columns displaying focus minutes or completed tasks per day.
- **Zero-Activity Distinction**: Days without study are explicitly marked with `0m` / `0 tasks` to distinguish from missing data.
- **Consecutive Study Streak**: Calculated backwards day-by-day from actual session dates without inventing false activity.
- **Configurable Daily Target**: Adjust daily focus sprint goals (e.g. 4 sessions = 100 mins) with visual progress bar.

### 6. Study Timetable & Scheduling
- **Class & Recitation Scheduler**: Schedule study blocks by subject, date, start time, end time, and notes/room.
- **Time Validation & Overlap Warning**: Validates that start time precedes end time and flags overlapping sessions on the same date.
- **Today's Schedule Highlight**: Top card previewing all sessions scheduled for the current day.

### 7. Motivational Feedback & Polish
- **Positive Reinforcement**: Uplifting toast notifications upon task completion and daily goal achievements.
- **Data Management**: Includes "Load Hackathon Demo Data" for evaluators and a safe "Reset All Data" confirmation dialog.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons.
- **Backend**: Express on Node.js / `tsx` with Vite middleware integration.
- **AI Engine**: `@google/genai` TypeScript SDK (model: `gemini-3.8-flash`).
- **Data Persistence**: Safe JSON `localStorage` with versioned schema and error fallbacks.
- **Audio**: Web Audio API oscillator synthesis.

---

## 🚀 Setup & Execution

### 1. Installation
```bash
npm install
```

### 2. Running in Development
```bash
npm run dev
```
The app runs on `http://localhost:3000`.

### 3. Building for Production
```bash
npm run build
npm run start
```

---

## 🔑 AI Configuration & Security

- **Server-Side Only**: All `@google/genai` SDK operations are isolated to `/server.ts`.
- **API Key Setup**:
  To enable live Gemini AI generation, provide `GEMINI_API_KEY` in your `.env` or environment secrets:
  ```env
  GEMINI_API_KEY="your-gemini-api-key"
  ```
- **Demo Mode Limitations**:
  - When `GEMINI_API_KEY` is missing or offline, the app switches to **Demo Mode**.
  - Demo mode provides curated college study guides for common subjects (Computer Science, Mathematics, Organic Chemistry, Economics, Psychology).
  - The UI clearly marks demo responses so users and hackathon judges know whether a guide was generated live or served from the vetted sample library.

---

## 🧪 Testing Verification Flow

1. **Add Task**: Navigate to **Tasks**, click **Add New Task**, enter "Calculus Quiz Review", set priority to "High", and save.
2. **Launch Focus**: Click the **Focus** button on the task; observe the Pomodoro timer auto-links to the task and subject.
3. **Run Timer**: Click **Start Focus** (or select the **1m Hackathon Demo Test** preset for quick verification). Wait for completion to hear the harmonic bell chime and see the celebration toast.
4. **Complete Task**: Click the checkbox on the task to complete it; observe the celebratory message.
5. **Verify Analytics**: Navigate to **Weekly Progress**; verify the completed session and task appear on today's chart column and increment the streak.
6. **Test AI Assistant**: Navigate to **AI Study Assistant**, enter "Computer Science" / "Binary Search Trees", click **Generate Study Guide**, inspect the explanation, add a plan step to tasks, and take the 3-question quiz.
7. **Refresh Browser**: Refresh the page; all tasks, sessions, and timetable data persist seamlessly in `localStorage`.
8. **Reset / Demo Data**: Test "Demo Data" and "Reset Data" in the top bar with confirmation modals.
