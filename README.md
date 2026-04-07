# FinNest AI - Smart Family Finance Ecosystem

FinNest AI is a secure, high-performance **Next.js Web Application** designed for shared family expenses, goals, and AI-powered financial guidance. It is optimized for mobile-first usage and multi-generational financial literacy.

## 🚀 Core Pillars

### 1. Security & Identity Protocol
- **Multi-Tenant Isolation**: Families are partitioned via a unique `FamilyCode`.
- **Role-Based Access Control (RBAC)**: 
    - **Parents**: Auditors and Administrators.
    - **Children**: Gamified Learners.
    - **Viewers**: Observers.
- **Atomic Transactions**: Firestore transactions ensure data integrity for shared goal contributions.

### 2. AI Intelligence Layer (Genkit)
- **AI CFO Assistant**: Personalized spending insights and savings opportunities.
- **Financial DNA Scanner**: Behavioral AI that reveals your spending archetype (e.g., "Strategic Saver").
- **OCR Receipt Scanner**: Automated expense logging via Gemini Vision.
- **Monthly Audit Reports**: Professional report cards with discipline grades (A+ to F).

### 3. Gamification & Behavioral Economics
- **The Trust Meter**: Real-time transparency metric (60% Discipline, 40% Participation).
- **Intelligence XP**: A 5-tier ranking system (Rising Star to Financial Master).
- **Rewards Gallery**: Digital badges for financial milestones and discipline.

### 4. Interactive Learning Mode
- **Needs vs Wants Game**: Interactive sorting activity for kids to build financial IQ.
- **Virtual Vault**: Savings protocol for children to manage virtual allowances.

### 5. Multilingual Localization
- Full native interface support for:
    - **English**
    - **Hindi (हिन्दी)**
    - **Telugu (తెలుగు)**
    - **Tamil (தமிழ்)**

---

## 📱 How to "Install" as an App

### On iPhone (Safari)
1. Open your deployed URL in **Safari**.
2. Tap the **Share** button.
3. Tap **"Add to Home Screen"**.

### On Android (Chrome)
1. Open your deployed URL in **Chrome**.
2. Tap the **three dots** in the top-right.
3. Tap **"Install app"**.

---

## 🛠 Local Development Setup

1. **Download**: Zip and Download the project.
2. **Install**: Run `npm install`.
3. **Environment**: Setup `.env.local` with Firebase config.
4. **Run**: `npm run dev`.
