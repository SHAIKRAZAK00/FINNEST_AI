# FinNest AI - Smart Family Finance

FinNest AI is a secure family finance ecosystem designed for shared expenses, goals, and AI-powered financial guidance.

## 🚀 Getting Started

### 1. Download the Source Code
To get the project files on your computer:
1. Look at the **top right corner** of this Firebase Studio window.
2. Click the **Download** button (it looks like a cloud icon with a downward arrow).
3. This will download a `.zip` file containing all the source code.

### 2. Local Setup
1. **Extract** the downloaded `.zip` file to a folder on your computer.
2. **Open a terminal** in that folder.
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Environment Variables**: Create a `.env.local` file in the root directory and add your Firebase configuration (copy the values from `src/firebase/config.ts`).
5. **Run the App**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:9002](http://localhost:9002) in your browser.

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Shadcn UI
- **Database & Auth**: Firebase (Firestore & Authentication)
- **AI Integration**: Google Gemini via Genkit
- **Icons**: Lucide React

## 📦 How to Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new).
2. Initialize and push your code:
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
