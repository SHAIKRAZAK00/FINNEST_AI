
# FinNest AI - Smart Family Finance

FinNest AI is a secure, high-performance **Next.js Web Application** designed for shared family expenses, goals, and AI-powered financial guidance. It is built to be fully responsive and mobile-optimized.

## 🚀 Getting Started

### 1. Download the Source Code
If you are in IDX/Firebase Studio, follow these steps:
1. **Right-click** on the project folder in the left sidebar.
2. **Select "Zip and Download"**.
3. **Alternatively**, run this command in the terminal to create a zip:
   `zip -r project.zip . -x "node_modules/*" ".next/*" ".git/*"`

### 2. Local Setup
1. **Extract** the downloaded `.zip` file on your computer.
2. **Open a terminal** in that folder.
3. **Install dependencies**: `npm install`
4. **Run the App**: `npm run dev`
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router / React 19)
- **Styling**: Tailwind CSS + Shadcn UI (Mobile-First Responsive Design)
- **Database & Auth**: Firebase (Firestore & Authentication)
- **AI Integration**: Google Gemini via Genkit
- **Icons**: Lucide React

## 📊 Global User Management
To see every user registered in your app:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project: **studio-5505416171-85472**.
3. **Authentication Tab**: This is the master list showing total user count and emails.
4. **Firestore Database Tab**: Navigate to `/families/{familyId}/members` to see profiles grouped by family.

---
*Built with ❤️ using Firebase and Next.js*
