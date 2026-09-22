<div align=center>

# 📸 MTShoots — Premier Photographer Booking Platform

**Discover, Book, and Collaborate with Top Verified Professional Photographers Across India**

[![React](https://img.shields.io/badge/React-18.x-blue.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [Database & Supabase Setup](#-database--supabase-setup)
- [Deployment Guide](#-deployment-guide)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Project Overview

**MTShoots** is an end-to-end marketplace tailored for India''s photography ecosystem. Whether booking high-end wedding shoots in Udaipur, commercial campaigns in Mumbai, or pre-wedding sessions in Goa, MTShoots bridges clients with verified, vetted photographers through real-time calendar availability, rich multimedia portfolios, and streamlined booking management.

---

## ✨ Key Features

### 🔍 Intelligent Discovery & Filtering
- **Multi-Factor Filter Matrix**: Filter by city (**Mumbai, Delhi NCR, Bangalore, Jaipur, Udaipur, Goa, Pune, Hyderabad, Chennai, Kolkata**), genre, price bracket (₹ INR), and exact shoot date.
- **Calendar Availability Engine**: Photographers dynamically manage availability, ensuring clients only see active, available professionals for their selected dates.
- **Rich Portfolios**: Full-resolution image carousels, camera gear inventories (Sony A7 IV, Canon EOS R5), lenses, drones, lighting kits, and verified client testimonials.

### 📝 5-Step Photographer Onboarding Wizard
- **Step 1: Identity & Bio**: Basic info, operational city, bio, years of experience, and base starting rates.
- **Step 2: Disciplines & Equipment**: Primary/secondary genres and comprehensive camera, lens, and lighting gear breakdown.
- **Step 3: Packages & Rate Cards**: Deliverable packages (Standard, Premium, Deluxe) with turnaround windows and upfront terms.
- **Step 4: Media Showcase & Multiple Photo Uploads**: Live profile avatar uploader + bulk portfolio gallery uploader with primary cover photo selection.
- **Step 5: Operational Calendar & Instant Publishing**: Blackout date management and instant roster activation with dedicated vanity URL (/photographers/:slug).

### 🔐 Authentication, Security & Account Settings
- **User & Photographer Sign-up**: Role-based signup with live avatar photo preview.
- **Header Profile Hub**:
  - Interactive avatar button with hover/click modal menu.
  - **Account Settings Modal**: Edit name, phone, city, and profile picture on the fly.
  - **Change Password Modal**: Secure password update with confirmation validation.
- **Forgot Password with 6-Digit Email OTP**:
  - Direct 6-digit OTP verification code sent to user email.
  - **Live 60-second countdown timer** with instant resend capability.
  - Immediate password reset and seamless login redirection.

### 💳 Booking & Invoicing Pipeline
- Customizable session durations, location inputs, and special shot lists.
- Transparent price calculations in Indian Rupees (₹ INR) with advance deposit tracking.
- Razorpay / UPI / Card payment-ready architecture.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18 / Next.js, TypeScript |
| **Styling** | Tailwind CSS, Lucide Icons, Glassmorphism UI |
| **State & Navigation** | React Hooks, Context API |
| **Database & Auth** | Supabase (PostgreSQL 15), Supabase Auth |
| **ORM & Seeding** | Prisma ORM |
| **File Storage** | Supabase Storage (mtshoots-portfolios bucket) |
| **Deployment** | Vercel / Netlify |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** >= 18.0.0
- **npm** or **pnpm** or **yarn**
- A free [Supabase](https://supabase.com) project

### 2. Clone Repository
`ash
git clone https://github.com/MayurGajera/MTShoots.git
cd MTShoots
`

### 3. Install Dependencies
`ash
npm install
`

### 4. Setup Environment Variables
Copy the template file:
`ash
cp .env.example .env
`
Fill in your Supabase project URL and anon public key in .env.

### 5. Start Development Server
`ash
npm run dev
`
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Environment Configuration

Create a .env file based on .env.example:

`env
# Supabase Client Credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here

# Next.js Supabase Public Keys (if running Next.js App)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key-here

# Database Direct Connection (PostgreSQL)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres?sslmode=require
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres?sslmode=require

# Application Settings
VITE_APP_URL=http://localhost:5173
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MTShoots

# Supabase Storage Bucket for Portfolios
IMAGE_STORAGE_BUCKET=mtshoots-portfolios
`

---

## 🗄️ Database & Supabase Setup

### 1. Run Prisma Migrations
`ash
npx prisma db push
`

### 2. Seed Indian Photographers & Categories
`ash
npm run seed
`

### 3. Create Storage Bucket
In your Supabase Dashboard:
1. Navigate to **Storage** -> **New Bucket**.
2. Name the bucket mtshoots-portfolios.
3. Set public access to **Public** for fast CDN image delivery.

---

## 🚀 Deployment Guide

### Deploying to Vercel
1. Push your code to GitHub:
   `ash
   git push -u origin main
   `
2. Import the repository in [Vercel](https://vercel.com).
3. Add the environment variables from your .env file under **Project Settings → Environment Variables**.
4. Click **Deploy**.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.