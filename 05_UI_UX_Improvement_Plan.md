# 05_UI_UX_Improvement_Plan.md

## Overview
This document tracks the progressive enhancement of the Guardianship PWA UI/UX. The goal is to integrate Shadcn/UI for accessible, consistent components while preserving the premium dark theme aesthetic.

## Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion
- **Flow Visualization:** ReactFlow
- **Component Library:** Shadcn/UI (to be integrated)
- **Backend:** Supabase-ready

---

## Phase 1: Shadcn/UI Integration (Session 2)

### Tasks
- [x] Create this improvement plan document
- [x] Run `npx shadcn@latest init` with proper config
- [x] Install core components: Button, Card, Sheet, Dialog, Command, Skeleton, Badge, Avatar
- [x] Ensure compatibility with existing dark theme in `globals.css`
- [x] Refactor one existing component (StatsCard) to use Shadcn Card as proof of concept

### Configuration Requirements
- **Style:** Default (not New York)
- **Base Color:** Slate (matches existing theme)
- **CSS Variables:** Yes (for dark mode)
- **Tailwind Config:** Preserve existing Guardian brand colors
- **Import Alias:** `@/` (already configured in tsconfig)

---

## Phase 2: Component Migration (Session 2 - Continued)

### Priority Components Migrated
1. [x] **AddRepModal** → Shadcn Dialog
2. [x] **Toast** → Shadcn Sonner
3. [ ] **DateRangePicker** → Shadcn Popover + Calendar (future)
4. [x] **Buttons** → Shadcn Button with Guardian variants (gold, emerald)

### New Components Created
- [x] StatusBadge - Reusable status badge component
- [ ] Command Palette (for admin quick actions)
- [ ] Bottom Sheet (mobile-first modals)
- [ ] Data Table (with sorting, filtering)

---

## Phase 3: Polish & PWA (Session 3)

### UI Enhancements
- [x] Page transitions with Framer Motion
- [x] Skeleton loaders for all data fetching states
- [x] Empty states with illustrations
- [x] Error boundaries with recovery UI

### Additional Components Added
- [x] Input, Textarea, Label components
- [x] Popover component (for future DateRangePicker)

### PWA Enhancements (Future)
- [ ] Offline data sync indicators
- [ ] Install prompt optimization
- [ ] Push notification UI

---

## Design Tokens

### Guardian Brand (Preserved)
```css
--color-guardian-navy: #1E3A5F
--color-guardian-gold: #D4A656
--color-guardian-green: #2D5A3D
```

### Status Colors (Preserved)
```css
--color-status-submitted: #64748b
--color-status-contacted: #0ea5e9
--color-status-quoted: #f59e0b
--color-status-sold: #10b981
```

### Shadcn Integration (To Add)
CSS variables for Shadcn components will be added to globals.css while preserving existing theme.

---

## Session Log

### Session 2 - 2026-01-31
**Focus:** Phase 1 - Shadcn/UI Integration

**Status:** Completed

**Completed:**
- [x] Created 05_UI_UX_Improvement_Plan.md with session tracking
- [x] Ran `npx shadcn@latest init` - detected Next.js 16 + Tailwind v4 automatically
- [x] Installed 8 core components: Button, Card, Sheet, Dialog, Command, Skeleton, Badge, Avatar
- [x] Updated globals.css with Shadcn CSS variables (dark theme as default)
- [x] Preserved Guardian brand colors (navy, gold, green) and premium styling
- [x] Refactored StatsCard to use Shadcn Card as proof of concept
- [x] Build and lint verification passed

**New Dependencies Added:**
- @radix-ui/react-avatar
- @radix-ui/react-dialog  
- @radix-ui/react-slot
- class-variance-authority
- cmdk (for Command component)
- tw-animate-css

