# Guardianship - Referral Tracking App

A modern referral tracking Progressive Web App (PWA) for Guardian Storm Repair. Track referrals, manage sales reps, and earn $250 for every closed deal.

## Features

- **Rep Dashboard**: Track your referrals, earnings, and generate QR codes for sharing
- **Admin Panel**: Manage reps, view all referrals, generate reports, bulk actions
- **PWA Support**: Install on mobile devices, works offline
- **Mock Data**: Fully functional with mock data - add Supabase credentials to go live

## Demo Accounts

The app comes with mock data and demo accounts (use any password):

| Role  | Email               |
|-------|---------------------|
| Admin | alex@guardian.com   |
| Rep   | sarah@guardian.com  |
| Rep   | mike@guardian.com   |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (requires --webpack flag for PWA)
npm run build -- --webpack

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/
│   ├── admin/           # Admin panel pages
│   │   ├── referrals/   # All referrals view
│   │   ├── reps/        # Rep management
│   │   └── reports/     # Analytics & reports
│   ├── dashboard/       # Rep dashboard pages
│   │   ├── earnings/    # Earnings tracking
│   │   ├── qr/          # QR code generator
│   │   └── referrals/   # Rep's referrals
│   └── login/           # Authentication
├── components/
│   ├── admin/           # Admin-specific components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard components
│   ├── referral-tree/   # Referral visualization
│   └── ui/              # Shared UI components
├── hooks/
│   └── useAuth.ts       # Authentication hook
├── lib/
│   ├── auth.ts          # Authentication utilities
│   ├── data.ts          # Data access layer
│   ├── mock-data.ts     # Mock data for development
│   ├── offline.ts       # Offline support utilities
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Utility functions
└── types/
    └── database.ts      # TypeScript types
```

## Connecting Supabase

The app uses mock data by default. To connect to a real Supabase database:

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to Project Settings > API to get your credentials

### 2. Set Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Database Migration

Execute the SQL in `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor.

### 4. Enable Authentication

In Supabase Dashboard:
1. Go to Authentication > Providers
2. Enable Email provider
3. Create rep accounts or enable sign-up

The app will automatically switch from mock data to Supabase when credentials are detected.

## Database Schema

### Tables

- **customers**: People who can submit referrals
- **referrals**: Submitted referrals with status tracking
- **reps**: Sales representatives (users)
- **rep_customers**: Many-to-many relationship between reps and customers

### Referral Statuses

| Status     | Description                    |
|------------|--------------------------------|
| submitted  | New referral, not yet reviewed |
| contacted  | Customer has been contacted    |
| quoted     | Quote provided to customer     |
| sold       | Deal closed - $250 earned!     |

## PWA Features

The app is a Progressive Web App with:

- Installable on iOS and Android
- Offline support with service worker caching
- QR code generation that works offline
- Background sync for offline form submissions

To install on mobile:
1. Open the app in Safari (iOS) or Chrome (Android)
2. Tap "Add to Home Screen" / "Install"

## Development

```bash
# Run development server (PWA disabled)
npm run dev

# Run linting
npm run lint

# Build for production
npm run build -- --webpack

# Start production server
npm start
```

## Tech Stack

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Database**: Supabase (PostgreSQL)
- **PWA**: next-pwa

## License

Proprietary - Guardian Storm Repair

