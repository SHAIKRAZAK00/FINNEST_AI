
# FinNest AI - Smart Family Finance

FinNest AI is a secure family finance ecosystem designed for shared expenses, goals, and AI-powered financial guidance.

## 🚀 Getting Started

### 1. Download the Source Code
If you are in IDX, follow these steps:
1.  **Right-click** on the project folder in the left sidebar.
2.  **Select "Zip and Download"**.
3.  Alternatively, run this in the terminal: `zip -r project.zip . -x "node_modules/*" ".next/*" ".git/*"`

### 2. Local Setup
1. **Extract** the downloaded `.zip` file on your computer.
2. **Open a terminal** in that folder.
3. **Install dependencies**: `npm install`
4. **Run the App**: `npm run dev`
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database & Users
To see your users in the backend:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. **Authentication**: See login credentials and UIDs.
3. **Firestore Database**:
   - Navigate to `/families/{familyId}`.
   - Open the `members` subcollection to see profile details (Role, Name, Points, Badges).

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Shadcn UI
- **Database & Auth**: Firebase (Firestore & Authentication)
- **AI Integration**: Google Gemini via Genkit
- **Icons**: Lucide React

## 📦 How to Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new).
2. On your computer, run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: FinNest AI"
   git branch -M main
   git remote add origin <YOUR_GITHUB_REPO_URL>
   git push -u origin main
   ```

---
*Built with ❤️ using Firebase and Next.js*
