# 🧠 AI Learning Companion — Chrome Extension

An AI-powered Chrome Extension that helps you learn from any webpage using **Explain, Summary, Quiz, Notes & Dashboard**.

## ✨ Features

- 💡 **Explain** — Get simple explanation of any selected text
- 📝 **Summary** — Get bullet-point summary of selected text
- 🧪 **Quiz** — Generate MCQs and test yourself
- 📚 **Notes** — Save important notes with selected text
- 📊 **Dashboard** — Track your learning progress & quiz scores

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Python + FastAPI |
| AI | Groq (Llama 3.3 70B) |
| Database | PostgreSQL + SQLAlchemy |
| DevOps | Docker + Docker Compose |

## 🚀 Installation

1. Clone the repo:
```bash
git clone https://github.com/sandhyacgu/ai-learning-companion.git
cd ai-learning-companion
```

2. Build the extension:
```bash
cd extension
npm install
npm run build
```

3. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable **Developer mode**
   - Click **Load unpacked**
   - Select the `extension/dist` folder

4. Start using on any webpage — select text and click the extension icon!

## 🌐 Live Backend

API is live at: `https://ai-learning-companion-1-w3hw.onrender.com`

## 📸 How it works

1. Go to any webpage
2. Select any text
3. Open the extension
4. Use Explain, Summary, Quiz or Notes!