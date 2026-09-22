# 📸 MTShoots — Premier Photographer Booking Platform (India)

A modern, high-performance web platform for discovering, booking, and managing verified professional photographers across major Indian cities (Mumbai, Delhi NCR, Bangalore, Jaipur, Udaipur, Goa, Pune, Hyderabad, and more).

---

## 🌟 Key Features

### 🔍 Discovery & Intelligent Filtering
- **Multi-Factor Search**: Filter photographers by **Genre** (Wedding, Pre-Wedding, Fashion, Maternity, Architecture, Corporate), **City**, **Price Range (INR ₹)**, and **Shooting Date**.
- **Real-Time Date Availability Engine**: Photographers dynamically reflect their operational schedule, ensuring zero double-booking.
- **Rich Portfolios**: High-definition curated galleries with categorization, client reviews, camera gear specs, and verified badge indicators.

### 📝 5-Step Photographer Onboarding Wizard
- **Step 1: Identity & Credentials**: Name, bio, phone, city, years of experience, and base pricing.
- **Step 2: Disciplines & Gear**: Primary & secondary genres, camera bodies (Sony A7 IV, Canon EOS R5), lenses, drones, and lighting setups.
- **Step 3: Packages & Rate Cards**: Custom deliverables (Standard, Premium, Deluxe) with turnaround times and payment terms.
- **Step 4: Media & Multi-Photo Showcase**: Live profile avatar upload and multiple high-resolution portfolio photograph uploads with cover selection.
- **Step 5: Availability & Instant Publishing**: Operational blackout dates, immediate roster sync, and custom vanity URL (/photographers/:slug).

### 🔐 Authentication, Security & Profile Management
- **User & Photographer Sign-Up**: Complete onboarding with live profile avatar previews.
- **Header Profile Hub**: Interactive user menu featuring quick access to **Account Settings** modal (update bio, phone, city, avatar) and **Change Password** modal.
- **Forgot Password with 6-Digit Email OTP**:
  - Secure verification step with auto-tabbing 6-digit OTP code inputs.
  - Live **60-second countdown timer** with resend functionality.
  - Safe password reset and instant login redirect.

### 💳 Seamless Booking & Invoicing
- Instant session scheduling with customizable location details and duration.
- Payment readiness for Indian Gateways (UPI, Cards, NetBanking via Razorpay / Stripe).

---

## 🛠️ Technology Stack

- **Frontend**: React 18 / Next.js, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Backend / Database**: Supabase PostgreSQL, Prisma ORM
- **Authentication**: Supabase Auth (Email/Password, OTP, Password Reset)
- **File Storage**: Supabase Storage Buckets (mtshoots-portfolios)
- **Hosting & CI/CD**: Vercel / Netlify

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 18.x
- npm, yarn, or pnpm
- A free [Supabase](https://supabase.com) account

### 2. Clone the Repository
`ash
git clone https://github.com/MayurGajera/MTShoots.git
cd MTShoots
`

### 3. Configure Environment Variables
Copy the .env.example file to create your local environment configuration:
`ash
cp .env.example .env
`

Open .env and fill in your Supabase credentials:
`env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres?sslmode=require
`

### 4. Install Dependencies
`ash
npm install
`

### 5. Run Development Server
`ash
npm run dev
`
Open [http://localhost:5173](http://localhost:5173) (or [http://localhost:3000](http://localhost:3000) for Next.js) in your browser.

---

## 📁 Project Structure

`
MTShoots/
├── public/                 # Static assets, badges, and icons
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── layout/         # Header, Footer, Navigation, User Menu
│   │   ├── photographer/   # Cards, Filters, Reviews, Portfolios
│   │   └── ui/             # Modals, Buttons, Badges, Tabs
│   ├── data/               # Indian photographers seed data & cities
│   ├── lib/                # Supabase client & utilities
│   ├── types/              # TypeScript definitions & data models
│   ├── App.tsx             # Root application router
│   └── main.tsx            # Application entrypoint
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
├── package.json            # Project dependencies & scripts
└── README.md               # Documentation
`

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.