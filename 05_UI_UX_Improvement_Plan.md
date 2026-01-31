# 05_UI_UX_Improvement_Plan.md

## Overview
This document outlines the UI/UX improvements for the Guardianship referral tracking PWA. Use this as a reference when starting new chat sessions.

**Token Management Rule**: End chats between 100k-120k tokens. Start fresh with the prompt at the bottom of this document.

---

## Current State Summary
- Next.js 16 App Router with Tailwind CSS 4
- Framer Motion for animations
- ReactFlow for referral tree visualization
- Mock data system with Supabase-ready architecture
- PWA with service worker
- Role-based auth (Rep/Admin)
- Dark mode only (no toggle yet)

---

## Phase 1: Foundation (Priority: HIGH)
*Estimated: 1-2 sessions*

### 1.1 Install Shadcn/UI
- [ ] Run `npx shadcn@latest init`
- [ ] Configure for dark mode + slate color scheme
- [ ] Install core components:
  - [ ] Button, Input, Label (form basics)
  - [ ] Card (replace custom cards)
  - [ ] Sheet (bottom drawer for mobile)
  - [ ] Dialog (modals)
  - [ ] DropdownMenu (action menus)
  - [ ] Command (⌘K search palette)
  - [ ] Toast/Sonner (notifications)
  - [ ] Avatar (user avatars)
  - [ ] Badge (status pills)
  - [ ] Table (data tables)
  - [ ] Skeleton (loading states)
  - [ ] Tabs (navigation)

### 1.2 Theme System
- [ ] Add CSS variables for light/dark mode in `globals.css`
- [ ] Create ThemeProvider component
- [ ] Add theme toggle to settings/navbar
- [ ] Update all components to use theme variables
- [ ] Test both modes thoroughly

### 1.3 Loading States
- [ ] Create `Skeleton` variants matching each card type
- [ ] Replace all `animate-pulse` divs with proper skeletons
- [ ] Add loading states to:
  - [ ] Dashboard stats cards
  - [ ] Referral lists
  - [ ] Admin tables
  - [ ] Activity feeds

### 1.4 Empty States
- [ ] Design illustrated empty states
- [ ] Create reusable `EmptyState` component with props for icon, title, description, CTA
- [ ] Add to:
  - [ ] Referral lists (no referrals yet)
  - [ ] Activity feed (no activity)
  - [ ] Admin rep list (no reps)
  - [ ] Search results (no matches)

---

## Phase 2: Mobile Experience (Priority: HIGH)
*Estimated: 1-2 sessions*

### 2.1 Bottom Sheet Navigation
- [ ] Replace modals with Shadcn Sheet on mobile
- [ ] Implement for:
  - [ ] QR Code sharing (`/dashboard/qr`)
  - [ ] Add referral form
  - [ ] Rep details (admin)
  - [ ] Referral details
- [ ] Add drag-to-dismiss gesture
- [ ] Ensure proper iOS safe area handling

### 2.2 Floating Action Button
- [ ] Create `FAB` component
- [ ] Position in thumb zone (bottom-right, above nav)
- [ ] Primary action: "Add Referral"
- [ ] Optional: Expandable FAB with multiple actions
- [ ] Hide on scroll down, show on scroll up

### 2.3 Swipe Gestures
- [ ] Add swipe-left on referral cards for quick actions
- [ ] Implement pull-to-refresh on dashboard
- [ ] Add swipe navigation between dashboard tabs (optional)

### 2.4 Tactile Feedback
- [ ] Add `active:scale-[0.98]` to all interactive elements
- [ ] Implement press-and-hold states
- [ ] Add subtle color transitions on press

---

## Phase 3: Gamification (Priority: MEDIUM)
*Estimated: 1-2 sessions*

### 3.1 Earnings Progress Ring
- [ ] Create `ProgressRing` component (SVG-based)
- [ ] Show progress toward next $250 milestone
- [ ] Add to rep dashboard header
- [ ] Animate on load and value changes

### 3.2 Animated Counters
- [ ] Extract `AnimatedCounter` from ReferralTree to shared component
- [ ] Use for:
  - [ ] Total earnings on dashboard
  - [ ] Stats cards
  - [ ] Admin totals
