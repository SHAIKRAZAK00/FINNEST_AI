# FinNest AI - Smart Family Finance

FinNest AI is a secure family finance ecosystem designed for shared expenses, goals, and AI-powered financial guidance.

## 🚀 Getting Started

### 1. Download the Source Code
If you are in IDX, you can download your code directly:
1. **Find the file explorer** on the far left side.
2. **Right-click** on the project folder (usually named `studio`).
3. **Select "Download"** or **"Zip and Download"**.

**Alternatively, use the Terminal:**
1. Open the Terminal at the bottom.
2. Copy and paste this command: `zip -r project.zip . -x "node_modules/*" ".next/*" ".git/*"`
3. Look at the file explorer on the left, find `project.zip`, **Right-click** it, and select **Download**.

### 2. Local Setup
1. **Extract** the downloaded `.zip` file on your computer.
2. **Open a terminal** in that folder.
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Environment Variables**: The Firebase config is already in `src/firebase/config.ts`. For local development, you might want to create a `.env.local` if you add more secrets later.
5. **Run the App**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Shadcn UI
- **Database & Auth**: Firebase (Firestore & Authentication)
- **AI Integration**: Google Gemini via Genkit
- **Icons**: Lucide React

## 📦 How to Push to GitHub
1. Create a new repository on [GitHub](https://github.com/new). Do **not** initialize it with a README or License.
2. On your computer, open a terminal in your project folder and run:
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
