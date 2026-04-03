# 🚀 AI Marketing Intelligence & Content Engine

An AI-powered marketing workspace built with React + FastAPI + Google Gemini.

---

## 🛠 Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18, Vite, TailwindCSS v3    |
| Backend  | FastAPI, Python 3.10+             |
| Database | SQLite (via SQLAlchemy)           |
| AI       | Google Gemini 1.5 Flash (Free)    |

---

## ⚡ Local Setup (Step by Step)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd ai-marketing-engine
```

### 2. Get your FREE Google API Key
- Go to: https://aistudio.google.com/app/apikey
- Sign in → Create API Key → Copy it

### 3. Setup Backend
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Mac/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Open .env and paste your Google API key

# Run backend
uvicorn app.main:app --reload --port 8000
```
Backend runs at: http://localhost:8000
API docs at: http://localhost:8000/docs

### 4. Setup Frontend
```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Run frontend
npm run dev
```
Frontend runs at: http://localhost:5173

---

## 📦 Features

### ✅ Module 1 — Brand & Campaign Setup
- Define brand name, industry, target audience
- Select up to 3 brand tones
- Set keywords to include/avoid
- AI validates tone vs platform compatibility

### ✅ Module 2 — Content Generation Hub
- Generate 18 content pieces from a single topic
- LinkedIn (x3), Instagram, Twitter (x5), Video Scripts, Email, Blog Outline, Google Ads, SEO Meta
- Per-card copy button and AI refinement box

### ✅ Module 3 — Content Repurposing Engine
- Paste blog/podcast/webinar content
- AI extracts key insights, quotable lines, summary
- Content coverage map
- Auto-generates all formats from Module 2

### ✅ Module 4 — Ad Copy A/B Testing
- 5 variants per platform (Emotional, Logical, Urgency, Social Proof, Curiosity)
- Mark variants as Testing / Winner / Rejected
- AI recommendation + performance prediction
- Export as CSV

### ✅ Module 5 — Audience & Sentiment Intelligence
- Upload customer reviews CSV
- Sentiment score bars (Positive/Neutral/Negative)
- Top themes, high-impact quotes
- Campaign angles suggestion
- Word cloud visualization

### ✅ Module 6 — Campaign Content Calendar
- Monthly calendar grid
- Drag & drop scheduling
- Platform filter
- Content gap warnings
- AI posting schedule suggestion
- Export as CSV

---

## 🚀 Deployment

### Backend → Render.com (Free)
1. Push code to GitHub
2. Go to render.com → New Web Service
3. Connect your GitHub repo
4. Settings:
   - Root: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variable: `GOOGLE_API_KEY=your_key`

### Frontend → Vercel (Free)
1. Go to vercel.com → Import GitHub repo
2. Settings:
   - Root: `frontend`
   - Build: `npm run build`
   - Output: `dist`
3. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com/api`

---

## Known Limitations
- Calendar drag-and-drop doesn't persist across page refresh without refetching
- Sentiment analysis works best with 50+ reviews
- Google Gemini free tier has rate limits (15 requests/min)

---

## License
MIT
# Marketing_Engine
