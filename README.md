# AI-Assisted Franchise Performance & Compliance Monitoring

An enterprise-grade SaaS application designed to monitor multi-unit QSR franchise networks, track sales performance, detect operational and inventory discrepancies, review CCTV surveillance evidence with timestamped photos, and enforce compliance workflows.

---

## 🏗️ Architecture & Project Structure

The project is organized into three clean, distinct tiers: **Frontend**, **Backend**, and **Database**.

```
├── frontend/                     # User Interface (React + TypeScript + Tailwind CSS)
│   ├── components/               # Reusable UI & Layout Components
│   │   ├── layout/               # Shell layout: Sidebar, TopNav, AppLayout, ProtectedRoute
│   │   └── ui/                   # Design system primitives: button, badge, card, input
│   ├── context/                  # React Context providers (AuthContext, session state)
│   ├── pages/                    # Application Pages & Role Dashboards
│   │   ├── LoginPage.tsx         # Main landing page & portal gateway
│   │   ├── StoreLoginPage.tsx    # Store operator login & single-store selection
│   │   ├── ManagementDashboard.tsx # Franchisee executive console & KPIs
│   │   ├── CompliancePage.tsx    # Quality & Compliance Officer queue & ratings
│   │   ├── EvidencePage.tsx      # Store portal CCTV video upload & photos
│   │   ├── StoreEvidenceReviewPage.tsx # Officer photo inspection dossier
│   │   ├── OutletsPage.tsx       # Network-wide store directory
│   │   ├── OutletDetailPage.tsx  # Single store detailed metrics & telemetry
│   │   ├── SalesPage.tsx         # Revenue trends, transactions & category mix
│   │   ├── InventoryPage.tsx     # Stock audits, theoretical vs actual variance
│   │   ├── RiskPage.tsx          # Multi-factor risk engine & early warning
│   │   ├── AlertsPage.tsx        # Active SLA alerts & escalation tracker
│   │   ├── CorrectiveActionsPage.tsx # CAPA root-cause & resolution workflows
│   │   ├── ComplaintsPage.tsx    # Customer feedback escalation log
│   │   └── ReportsPage.tsx       # Exportable audit summaries
│   ├── services/                 # Frontend client services (CCTV photo evidence store)
│   ├── styles/                   # Global CSS and Tailwind directives (index.css)
│   ├── types/                    # Shared TypeScript interfaces & models
│   ├── utils/                    # Reusable helper functions & store constants
│   ├── App.tsx                   # Main React Router configuration & routes
│   ├── main.tsx                  # React application DOM entry point
│   └── vite-env.d.ts             # Vite client TypeScript definitions
│
├── backend/                      # API Server & Business Logic (Node.js + Express)
│   ├── middleware/               # Express middleware (JWT auth, role protection)
│   │   └── auth.ts               # requireAuth, requireRole, requireOutletAccess
│   ├── services/                 # Core server-side operational engines
│   │   ├── alert-engine.ts       # Deterministic rule-based alert evaluation
│   │   ├── risk-engine.ts        # Weighted composite risk scoring (0-100)
│   │   ├── corrective-action-engine.ts # CAPA status transitions & overdue checks
│   │   └── gemini.ts             # AI-assisted observations (Human-in-the-Loop)
│   ├── utils/                    # Backend utilities
│   │   └── server-auth.ts        # JWT token generation & verification
│   └── server.ts                 # Express API router & endpoint handlers
│
├── database/                     # Data Storage & Schema Tier (PostgreSQL + Drizzle)
│   ├── connection.ts             # PostgreSQL pool & Drizzle ORM client initialization
│   ├── schema.ts                 # Relational schema tables, enums, and foreign keys
│   ├── drizzle.config.ts         # Drizzle Kit migration & introspect configuration
│   └── README.md                 # Database schema models & relationship documentation
│
├── server.ts                     # Root full-stack server (mounts API + Vite SPA)
├── index.html                    # Single-Page Application HTML entry point
├── vite.config.ts                # Vite build tool and path alias configuration
├── tsconfig.json                 # TypeScript compiler configuration
└── package.json                  # Dependencies and project scripts
```

---

## 👥 Three Core User Portals & Roles

1. **Franchisee (Executive / Owner)**
   - Access to top-level financial metrics (Net Revenue, EBITDA, Sales Trends).
   - Multi-dimensional filtering by City, Operating Model (COCO / FOCO), and Date.
   - Network Outlets Directory and individual outlet dossiers.

2. **Store Operator (Single-Store Unit)**
   - Can select and enter any assigned store from the complete network directory.
   - Isolated to that specific store session.
   - Uploads daily CCTV surveillance video.
   - Automatically generates timestamped photos across operational zones (Kitchen, Counter, Storage, Handwash).
   - Views Quality Officer verification status and compliance rating.

3. **Quality & Compliance Officer**
   - Access to the centralized Compliance Audit Desk.
   - Reviews daily CCTV submissions for all 10 network stores.
   - Inspects auto-generated photos by timestamp and operational zone.
   - Submits formal compliance scores (1–10) and inspection comments.

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Run development server (runs full-stack on port 3000)
npm run dev

# 3. Production build
npm run build

# 4. Type check / Lint
npm run lint
```
