# FinNest AI - Smart Family Finance

FinNest AI is a secure family finance ecosystem designed for shared expenses, goals, and AI-powered financial guidance.

## Features

- **Shared Family Dashboard:** Real-time visibility into family spending and goal progress.
- **Expense Tracking:** Log and categorize expenses with AI-powered receipt scanning.
- **Family Goals:** Set and achieve collective financial milestones together.
- **AI CFO Assistant:** Get personalized financial insights based on your family's spending habits.
- **Gamification:** Earn points, level up, and win badges for healthy financial behaviors.
- **Real-time Sync:** All data is synchronized instantly across all family members' devices using Firebase.

## How to Download & Run Locally

1. **Download:** Click the **Download** button in the top right of the Firebase Studio editor to get the project `.zip` file.
2. **Extract:** Unzip the folder on your computer.
3. **Install Dependencies:**
   ```bash
   npm install
   ```
4. **Environment Variables:** Create a `.env.local` file in the root directory and add your Firebase configuration (you can find these in `src/firebase/config.ts`).
5. **Run the App:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:9002](http://localhost:9002) in your browser.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + Shadcn UI
- **Database & Auth:** Firebase (Firestore & Authentication)
- **AI Integration:** Google Gemini via Genkit
- **Icons:** Lucide React

## How to Push to GitHub

1. **Create a Repository:** Go to [GitHub](https://github.com/new) and create a new repository.
2. **Initialize Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: FinNest AI"
   ```
3. **Connect & Push:**
   ```bash
   git branch -M main
   git remote add origin <YOUR_GITHUB_REPO_URL>
   git push -u origin main
   ```
