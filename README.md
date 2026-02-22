# FinNest AI - Smart Family Finance

FinNest AI is a secure family finance ecosystem designed for shared expenses, goals, and AI-powered financial guidance.

## Features

- **Shared Family Dashboard:** Real-time visibility into family spending and goal progress.
- **Expense Tracking:** Log and categorize expenses with AI-powered receipt scanning.
- **Family Goals:** Set and achieve collective financial milestones.
- **AI CFO Assistant:** Get personalized financial insights based on your family's spending habits.
- **Gamification:** Earn points and badges for healthy financial behaviors.
- **Real-time Sync:** All data is synchronized across devices using Firebase Firestore and Authentication.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS + Shadcn UI
- **Database & Auth:** Firebase (Firestore & Authentication)
- **AI Integration:** Google Gemini via Genkit
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js installed
- A Firebase project

### Setup

1. Clone the repository or download the source code.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your Firebase environment variables in `.env` (refer to `src/firebase/config.ts`).
4. Run the development server:
   ```bash
   npm run dev
   ```

## How to Push to GitHub

Follow these steps to host your project on GitHub:

1. **Create a Repository:** Go to [GitHub](https://github.com/new) and create a new repository (do not initialize with README or license).
2. **Initialize Local Git:**
   ```bash
   git init
   ```
3. **Add Files:**
   ```bash
   git add .
   ```
4. **Commit:**
   ```bash
   git commit -m "Initial commit: FinNest AI with Firebase synchronization"
   ```
5. **Rename Branch:**
   ```bash
   git branch -M main
   ```
6. **Add Remote:**
   ```bash
   git remote add origin <YOUR_GITHUB_REPO_URL>
   ```
7. **Push:**
   ```bash
   git push -u origin main
   ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.
