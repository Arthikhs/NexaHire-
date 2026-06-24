# 🚀 NexaHire –Job Portal (Microservices)

A production-grade **Job Portal** built with **Microservices Architecture** where all services communicate through **Apache Kafka**. NexaHire offers 20+ features including AI mock interviews, resume analysis, real-time messaging, skill endorsements, job alerts, open source hub and much more.

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

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS, ShadCN UI |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL (NeonDB serverless) |
| Message Broker | Apache Kafka (KafkaJS) |
| Cache | Redis (Upstash) |
| Real-time | WebSocket (ws) |
| File Upload | Cloudinary |
| AI | Google Gemini 2.5 Flash |
| Payments | Razorpay |
| Email | Nodemailer + Gmail SMTP |
| Code Execution | Judge0 API |

---

## 📁 Project Structure

```
NexaHire/
├── frontend/                  # Next.js frontend (port 3000)
└── services/
    ├── auth/                  # Auth service (port 5000)
    ├── utils/                 # Upload / AI / Mail service (port 5001)
    ├── user/                  # User profile + skill endorsements (port 5002)
    ├── job/                   # Jobs + alerts + notifications (port 5003)
    ├── payment/               # Razorpay payments (port 5004)
    ├── tracker/               # Kanban + reminders (port 5005)
    ├── insights/              # Salary data + company reviews (port 5006)
    ├── feed/                  # Personalized job feed (port 5007)
    ├── questions/             # Interview Q&A (port 5008)
    ├── referral/              # Referral system (port 5009)
    ├── opensource/            # Open Source Hub (port 5010)
    └── messaging/             # Real-time messaging (port 5011)
```

---

## ✅ Prerequisites

Install these before starting:

- [Node.js](https://nodejs.org/) v18+
- [Java JDK 11+](https://adoptium.net/) (required for Kafka)
- [Apache Kafka](https://kafka.apache.org/downloads) 3.x
- PostgreSQL database — use [NeonDB](https://neon.tech) free tier
- Redis — use [Upstash](https://upstash.com) free tier
- [Cloudinary](https://cloudinary.com) account (free tier)
- [Google AI Studio](https://aistudio.google.com) — Gemini API Key
- [Razorpay](https://razorpay.com) account (test mode)
- Gmail account with [App Password](https://myaccount.google.com/apppasswords)

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
Wait for: `binding to port 0.0.0.0/0.0.0.0:2181`

### Step 3 — Start Kafka Broker
```cmd
cd C:\kafka
.\bin\windows\kafka-server-start.bat .\config\server.properties
```
Wait for: `[KafkaServer id=0] started`

---

## 🚀 Running the Project

> Start Kafka first, then all services, then frontend.

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

Open: **http://localhost:3000**

---

## 📡 Service Port Reference

| Service | Port |
|---------|------|
| Frontend (Next.js) | 3000 |
| Auth Service | 5000 |
| Utils Service | 5001 |
| User Service | 5002 |
| Job Service | 5003 |
| Payment Service | 5004 |
| Tracker Service | 5005 |
| Insights Service | 5006 |
| Feed Service | 5007 |
| Questions Service | 5008 |
| Referral Service | 5009 |
| OpenSource Service | 5010 |
| Messaging Service | 5011 |
| Kafka Broker | 9092 |
| Zookeeper | 2181 |

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
```

---

## 🛠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| `Kafka connection refused` | Make sure Zookeeper + Kafka broker are both running |
| `DB connection error` | Check `DB_URL` in `.env` |
| `Redis connection error` | Check `Redis_url` in `.env` |
| `Gemini API error` | Verify `API_KEY_GEMINI` in `services/utils/.env` |
| `Email not sending` | Use Gmail App Password, not your regular password |
| `Port already in use` | Kill the process or change `PORT` in `.env` |
| `TypeScript errors` | Run `npm run build` inside the service to check |

---

## 📘 What You Will Learn

- Microservices architecture (production-grade)
- Kafka event-driven communication between services
- AI integration with Google Gemini 2.5 Flash
- Resume ATS analysis & career path recommendation
- Real-time WebSocket communication
- Email notification workflows via Kafka + Nodemailer
- Subscription system with Razorpay
- Password reset flow with tokenized email links
- Redis caching in auth & job services
- Cloudinary file upload service
- JWT-based authentication across services
- TypeScript end-to-end (frontend + backend)
- Next.js 16 App Router with server/client components

---

## 👨‍💻 Built With

- **Next.js 16** — Frontend framework
- **Express.js** — Backend REST APIs
- **Apache Kafka** — Event-driven microservices communication
- **PostgreSQL (NeonDB)** — Serverless database
- **Redis (Upstash)** — Caching & session management
- **Google Gemini 2.5 Flash** — AI features
- **WebSocket (ws)** — Real-time messaging & notifications
- **Cloudinary** — File & image storage
- **Razorpay** — Payment gateway
- **Judge0** — Live code execution

---

## 📄 License

MIT License — feel free to use, modify and distribute.

---

<div align="center">
  <strong>⭐ Star this repo if you found it helpful!</strong><br/>
  Built with ❤️ using Next.js, Node.js & Apache Kafka
</div>

