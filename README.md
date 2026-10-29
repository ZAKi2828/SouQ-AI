# 🚀 SouQ AI (سوق أي آي)
### AI-Driven E-Commerce Product Research, Validation & Storefront Platform for Algerian Merchants

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI_Agent-8E75C2?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![InsForge](https://img.shields.io/badge/InsForge-Backend-FF6B6B?style=for-the-badge)](https://insforge.com/)

---

## 📌 Project Overview
**SouQ AI** is an all-in-one, intelligent e-commerce ecosystem designed specifically for cash-on-delivery (COD) merchants and online retailers in Algeria. It bridges the gap between deep market product research and instantaneous storefront execution. 

### 🌟 Key Highlights:
1. **Autonomous Product Research Agent (ProFind)**: Analyzes real-time trending products across TikTok and Meta Ad Libraries, calculating net profit margins, Algerian wholesale market availability (El Eulma, Belaire, El Hamiz), and shipping delivery success rates (Yalidine rates).
2. **AI Store & Landing Page Builder**: Generates high-converting product landing pages, ad copies, and marketing angles in Algerian Derja and Modern Standard Arabic in seconds.
3. **Smart Checkout & Abandoned Recovery**: Instant phone-number lead capture that automatically tracks abandoned checkout forms and enables direct click-to-call merchant recovery.
4. **Local Logistics & Payment Ready**: Deeply integrated with Algerian Wilayas/Communes, Yalidine Express, and local e-payment gateway (Chargily Pay / CIB & Eddahabia).

---

## 👥 Team Roles & Responsibilities

| Team Member | Role | Core Contributions |
| :--- | :--- | :--- |
| **Roaissat Mohamed Zakaria** | **AI Research, Agent Development & Frontend Lead** | • Autonomous AI Winning Products Agent (`dzWinningProductsAgent.ts`) using Gemini API.<br>• Data scraping pipelines, wholesale market margin formulas, and Python data models.<br>• Dynamic trending dashboard UI, product modal previewers, and responsive storefronts. |
| **Mohammed Zane** | **Backend Architecture, Database & Integrations Lead** | • InsForge / Supabase database schemas, Row Level Security (RLS) policies.<br>• Abandoned cart/form recovery API and server-side conversion webhooks.<br>• Local logistics automation (Yalidine), Resend transactional email cron jobs, and RBAC security. |

---

## 🎥 Demos & Working Links
* **Live Web Application**: [https://souqai.net](https://souqai.net)
* **Video Demonstration**: [Watch Unlisted Demo Walkthrough](https://youtu.be/placeholder-demo) *(Update link to your YouTube or Google Drive video)*
* **Repository (Public)**: [https://github.com/ZAKi2828/SouQ-AI](https://github.com/ZAKi2828/SouQ-AI)

* 
## 🔑 Judge Demo Access
To allow judges to test the live platform instantly without registering, you can use the following pre-configured test account:
- **Platform URL**: [https://souqai.net](https://souqai.net)
- **Email**: `thirduni@thirduni.com`
- **Password**: `123456`
---

## 🏗️ Clean Project Structure
```text
SOUQai1/
├── src/
│   ├── app/                      # Next.js 15 App Router pages & API routes
│   │   ├── [storeDomain]/        # Dynamic merchant storefronts
│   │   ├── abandoned-carts/      # Abandoned form recovery dashboard
│   │   ├── analytics/            # Real-time merchant analytics
│   │   ├── api/                  # Backend REST endpoints & Cron jobs
│   │   │   ├── abandoned-forms/  # Lead capture and conversion endpoints
│   │   │   ├── trending/         # Autonomous product research agent routes
│   │   │   └── image-proxy/      # Cross-origin secure media proxy
│   │   ├── inventory/            # Product catalog & stock management
│   │   ├── orders/               # Merchant orders & tracking
│   │   └── trending/             # ProFind Winning Products Discovery Dashboard
│   ├── components/               # Modular UI components (Dashboards, Navbars, Modals)
│   ├── context/                  # State providers (Theme, Multilingual i18n)
│   ├── lib/
│   │   ├── agents/               # AI agents (dzWinningProductsAgent.ts)
│   │   ├── insforge.ts           # InsForge Backend SDK client
│   │   └── rbac.ts               # Role-based access control
│   └── locales/                  # Arabic (ar), French (fr), English (en) dictionaries
├── public/                       # Static media, icons, and assets
├── .env.example                  # Environment variable configuration template
├── package.json                  # Frontend & Fullstack Node dependencies
├── requirements.txt              # Python AI scraping & data processing dependencies
├── tailwind.config.ts            # UI design tokens & theme configuration
└── tsconfig.json                 # TypeScript compiler specifications
```

---

## 💻 Local Installation & Setup

### Prerequisites
* **Node.js**: v18.18 or higher (v20+ recommended)
* **npm** or **yarn** / **pnpm**
* **Python**: v3.10+ (for running standalone AI analysis scripts)

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

### Step 2: Environment Setup
Copy the `.env.example` file to create your local `.env`:
```bash
cp .env.example .env
```
Open `.env` and fill in your respective API keys:
* `NEXT_PUBLIC_INSFORGE_BASE_URL` & `NEXT_PUBLIC_INSFORGE_ANON_KEY`: From InsForge Dashboard.
* `GEMINI_API_KEY`: Google Gemini API Key for autonomous agent execution.
* `RESEND_API_KEY`: Optional for email notifications.

### Step 3: Install Frontend & Backend Dependencies
```bash
npm install
```

*(Optional) Install Python Agent Dependencies:*
```bash
pip install -r requirements.txt
```

### Step 4: Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore the platform.

### Step 5: Production Build Verification
To ensure production readiness:
```bash
npm run build
npm run start
```

---

## 🔒 Security & Privacy Notice
* Sensitive environment secrets (`.env`, credentials, private tokens) are excluded via `.gitignore`.
* Production routes and databases enforce Row Level Security (RLS) to safeguard merchant and customer privacy.