- [ ] Add number formatting (commas, currency)

### 3.3 Leaderboard Enhancements
- [ ] Add sparkline charts (tiny trend lines) next to rep names
- [ ] Show rank badges (🥇🥈🥉) for top 3
- [ ] Add "You" indicator for current user's position
- [ ] Weekly/Monthly/All-time toggle

### 3.4 Achievement System
- [ ] Design badge icons
- [ ] Create achievements:
  - [ ] "First Referral" - Submit first referral
  - [ ] "Closer" - First sale
  - [ ] "Hat Trick" - 3 referrals in 7 days
  - [ ] "Century" - 100 total referrals
  - [ ] "Network Effect" - 3-level referral chain
  - [ ] "Perfect Week" - Referral every day for 7 days
- [ ] Create achievement notification component
- [ ] Add achievements page to dashboard

### 3.5 Streak System
- [ ] Track consecutive days with activity
- [ ] Display "🔥 X-day streak" badge
- [ ] Add streak milestone celebrations (7, 30, 100 days)

---

## Phase 4: Search & Filters (Priority: MEDIUM)
*Estimated: 1 session*

### 4.1 Command Palette (⌘K)
- [ ] Install Shadcn Command component
- [ ] Create global `CommandMenu` component
- [ ] Register keyboard shortcut (⌘K / Ctrl+K)
- [ ] Implement search across:
  - [ ] Reps (by name, email)
  - [ ] Customers (by name, phone, email)
  - [ ] Referrals (by referee name)
- [ ] Add quick actions:
  - [ ] Add new referral
  - [ ] View reports
  - [ ] Switch to admin/rep view
- [ ] Show recent searches

### 4.2 Advanced Filters
- [ ] Create `FilterBar` component
- [ ] Implement filters for admin referrals page:
  - [ ] Date range picker
  - [ ] Status multi-select
  - [ ] Rep selector
  - [ ] Search text
- [ ] Persist filter state in URL params
- [ ] Add "Clear all filters" button

---

## Phase 5: Admin Power Features (Priority: MEDIUM)
*Estimated: 2 sessions*

### 5.1 Kanban Pipeline Board
- [ ] Install drag-and-drop library (dnd-kit or @hello-pangea/dnd)
- [ ] Create `KanbanBoard` component
- [ ] Columns: Submitted → Contacted → Quoted → Sold
- [ ] Drag cards between columns to update status
- [ ] Add card count per column
- [ ] Persist state to backend

### 5.2 Data Tables
- [ ] Install @tanstack/react-table
- [ ] Create reusable `DataTable` component
- [ ] Features:
  - [ ] Sortable columns
  - [ ] Column visibility toggle
  - [ ] Row selection
  - [ ] Pagination
  - [ ] Export to CSV
- [ ] Implement for:
  - [ ] Admin referrals list
  - [ ] Admin reps list

### 5.3 Bulk Actions
- [ ] Add checkbox selection to tables
- [ ] Create bulk action toolbar:
  - [ ] Update status (multiple referrals)
  - [ ] Assign to rep
  - [ ] Export selected
  - [ ] Delete (with confirmation)

### 5.4 Charts & Analytics
- [ ] Install Recharts
- [ ] Create charts:
  - [ ] Earnings over time (line chart)
  - [ ] Referrals by status (donut chart)
  - [ ] Conversion funnel (funnel chart)
  - [ ] Rep comparison (bar chart)
- [ ] Add to reports page

---

## Phase 6: Delight & Polish (Priority: LOW)
*Estimated: 1 session*

### 6.1 Celebrations
- [ ] Install canvas-confetti
- [ ] Trigger on:
  - [ ] Referral status → "sold"
  - [ ] Achievement unlocked
  - [ ] Milestone reached
- [ ] Add success sound (optional, with user preference)

### 6.2 Smart Greetings
- [ ] Time-based greeting ("Good morning/afternoon/evening")
- [ ] Special greetings for milestones
- [ ] Personalization based on activity

