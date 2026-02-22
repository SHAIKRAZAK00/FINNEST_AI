# FinNest AI - Smart Family Finance

FinNest AI is a secure family finance ecosystem designed for shared expenses, goals, and AI-powered financial guidance.

## Features

- **Shared Family Dashboard:** Real-time visibility into family spending and goal progress.
- **Expense Tracking:** Log and categorize expenses with AI-powered receipt scanning.
- **Family Goals:** Set and achieve collective financial milestones.
- **AI CFO Assistant:** Get personalized financial insights based on your family's spending habits.
- **Gamification:** Earn points and badges for healthy financial behaviors.
- **Real-time Sync:** All data is synchronized across devices using Firebase.

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

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your Firebase environment variables in `.env` (refer to `src/firebase/config.ts`).
4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.
