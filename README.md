# GuidedGrowth: Gamified Growth Adventure

A gamified adventure app to encourage personal growth through exercise, meditation, and reading. Features a quest system, streak tracking, monthly scheduling, and daily bible quotes.

## 🚀 Getting Started

To run this application locally on your machine, follow these steps:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- A [Firebase Project](https://console.firebase.google.com/)

### 2. Installation
1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd GuidedGrowth
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

### 3. Configuration
1.  **Firebase Setup:**
    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Create a new project (or use an existing one).
    - Enable **Authentication** and add the **Google** sign-in provider.
    - Create a **Firestore Database** in your project.
    - Register a new **Web App** in your Firebase project settings.
    - Copy the Firebase configuration object and update the `firebase-applet-config.json` file in the root of your project.

2.  **Environment Variables:**
    - Create a `.env` file in the root directory.
    - Copy the contents from `.env.example` and provide your own values:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    APP_URL=http://localhost:3000
    ```

### 4. Running the App
1.  **Start the development server:**
    ```bash
    npm run dev
    ```
2.  **Open your browser:**
    Navigate to `http://localhost:3000` to see the app in action.

### 5. Deployment
You can deploy this app to platforms like Vercel, Netlify, or Firebase Hosting.
- **Important:** Remember to add your deployment URL to the **Authorized Domains** list in your Firebase Authentication settings so that Google Sign-In works.

## 🛠 Built With
- **React** (Frontend)
- **Firebase** (Authentication & Firestore)
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)
- **Motion** (Animations)
- **Vite** (Build Tool)

## 📜 License
This project is licensed under the Apache-2.0 License.