**Files Created:**
- `components.json` - Shadcn configuration
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/command.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/avatar.tsx`

**Files Modified:**
- `src/app/globals.css` - Added Shadcn CSS variables with Guardian dark theme
- `src/lib/utils.ts` - Restored utility functions after Shadcn init
- `src/components/dashboard/StatsCard.tsx` - Refactored to use Shadcn Card
- `package.json` - New Radix/Shadcn dependencies

**Token Usage:** ~10k tokens used

---

### Session 2 (Continued) - Phase 2 Component Migration
**Focus:** Migrate existing components to Shadcn/UI

**Status:** Completed

**Completed:**
- [x] Migrated AddRepModal to use Shadcn Dialog
- [x] Installed Sonner for toast notifications
- [x] Updated Toast.tsx to use Sonner with backwards-compatible API
- [x] Added Toaster to root layout
- [x] Extended Button component with Guardian brand variants (gold, emerald, emerald-outline)
- [x] Refactored LoginForm to use Shadcn Button
- [x] Extended Badge component with status variants (submitted, contacted, quoted, sold, gold)
- [x] Created StatusBadge component for easy status rendering
- [x] Updated ReferralTree to use new toast system
- [x] Build verification passed

**New Dependencies Added:**
- sonner

**Files Created:**
- `src/components/ui/sonner.tsx` - Sonner Toaster with Guardian styling
- `src/components/ui/status-badge.tsx` - Reusable status badge wrapper

**Files Modified:**
- `src/components/admin/AddRepModal.tsx` - Now uses Shadcn Dialog + Button
- `src/components/auth/LoginForm.tsx` - Now uses Shadcn Button (gold variant)
- `src/components/ui/Toast.tsx` - Refactored to use Sonner internally
- `src/components/ui/button.tsx` - Added gold, emerald variants
- `src/components/ui/badge.tsx` - Added status variants
- `src/components/referral-tree/ReferralTree.tsx` - Uses new toast system
- `src/app/layout.tsx` - Added Toaster component

**Token Usage:** ~73k tokens used (Session 2 total)

---

### Session 3 - 2026-01-31
**Focus:** Phase 3 - Polish & UI Enhancements

**Status:** Completed

**Completed:**
- [x] Created comprehensive skeleton components for loading states
  - StatsCardSkeleton, DashboardStatsSkeleton, ActivityFeedSkeleton
  - ReferralListSkeleton, QuickActionSkeleton, TableSkeleton
  - RepCardSkeleton, PipelineSkeleton
  - DashboardPageSkeleton, AdminPageSkeleton compositions
- [x] Added page transitions with Framer Motion
  - Created PageTransition component for smooth route changes
  - Added FadeIn, ScaleIn, SlideIn animation helpers
  - Added StaggerContainer and StaggerItem for lists
  - Integrated into Dashboard and Admin layouts
- [x] Created EmptyState component with illustrations
  - 6 variant illustrations (no-data, no-referrals, no-search, no-files, error, offline)
  - Pre-configured empty states (NoReferrals, NoSearchResults, Error, Offline, NoActivity)
  - Updated ActivityFeed and ReferralTable to use new empty states
- [x] Created ErrorBoundary component with recovery UI
  - ErrorBoundary class component with fallback support
  - ErrorFallback UI with illustration and retry actions
  - PageError for app-level error pages
  - SectionError for smaller error sections
  - Created app/error.tsx and app/global-error.tsx
- [x] Added Shadcn form components (Input, Textarea, Label, Popover)
- [x] Updated referral pages to use new skeletons and empty states

**New Dependencies Added:**
- @radix-ui/react-label
- @radix-ui/react-popover

**Files Created:**
- `src/components/ui/skeletons.tsx` - Comprehensive skeleton components
- `src/components/ui/page-transition.tsx` - Framer Motion page transitions
- `src/components/ui/empty-state.tsx` - Empty state with illustrations
- `src/components/ui/error-boundary.tsx` - Error boundary components
- `src/components/ui/input.tsx` - Shadcn Input
- `src/components/ui/textarea.tsx` - Shadcn Textarea
- `src/components/ui/label.tsx` - Shadcn Label
- `src/components/ui/popover.tsx` - Shadcn Popover
- `src/app/error.tsx` - App-level error page
- `src/app/global-error.tsx` - Global error page

**Files Modified:**
- `src/app/dashboard/page.tsx` - Uses DashboardPageSkeleton and StatusBadge
- `src/app/admin/page.tsx` - Uses AdminPageSkeleton
- `src/app/dashboard/layout.tsx` - Added PageTransition wrapper
- `src/app/admin/layout.tsx` - Added PageTransition wrapper
- `src/app/dashboard/referrals/page.tsx` - Uses TableSkeleton and DashboardStatsSkeleton
- `src/app/admin/referrals/page.tsx` - Uses TableSkeleton and NoSearchResultsEmpty
- `src/components/dashboard/ActivityFeed.tsx` - Uses NoActivityEmpty
- `src/components/dashboard/ReferralTable.tsx` - Uses NoReferralsEmpty

**Token Usage:** ~95k tokens used (Session 3 total)

---

### Session 1 (Previous)
**Focus:** Initial PWA setup, ReactFlow tree visualization, premium dark theme

**Completed:**
- Next.js 16 App Router setup
- Tailwind CSS 4 configuration
- Premium glassmorphism theme in globals.css
- ReactFlow integration for referral tree
- Basic component structure (StatsCard, Toast, etc.)
- PWA manifest and service worker
