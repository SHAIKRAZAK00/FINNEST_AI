# FinNest AI - Smart Family Finance

FinNest AI is a secure, high-performance **Next.js Web Application** designed for shared family expenses, goals, and AI-powered financial guidance. It is optimized for mobile-first usage.

## 🚀 How to Deploy

### 1. Firebase App Hosting (Recommended)
This project is pre-configured for **Firebase App Hosting**.
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. In the left menu, go to **Build > App Hosting**.
4. Click **Get Started** and connect your GitHub repository.
5. Firebase will automatically build and deploy your app every time you push to GitHub.

### 2. Manual Deployment in Studio
If you are currently in Firebase Studio:
1. Look for the **"Deploy"** button in the header bar (usually top-right).
2. Click it to trigger a live deployment to your Firebase project URL.

---

## 📱 How to "Install" as an App

Since this is a Progressive Web App (PWA), you can install it on your phone without an App Store:

### On iPhone (Safari)
1. Open your deployed URL in **Safari**.
2. Tap the **Share** button (box with upward arrow).
3. Scroll down and tap **"Add to Home Screen"**.
4. Tap **Add**. FinNest AI will now appear on your home screen like a native app.

### On Android (Chrome)
1. Open your deployed URL in **Chrome**.
2. Tap the **three dots** in the top-right corner.
3. Tap **"Install app"** or **"Add to Home screen"**.
4. Follow the prompts. It will now appear in your app drawer.

---

## 🛠 Local Development Setup

1. **Download**: Right-click the project folder in the sidebar and select "Zip and Download".
2. **Extract**: Unzip the file on your machine.
3. **Install Dependencies**: Run `npm install` in the terminal.
4. **Environment Variables**: Create a `.env.local` file and paste your Firebase config.
5. **Run Locally**: Run `npm run dev`. Open `http://localhost:3000`.

## 📤 How to Push to GitHub
1. Create a new repository on GitHub.
2. In your local terminal:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

---
*Built with ❤️ using Firebase and Next.js*
