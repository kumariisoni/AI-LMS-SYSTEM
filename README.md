# AI-LMS-SYSTEM
### AI-Powered Learning Management System (Learnova AI)

A modern, full-stack enterprise Learning Management System featuring an adaptive **Google Gemini AI Tutor**, sequential video progression verification, role-based dashboards (Admin, Faculty, Student), and automated certificate generation.

---

## 🌟 Key Features

- **🤖 Google Gemini AI Learning Assistant**: Interactive contextual AI tutor grounded in course curriculum, lesson transcripts, and student learning history.
- **🔒 Sequential Course Progression**: Enforces linear chapter/lesson progression with minimum 90% video watch verification before completion.
- **🛡️ Role-Based Access Control (RBAC)**: Secure JWT authentication supporting `Admin`, `Faculty`, `Student`, and `AI_Agent` roles.
- **📊 Administration & Faculty Dashboards**: Complete management suite for courses, curriculum chapters/lessons, enrollments, users, and platform analytics.
- **🎓 Automated Certificate Issuance**: Generates verifiable unique completion certificates once 100% of course lessons are verified.
- **⚡ Production Ready & Containerized**: Ready for zero-downtime deployment on Render (Backend) and Vercel (Frontend).

---

## 🏗️ Architecture & Tech Stack

- **Backend**: ASP.NET Core (.NET 10 Web API), C#
- **Database**: MongoDB Atlas / MongoDB v7+
- **Authentication**: JWT Bearer Tokens with HMAC-SHA256 & BCrypt password hashing
- **AI Engine**: Google Gemini API (`gemini-1.5-flash` / `gemini-3.5-flash-lite`) via Google Generative AI
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Axios
- **Deployment**: Docker, Render Blueprint (`render.yaml`), Vercel

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js (v20+)](https://nodejs.org/) & npm
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) or MongoDB Atlas account

### 1. Clone & Configure Environment
```bash
git clone https://github.com/kumariisoni/AI-LMS-SYSTEM.git
cd AI-LMS-SYSTEM
```

Copy the example environment template:
```bash
cp .env.example .env
```

### 2. Run Backend (.NET 10 API)
```bash
cd backend/AI-LMS.API
dotnet restore
dotnet run
```
Backend API will start at: `http://localhost:5291` (Swagger docs available at `http://localhost:5291/swagger`).

### 3. Run Frontend (React + Vite)
```bash
cd ../../frontend/ai-lms-client
npm install
npm run dev
```
Frontend client will start at: `http://localhost:5173`.

---

## ⚙️ Environment Variables Reference

All credentials and sensitive keys are managed via environment variables. **No API keys or passwords are hardcoded in the codebase.**

| Variable | Required | Description | Example / Default |
|---|---|---|---|
| `MONGODB_URI` | **Yes** (Prod) | MongoDB connection URI | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority` |
| `MONGODB_DATABASE` | No | Database name | `AI_LMS` |
| `JWT_SECRET` | **Yes** (Prod) | 256-bit secret key for JWT signing (>= 32 chars) | `your_super_strong_random_secret_key_32_bytes!` |
| `Jwt__Issuer` | No | Token issuer | `AI-LMS` |
| `Jwt__Audience` | No | Token audience | `AI-LMS-Users` |
| `Gemini__ApiKey` | **Yes** | Google Gemini API key from Google AI Studio | `AIzaSy...` |
| `Gemini__Model` | No | Gemini Model name | `gemini-1.5-flash` |
| `ADMIN_EMAIL` | No | Initial admin email for first-run database seed | `admin@learnova.ai` |
| `ADMIN_PASSWORD` | Recommended | Initial admin password for first-run seed | `YourSecurePassword123!` |
| `FRONTEND_URL` | **Yes** (Prod) | Allowed origin for CORS (comma-separated for multiple) | `https://your-app.vercel.app` |
| `VITE_API_URL` | **Yes** (Prod) | Frontend environment variable pointing to Backend API | `https://your-backend.onrender.com/api` |

---

## 🌐 Production Deployment Guide

### Step 1: MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a database user and record the username and password.
3. Under **Network Access**, add `0.0.0.0/0` (Allow Access from Anywhere).
4. Click **Connect** -> **Drivers** and copy your connection string:
   `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority`

### Step 2: Backend Deployment on Render
1. Sign in to [Render](https://render.com/).
2. Click **New +** -> **Blueprint** and connect your GitHub repository `kumariisoni/AI-LMS-SYSTEM`.
3. Render will automatically detect [`render.yaml`](render.yaml).
4. In the Render environment configuration, enter your values:
   - `MONGODB_URI`: Your MongoDB Atlas connection URI from Step 1.
   - `Gemini__ApiKey`: Your Google Gemini API key.
   - `ADMIN_PASSWORD`: Your chosen secure administrator password.
   - `FRONTEND_URL`: Your Vercel frontend URL (can be updated after frontend deploy).
5. Deploy the service. Your backend URL will be: `https://<service-name>.onrender.com`.

### Step 3: Frontend Deployment on Vercel
1. Sign in to [Vercel](https://vercel.com/).
2. Click **Add New...** -> **Project** and import `kumariisoni/AI-LMS-SYSTEM`.
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend/ai-lms-client`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://<service-name>.onrender.com/api`
5. Click **Deploy**.

---

## 🔐 Security Features

- **Zero Hardcoded Secrets**: Secrets and API keys are strictly configured through environment variables.
- **Dynamic Seeding**: Admin passwords are configured securely at runtime; if omitted in production, a cryptographically secure random password is generated and displayed once in private deployment logs.
- **Connection Masking**: MongoDB URIs and passwords are automatically masked in health check diagnostics and logs (`mongodb://****@...`).
- **Resilient Startup**: Health check `/health` responds immediately to keep cloud orchestrators from prematurely terminating containers during startup.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