### 6.3 Micro-interactions
- [ ] Button hover states with subtle lift
- [ ] Card hover with glow effect
- [ ] Icon animations on state change
- [ ] Page transition animations

### 6.4 Toast System
- [ ] Replace alerts with toast notifications
- [ ] Add undo functionality for destructive actions
- [ ] Stack multiple toasts
- [ ] Auto-dismiss with progress indicator

---

## Phase 7: Technical Improvements (Priority: ONGOING)
*Estimated: Across multiple sessions*

### 7.1 Real-time Updates
- [ ] Set up Supabase Realtime subscriptions
- [ ] Push referral status changes to dashboards
- [ ] Show "New referral" indicator without refresh
- [ ] Handle connection loss gracefully

### 7.2 Offline Support
- [ ] Enhance service worker caching
- [ ] Queue form submissions when offline
- [ ] Show offline indicator
- [ ] Sync on reconnection

### 7.3 Error Handling
- [ ] Create Error Boundary components
- [ ] Design error states for API failures
- [ ] Add retry mechanisms
- [ ] Log errors for debugging

### 7.4 Performance
- [ ] Implement virtual scrolling for long lists
- [ ] Add image optimization
- [ ] Code-split by route
- [ ] Measure and improve Core Web Vitals

---

## File Structure After Improvements

```
src/
├── components/
│   ├── ui/                    # Shadcn components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── sheet.tsx
│   │   ├── command.tsx
│   │   ├── skeleton.tsx
│   │   └── ...
│   ├── shared/                # Custom shared components
│   │   ├── AnimatedCounter.tsx
│   │   ├── ProgressRing.tsx
│   │   ├── EmptyState.tsx
│   │   ├── FAB.tsx
│   │   ├── CommandMenu.tsx
│   │   └── ...
│   ├── dashboard/
│   ├── admin/
│   ├── referral-tree/
│   └── auth/
├── hooks/
│   ├── useAuth.ts
│   ├── useTheme.ts
│   ├── useKeyboardShortcut.ts
│   └── useOffline.ts
├── lib/
│   ├── utils.ts               # Shadcn cn() utility
│   └── ...
└── ...
```

---

## Progress Tracking

| Phase | Status | Sessions Used | Notes |
|-------|--------|---------------|-------|
| Phase 1 | 🔴 Not Started | 0 | |
| Phase 2 | 🔴 Not Started | 0 | |
| Phase 3 | 🔴 Not Started | 0 | |
| Phase 4 | 🔴 Not Started | 0 | |
| Phase 5 | 🔴 Not Started | 0 | |
| Phase 6 | 🔴 Not Started | 0 | |
| Phase 7 | 🔴 Not Started | 0 | |

**Status Legend**: 🔴 Not Started | 🟡 In Progress | 🟢 Complete

---

## Session Handoff Notes

*Update this section at the end of each session with:*
- What was completed
- What's in progress
- Any blockers or decisions made
- Files that were modified

### Session Log

#### Session 1 (Initial) - COMPLETE
- **Date**: Jan 31, 2026
- **Tokens Used**: ~60k
- **Completed**:
  - Full architecture analysis of entire codebase
  - Documented system architecture (data model, auth flow, routes, components)
  - Created `05_UI_UX_Improvement_Plan.md` with 7 phases of improvements
  - Created `CHAT_STARTER_PROMPT.md` for session continuity
  - Committed and pushed both files
- **Key Files Read**:
  - All 4 mission briefs (01-04)
  - `src/lib/data.ts`, `src/lib/auth.ts`, `src/lib/mock-data.ts`, `src/lib/supabase.ts`
  - `src/hooks/useAuth.ts`, `src/middleware.ts`
  - `src/app/layout.tsx`, `src/app/globals.css`
  - Dashboard and Admin layouts + pages
  - `src/components/referral-tree/ReferralTree.tsx`
  - `src/app/api/referrals/route.ts`
  - Database schema in `supabase/migrations/`
- **Next Session**: Start Phase 1 - Install Shadcn/UI
- **Notes**: No code changes made, purely analysis and planning session

---

## Starter Prompt for New Sessions

See bottom of this document for the prompt to use when starting a new chat.
