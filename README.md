# Lead Management System (CRM) - Sales & Pipeline Tracker

> **Task ID**: `WD-CRM-002`  
> **Domain**: CRM - Lead Management / Sales & Marketing  
> **Company**: Data Alcott Systems (`www.dataalcott.com` / `freeinternships.in`)


## 🌟 Overview

The **Lead Management System (CRM)** is a modern, responsive web application engineered to help sales and growth teams capture, track, nurture, score, and convert leads into paying customers.

Built with a modular frontend architecture, this CRM features a real-time reactive LocalStorage data engine, dynamic drag-and-drop Kanban pipeline board, 360° lead detail view, task and follow-up scheduler, interactive communication simulator, and comprehensive conversion analytics.

---

## 💎 Features Checklist

### ✅ Core Modules & Requirements
- [x] **Lead Dashboard with Statistics**: Real-time KPI stat cards (Pipeline Value, Conversion Rate %, Total Leads, Won Revenue), interactive pipeline stage funnel, and acquisition source distribution.
- [x] **Lead Directory & Management**:
  - Search by Name, Company, Email, or Phone.
  - Multi-filtering by Status (`New`, `Contacted`, `Qualified`, `Lost`, `Converted`), Channel Source (`Website`, `LinkedIn`, `Referral`, `Email Campaign`, `Advertisement`, `Cold Call`), and Priority Score.
  - Sort by Deal Value, Creation Date, Lead Score, or Name.
  - Quick stage change dropdown directly in the table.
- [x] **Add & Edit Lead Modal**: Comprehensive lead capture form with instant validation, lead source tagging, deal valuation, and auto-scoring.
- [x] **360° Lead Detail View**:
  - Detailed contact information & customizable profile.
  - Full activity timeline with time-ago indicators.
  - Scheduled follow-up tasks linked to the specific lead.
  - Dynamic Lead Scoring breakdown.
- [x] **Lead Status Board (Kanban)**:
  - Interactive HTML5 Drag-and-Drop board across 5 stages: **📌 New**, **📞 Contacted**, **🔍 Qualified**, **❌ Lost**, **✅ Converted Won**.
  - Visual stage counters and total deal value summaries per column.
- [x] **Follow-up Scheduler**:
  - Due date and overdue tracking with priority tags (`High`, `Medium`, `Low`).
  - Filter by `Today`, `Upcoming`, `Overdue`, and `Completed`.
  - 1-Click task completion that automatically records an activity history log.
- [x] **1-Click Lead Conversion to Customer**:
  - Instantly convert won leads into paying customers with celebratory modal animation, automatic `Customer ID` generation, and revenue attribution.
- [x] **Pipeline Reports & Conversion Analysis**:
  - Channel ROI and conversion efficiency matrix.
  - Sales representative leaderboard and productivity metrics.
  - Print / PDF export capability.
- [x] **Respected Sales Roles & Intelligent Lead Assignment**:
  - Deals assigned to specialized roles based on deal value tiers:
    - **👔 Enterprise Account Executive (EAE)**: Enterprise deals ($50,000+) & high-complexity accounts.
    - **⭐ Senior Sales Lead (SSL)**: Qualified mid-market solutions ($25,000 – $50,000).
    - **🎯 Business Development Rep (BDR)**: Inbound qualification, webinar leads, and nurture (< $25,000).
    - **💼 Sales Representative**: Commercial & SMB accounts.
    - **👑 Sales Director**: Executive strategic partnerships and VIP client management.
  - Dynamic auto-suggestion of role assignment based on deal size in Add/Edit forms.
  - Dedicated Role Filter in the Lead Directory.
  - Role attribution badges across Kanban cards, lead detail drawers, and analytics reports.
- [x] **User Management & Authentication System (Login & Register)**:
  - **Sign In & Register Screen**: Interactive glassmorphism card with tab switching, form validation, and password visibility toggles.
  - **User Registration**: Register new sales rep accounts with instant LocalStorage account creation.
  - **Session Management & Logout**: Persistent active session with Sign Out buttons in both sidebar and top navigation bar.
  - **In-App Profile Management**: Profile editor, account switcher/deletion, and factory reset to sample data.

### 🌟 Bonus Features Implemented
- [x] **Interactive Data Visualization**: Lightweight, high-performance SVG and canvas charts (Pipeline Stage Funnel, Acquisition Donut Chart).
- [x] **Dynamic Lead Scoring Engine**: Algorithmic scoring (0-100) based on budget size, profile completeness, acquisition source credibility, and interaction count with `🔥 Hot`, `⚡ Warm`, and `❄️ Cold` tier badges.
- [x] **Communication Simulator (Email & SMS)**: Outbox simulation modal with prefilled templates that dispatches simulated messages and logs them to the lead's activity history.
- [x] **CSV Export & Import**: Export filtered leads to CSV or import batch leads from external CSV files.
- [x] **Theme Switcher**: Seamless Dark Mode / Light Mode with CSS custom properties and persistent state.
- [x] **Rich Toast Notification System**: Instant feedback for all user actions.

---

## 🛠️ Technology Stack & Architecture

- **Structure**: HTML5 Semantic Elements & Responsive Layout
- **Styling**: Vanilla CSS3 (CSS Variables, Flexbox/Grid, Dark Mode Tokens, Glassmorphism, Micro-animations)
- **Typography**: Google Fonts (*Plus Jakarta Sans*)
- **Logic & Components**: Vanilla JavaScript (ES6+ Modules, Event-driven architecture)
- **State & Storage**: Reactive LocalStorage state manager with preloaded enterprise demo leads
- **Zero Build Dependencies**: Runs instantly without complex build steps or node modules required!

---

## 📁 Project Structure

```
crm/
├── index.html              # Main application entry point
├── css/
│   ├── variables.css       # Design tokens, color palette, dark mode variables
│   ├── base.css            # Reset, sidebar layout, responsive grid
│   ├── components.css      # Stat cards, tables, badges, modals, forms, tabs
│   ├── kanban.css          # Drag & drop Kanban board styling
│   └── animations.css      # Toasts, celebration effects, micro-animations
├── js/
│   ├── app.js              # Application orchestrator & modal controllers
│   ├── state.js            # Reactive state manager with LocalStorage persistence
│   ├── scoring.js          # Dynamic lead scoring algorithm
│   ├── utils/
│   │   ├── charts.js       # SVG / Canvas chart renderers
│   │   ├── helpers.js      # Currency/date formatters, CSV import & export
│   │   └── toast.js        # Toast notification system
│   └── views/
│       ├── dashboard.js    # KPI dashboard & chart views
│       ├── leads.js        # Leads directory with search, filter, and table
│       ├── kanban.js       # Interactive drag-and-drop pipeline board
│       ├── leadDetail.js   # 360° lead detail view & activity timeline
│       ├── followups.js    # Task and follow-up scheduler
│       ├── reports.js      # Pipeline reports & sales leaderboard
│       └── auth.js         # User profile and persona switcher
└── README.md               # Project documentation
```

---

## 🚀 How to Run Locally

You can run this project using any local web server.

### Option 1: Using Python (Recommended)
```bash
# In the project directory:
python3 -m http.server 8080
```
Open your browser and navigate to: `http://localhost:8080`

### Option 2: Using VS Code Live Server
Right-click `index.html` and select **"Open with Live Server"**.

### Option 3: Direct Browser Open
Simply double-click `index.html` to open it in your web browser.

---

## 👨‍💻 Developed For

**Data Alcott Systems Internship Program**  
Task ID: `WD-CRM-002`  
Domain: CRM & Web Development
