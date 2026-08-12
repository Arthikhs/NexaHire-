# 🚀 NexaHire – Job Portal (Microservices)

<div align="center">

![NexaHire Banner](https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/nature-mountains.jpg)

A production-grade **Job Portal** built with **Microservices Architecture** where all services communicate through **Apache Kafka**. NexaHire offers **20+ features** including AI mock interviews, resume analysis, real-time messaging, skill endorsements, job alerts, open source hub and much more.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-3.x-red?style=flat-square&logo=apache-kafka)](https://kafka.apache.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-NeonDB-blue?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Redis](https://img.shields.io/badge/Redis-Upstash-red?style=flat-square&logo=redis)](https://upstash.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](https://opensource.org/licenses/MIT)

</div>

---

## 📌 Table of Contents

- [Live Features](#-live-features)
- [Tech Stack](#-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Environment Setup](#️-environment-setup)
- [Kafka Setup](#-kafka-setup-windows)
- [Running the Project](#-running-the-project)
- [Service Port Reference](#-service-port-reference)
- [Microservices Communication Flow](#-microservices-communication-flow)
- [API Overview](#-api-overview)
- [Troubleshooting](#️-troubleshooting)
- [What You Will Learn](#-what-you-will-learn)
- [Built With](#-built-with)
- [Interview Questions](#-interview-questions)
- [License](#-license)

---

## 🌟 Live Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | 🤖 AI Resume Analyser | ATS score, keyword analysis & improvement suggestions via Google Gemini |
| 2 | 🧭 Career Guide | AI-powered career path recommendations based on your skills |
| 3 | 💼 Job Listings | Browse, filter & apply for jobs with real-time notifications |
| 4 | 📋 Application Tracker | Kanban board to track all your job applications |
| 5 | 🔗 Referral System | Request & give referrals with trust score system |
| 6 | ❓ Interview Questions | Community-sourced Q&A with voting system |
| 7 | 📰 Personalized Feed | AI skill-matched job feed with filters |
| 8 | 🏆 Hiring Challenges | Real company challenges with interview rewards |
| 9 | 🌿 Open Source Hub | Discover & contribute to open source projects |
| 10 | 💬 Recruiter-Candidate Messaging | Real-time WebSocket chat between recruiters & candidates |
| 11 | 🎯 Mock Interview (AI) | 4-round full mock — Aptitude, Coding, Face-to-Face & HR |
| 12 | 💰 Job Salary Insights | Crowdsourced salary data by role, company & location |
| 13 | 🏢 Company Culture Reviews | Rate & review companies like Glassdoor |
| 14 | 👍 Skill Endorsements | Community-powered skill verification on profiles |
| 15 | 🔔 Job Alert Notifications | Real-time alerts when matching jobs are posted |
| 16 | 📄 Resume Portfolio Builder | Build beautiful resumes with multiple themes |
| 17 | 💻 Coding Contest | Live code execution with Judge0 + AI problems |
| 18 | 🗺️ Learning Roadmaps | AI step-by-step learning paths for any skill |
| 19 | 🌐 Remote Jobs Hub | Dedicated remote job board |
| 20 | 🎤 Expert Speak | AI-delivered expert conference talks |
| 21 | 📊 Skill Gap Analyzer | Analyze skill gaps for your target job role |
| 22 | 🔮 RoleSense | AI-powered job role matcher based on your profile |
| 23 | 📝 Cover Letter Generator | AI-generated personalized cover letters |
| 24 | 💡 Salary Predictor | AI salary prediction by role, skills & location |
| 25 | 🎓 Interview Feedback | AI feedback on your mock interview answers |

---

## 🔧 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16, TypeScript | UI Framework |
| Styling | Tailwind CSS, ShadCN UI | Component Library |
| Backend | Node.js, Express.js, TypeScript | REST APIs |
| Database | PostgreSQL (NeonDB serverless) | Primary Database |
| Message Broker | Apache Kafka (KafkaJS) | Event-driven Communication |
| Cache | Redis (Upstash) | Caching & Session |
| Real-time | WebSocket (ws) | Live Messaging |
| File Upload | Cloudinary | Image & File Storage |
| AI | Google Gemini 2.5 Flash | AI Features |
| Payments | Razorpay | Payment Gateway |
| Email | Nodemailer + Gmail SMTP | Email Notifications |
| Code Execution | Judge0 API | Live Code Runner |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     NexaHire Architecture                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────┐     HTTP/REST      ┌─────────────────────┐  │
│   │ Next.js  │ ──────────────────▶│   Backend Services  │  │
│   │ Frontend │                    │  (12 Microservices) │  │
│   └──────────┘                    └─────────┬───────────┘  │
│                                             │               │
│                                    Kafka Producer           │
│                                             │               │
│                                             ▼               │
│                                    ┌────────────────┐       │
│                                    │  Apache Kafka  │       │
│                                    │  (port 9092)   │       │
│                                    └────────┬───────┘       │
│                                             │               │
│                                    Kafka Consumer           │
│                                             │               │
│                                             ▼               │
│                                    ┌────────────────┐       │
│                                    │  Utils Service │       │
│                                    │ Email/AI/Upload│       │
│                                    └────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
NexaHire/
├── frontend/                        # Next.js 16 frontend (port 3000)
│   ├── src/
│   │   ├── app/                     # Next.js App Router pages
│   │   │   ├── (auth)/              # Login, Register, Forgot, Reset
│   │   │   ├── jobs/                # Job listings & details
│   │   │   ├── account/             # User profile
│   │   │   ├── tracker/             # Kanban board
│   │   │   ├── insights/            # Salary & company reviews
│   │   │   ├── questions/           # Interview Q&A
│   │   │   ├── resume-score/        # Resume scoring
│   │   │   └── dashboard/           # User dashboard
│   │   ├── components/              # Reusable UI components
│   │   ├── context/                 # Global state (AppContext)
│   │   ├── lib/                     # Utility functions
│   │   └── type.ts                  # TypeScript types
│   ├── public/                      # Static assets
│   └── package.json
│
└── services/
    ├── auth/                        # Auth service (port 5000)
    │   └── src/
    │       ├── controllers/         # auth.ts
    │       ├── middleware/          # multer, rateLimiter
    │       ├── routes/              # auth routes
    │       └── utils/               # db, buffer, TryCatch
    │
    ├── utils/                       # Upload / AI / Mail service (port 5001)
    │   └── src/
    │       ├── routes.ts            # All AI + upload endpoints
    │       ├── consumer.ts          # Kafka mail consumer
    │       └── index.ts             # Cloudinary + server setup
    │
    ├── user/                        # User profile + skill endorsements (port 5002)
    ├── job/                         # Jobs + alerts + notifications (port 5003)
    ├── payment/                     # Razorpay payments (port 5004)
    ├── tracker/                     # Kanban + reminders (port 5005)
    ├── insights/                    # Salary data + company reviews (port 5006)
    ├── feed/                        # Personalized job feed (port 5007)
    ├── questions/                   # Interview Q&A (port 5008)
    ├── referral/                    # Referral system (port 5009)
    ├── opensource/                  # Open Source Hub (port 5010)
    └── messaging/                   # Real-time messaging (port 5011)
```

---

## ✅ Prerequisites

Install these before starting:

| Tool | Version | Link |
|------|---------|------|
| Node.js | v18+ | [Download](https://nodejs.org/) |
| Java JDK | 11+ (for Kafka) | [Download](https://adoptium.net/) |
| Apache Kafka | 3.x | [Download](https://kafka.apache.org/downloads) |
| PostgreSQL | NeonDB (free) | [Sign up](https://neon.tech) |
| Redis | Upstash (free) | [Sign up](https://upstash.com) |
| Cloudinary | Free tier | [Sign up](https://cloudinary.com) |
| Google Gemini | API Key | [Get Key](https://aistudio.google.com) |
| Razorpay | Test mode | [Sign up](https://razorpay.com) |
| Gmail | App Password | [Setup](https://myaccount.google.com/apppasswords) |

---

## ⚙️ Environment Setup

Create `.env` files inside each service folder:

### `services/auth/.env`
```env
PORT=5000
DB_URL=your_neondb_connection_string
UPLOAD_SERVICE=http://localhost:5001
JWT_SEC=your_jwt_secret_key
Kafka_Broker=localhost:9092
Frontend_Url=http://localhost:3000
Redis_url=your_upstash_redis_url
```

### `services/utils/.env`
```env
PORT=5001
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
Kafka_Broker=localhost:9092
SMTP_USER=youremail@gmail.com
SMTP_PASS=your_gmail_app_password
API_KEY_GEMINI=your_gemini_api_key
```

### `services/user/.env`
```env
PORT=5002
DB_URL=your_neondb_connection_string
UPLOAD_SERVICE=http://localhost:5001
JWT_SEC=your_jwt_secret_key
```

### `services/job/.env`
```env
PORT=5003
DB_URL=your_neondb_connection_string
UPLOAD_SERVICE=http://localhost:5001
JWT_SEC=your_jwt_secret_key
Kafka_Broker=localhost:9092
Redis_url=your_upstash_redis_url
```

### `services/payment/.env`
```env
PORT=5004
Razorpay_Key=your_razorpay_key_id
Razorpay_Secret=your_razorpay_key_secret
DB_URL=your_neondb_connection_string
JWT_SEC=your_jwt_secret_key
```

### `services/tracker/.env`
```env
PORT=5005
DB_URL=your_neondb_connection_string
JWT_SEC=your_jwt_secret_key
Redis_url=your_upstash_redis_url
```

### `services/insights/.env`
```env
PORT=5006
DB_URL=your_neondb_connection_string
JWT_SEC=your_jwt_secret_key
```

### `services/feed/.env`
```env
PORT=5007
DB_URL=your_neondb_connection_string
JWT_SEC=your_jwt_secret_key
Redis_url=your_upstash_redis_url
```

### `services/questions/.env`
```env
PORT=5008
DB_URL=your_neondb_connection_string
JWT_SEC=your_jwt_secret_key
```

### `services/referral/.env`
```env
PORT=5009
DB_URL=your_neondb_connection_string
JWT_SEC=your_jwt_secret_key
```

### `services/opensource/.env`
```env
PORT=5010
DB_URL=your_neondb_connection_string
JWT_SEC=your_jwt_secret_key
```

### `services/messaging/.env`
```env
PORT=5011
DB_URL=your_neondb_connection_string
JWT_SEC=your_jwt_secret_key
```

> ⚠️ Use the **same** `JWT_SEC` value across all services.

---

## 🐘 Kafka Setup (Windows)

### Step 1 — Download Kafka
1. Go to https://kafka.apache.org/downloads
2. Download latest binary (e.g. `kafka_2.13-3.9.0.tgz`)
3. Extract to `C:\kafka`

### Step 2 — Start Zookeeper
```cmd
cd C:\kafka
.\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties
```
✅ Wait for: `binding to port 0.0.0.0/0.0.0.0:2181`

### Step 3 — Start Kafka Broker
```cmd
cd C:\kafka
.\bin\windows\kafka-server-start.bat .\config\server.properties
```
✅ Wait for: `[KafkaServer id=0] started`

> ⚠️ Always start Zookeeper **before** Kafka Broker.

---

## 🚀 Running the Project

> **Order:** Kafka → Backend Services → Frontend

### Backend Services

```cmd
# Auth Service (port 5000)
cd services\auth && npm install && npm run dev

# Utils Service (port 5001)
cd services\utils && npm install && npm run dev

# User Service (port 5002)
cd services\user && npm install && npm run dev

# Job Service (port 5003)
cd services\job && npm install && npm run dev

# Payment Service (port 5004)
cd services\payment && npm install && npm run dev

# Tracker Service (port 5005)
cd services\tracker && npm install && npm run dev

# Insights Service (port 5006)
cd services\insights && npm install && npm run dev

# Feed Service (port 5007)
cd services\feed && npm install && npm run dev

# Questions Service (port 5008)
cd services\questions && npm install && npm run dev

# Referral Service (port 5009)
cd services\referral && npm install && npm run dev

# OpenSource Service (port 5010)
cd services\opensource && npm install && npm run dev

# Messaging Service (port 5011)
cd services\messaging && npm install && npm run dev
```

### Frontend

```cmd
cd frontend && npm install && npm run dev
```

Open: **http://localhost:3000** 🎉

---

## 📡 Service Port Reference

| Service | Port | Description |
|---------|------|-------------|
| Frontend (Next.js) | 3000 | UI |
| Auth Service | 5000 | Login, Register, JWT |
| Utils Service | 5001 | Upload, AI, Email |
| User Service | 5002 | Profile, Endorsements |
| Job Service | 5003 | Jobs, Alerts, Notifications |
| Payment Service | 5004 | Razorpay Subscriptions |
| Tracker Service | 5005 | Kanban, Reminders |
| Insights Service | 5006 | Salary, Reviews |
| Feed Service | 5007 | Personalized Feed |
| Questions Service | 5008 | Interview Q&A |
| Referral Service | 5009 | Referral System |
| OpenSource Service | 5010 | Open Source Hub |
| Messaging Service | 5011 | Real-time Chat |
| Kafka Broker | 9092 | Message Broker |
| Zookeeper | 2181 | Kafka Coordinator |

---

## 🔀 Microservices Communication Flow

```
User Action (Frontend)
       │
       ▼
  Backend Service  ──── Kafka Producer ────▶  Kafka Topic (send-mail)
  (auth / job)                                        │
                                                      ▼
                                             Utils Service (Consumer)
                                                      │
                                              ┌───────┴───────┐
                                              ▼               ▼
                                         Send Email     Upload / AI

File Upload Flow:
  Frontend → multipart/form-data → Service (auth/user/job)
                                          ↓
                                 Convert to base64 buffer
                                          ↓
                                 POST /api/utils/upload
                                          ↓
                                 Cloudinary → secure_url
```

---

## 📮 API Overview

### Utils Service (`/api/utils`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload file to Cloudinary |
| POST | `/career` | AI career path suggestions |
| POST | `/resume-analyser` | ATS resume analysis |
| POST | `/resume-builder` | AI resume builder |
| POST | `/rolesense` | AI job role matcher |
| POST | `/ncat` | Aptitude test generator |
| POST | `/skill-gap` | Skill gap analysis |
| POST | `/expert-speak` | AI expert talks |
| POST | `/learning-roadmap` | AI learning roadmap |
| POST | `/coding-contest` | Coding problems generator |
| POST | `/job-match` | Job match scorer |
| POST | `/cover-letter` | AI cover letter generator |
| POST | `/salary-predictor` | AI salary predictor |
| POST | `/resume-score` | Resume vs JD scorer |
| POST | `/interview-feedback` | AI interview feedback |

---

## 🛠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| `Kafka connection refused` | Make sure Zookeeper + Kafka broker are both running |
| `DB connection error` | Check `DB_URL` in `.env` — use NeonDB connection string |
| `Redis connection error` | Check `Redis_url` in `.env` — use Upstash URL |
| `Gemini API error` | Verify `API_KEY_GEMINI` in `services/utils/.env` |
| `Cloudinary upload error` | Check `CLOUD_NAME`, `API_KEY`, `API_SECRET` in utils `.env` |
| `Email not sending` | Use Gmail App Password, not your regular password |
| `Port already in use` | Kill the process or change `PORT` in `.env` |
| `TypeScript errors` | Run `npm run build` inside the service to check |
| `Razorpay error` | Make sure you are using test mode keys |
| `CORS error` | Ensure `Frontend_Url` is set correctly in auth `.env` |

---

## 📘 What You Will Learn

- ✅ Microservices architecture (production-grade)
- ✅ Kafka event-driven communication between services
- ✅ AI integration with Google Gemini 2.5 Flash
- ✅ Resume ATS analysis & career path recommendation
- ✅ Real-time WebSocket communication
- ✅ Email notification workflows via Kafka + Nodemailer
- ✅ Subscription system with Razorpay
- ✅ Password reset flow with tokenized email links
- ✅ Redis caching in auth & job services
- ✅ Cloudinary file upload service
- ✅ JWT-based authentication across services
- ✅ TypeScript end-to-end (frontend + backend)
- ✅ Next.js 16 App Router with server/client components
- ✅ Kanban board implementation
- ✅ Real-time job alert notifications
- ✅ Live code execution with Judge0

---

## 👨‍💻 Built With

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16 | Frontend framework |
| Express.js | 5.x | Backend REST APIs |
| Apache Kafka | 3.x | Event-driven communication |
| PostgreSQL (NeonDB) | Latest | Serverless database |
| Redis (Upstash) | Latest | Caching & sessions |
| Google Gemini | 2.5 Flash | AI features |
| WebSocket (ws) | Latest | Real-time messaging |
| Cloudinary | 2.x | File & image storage |
| Razorpay | Latest | Payment gateway |
| Judge0 | Latest | Live code execution |
| KafkaJS | 2.x | Kafka client for Node.js |
| Nodemailer | 7.x | Email service |

---

## 📄 License

MIT License — feel free to use, modify and distribute.

```
MIT License

Copyright (c) 2025 NexaHire

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software.
```

---

## ❓ Interview Questions

Common questions asked about this project in interviews:

### ☁️ Cloudinary Questions

| # | Question | Answer |
|---|----------|--------|
| 1 | How do I get Cloudinary credentials? | Sign up at cloudinary.com → Dashboard → copy CLOUD_NAME, API_KEY, API_SECRET |
| 2 | Why is Cloudinary only in utils service? | Centralized upload service — all other services call `/api/utils/upload` via HTTP |
| 3 | What is `UPLOAD_SERVICE` env variable? | Points to utils service URL `http://localhost:5001` |
| 4 | How does file go from frontend to Cloudinary? | Frontend → multipart/form-data → Service → base64 buffer → POST /api/utils/upload → Cloudinary |
| 5 | Why convert file to base64 before uploading? | Services communicate via HTTP JSON — base64 allows binary files to be sent as JSON string |
| 6 | What is `public_id` used for? | Unique identifier of file in Cloudinary — used to delete old file before uploading new one |
| 7 | How to delete old image when uploading new one? | Pass `public_id` in request body — upload route calls `cloudinary.v2.uploader.destroy(public_id)` first |
| 8 | What does `secure_url` return? | HTTPS URL of the uploaded file hosted on Cloudinary CDN |
| 9 | Can PDFs and images use same upload endpoint? | Yes — `/api/utils/upload` handles all file types |
| 10 | What is the file size limit? | 50mb — set in `express.json({ limit: "50mb" })` in utils `index.ts` |
| 11 | Why `Cloudinary upload error`? | Check `CLOUD_NAME`, `API_KEY`, `API_SECRET` are correct in `services/utils/.env` |
| 12 | Which services use Cloudinary? | `auth` (profile photo), `user` (profile photo), `job` (company logo) |

---

### 🧪 Testing Questions (Node.js)

| # | Question | Answer |
|---|----------|--------|
| 1 | Can JUnit + Mockito be used in this project? | No — JUnit & Mockito are Java frameworks. This project uses Node.js + TypeScript |
| 2 | What is the Node.js equivalent of JUnit? | **Jest** — test runner + assertions |
| 3 | What is the Node.js equivalent of Mockito? | **Jest mocks** — `jest.fn()`, `jest.spyOn()` |
| 4 | What is equivalent of Mockito `when().thenReturn()`? | `jest.fn().mockResolvedValue()` for async mocks |
| 5 | What is equivalent of JUnit `@BeforeEach`? | `beforeEach()` in Jest |
| 6 | What library is used for HTTP endpoint testing? | **Supertest** — used with Jest to test Express routes |
| 7 | How to mock Cloudinary in tests? | `jest.spyOn(cloudinary.v2.uploader, "upload").mockResolvedValue({ secure_url, public_id })` |

---

### 🏗️ Architecture Questions

| # | Question | Answer |
|---|----------|--------|
| 1 | What architecture does NexaHire use? | Microservices architecture — 12 independent services |
| 2 | How do services communicate? | Apache Kafka for async events + HTTP REST for direct calls |
| 3 | Why use Kafka instead of direct HTTP calls? | Decoupling, fault tolerance, async processing — e.g. email sending doesn't block auth service |
| 4 | Which services produce Kafka messages? | `auth` and `job` services produce to `send-mail` topic |
| 5 | Which service consumes Kafka messages? | `utils` service consumes and sends emails via Nodemailer |
| 6 | Why is JWT_SEC same across all services? | All services need to verify the same JWT token issued by auth service |
| 7 | What is the role of utils service? | Centralized service for Cloudinary uploads, AI (Gemini), and email sending |
| 8 | Why use Redis in this project? | Caching job listings and auth sessions — reduces DB load and improves response time |
| 9 | Can the backend be rewritten in Java/Spring Boot? | Technically yes, but not recommended — massive effort to rewrite 12 services |
| 10 | Why Next.js over plain React.js? | SEO (job listings need to be indexed), App Router, Server Components, built-in routing |
| 11 | What is the frontend framework? | Next.js 16 with TypeScript, Tailwind CSS and ShadCN UI |
| 12 | Can frontend be converted from TypeScript to JavaScript? | Yes, but not recommended — TypeScript catches bugs at compile time, already fully set up |
| 13 | How many microservices does NexaHire have? | 12 backend services + 1 frontend = 13 total |
| 14 | What port does each service run on? | Frontend: 3000, Auth: 5000, Utils: 5001, User: 5002 ... Messaging: 5011 |
| 15 | What database does this project use? | PostgreSQL via NeonDB (serverless, free tier) |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
  <strong>⭐ Star this repo if you found it helpful!</strong><br/><br/>
  Built with ❤️ using Next.js, Node.js & Apache Kafka<br/><br/>
  <a href="https://github.com">GitHub</a> •
  <a href="http://localhost:3000">Live Demo</a> •
  <a href="#-table-of-contents">Back to Top ↑</a>
</div>
