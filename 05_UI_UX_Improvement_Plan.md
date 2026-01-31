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

## Phase 2: Component Migration (Future)

### Priority Components to Migrate
1. **AddRepModal** → Shadcn Dialog
2. **Toast** → Shadcn Toast/Sonner
3. **DateRangePicker** → Shadcn Popover + Calendar
4. **All Buttons** → Shadcn Button with variants

### New Components to Create
- [ ] Command Palette (for admin quick actions)
- [ ] Bottom Sheet (mobile-first modals)
- [ ] Data Table (with sorting, filtering)

---

## Phase 3: Polish & PWA (Future)

### UI Enhancements
- [ ] Page transitions with Framer Motion
- [ ] Skeleton loaders for all data fetching states
- [ ] Empty states with illustrations
- [ ] Error boundaries with recovery UI

### PWA Enhancements
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

### Session 1 (Previous)
**Focus:** Initial PWA setup, ReactFlow tree visualization, premium dark theme

**Completed:**
- Next.js 16 App Router setup
- Tailwind CSS 4 configuration
- Premium glassmorphism theme in globals.css
- ReactFlow integration for referral tree
- Basic component structure (StatsCard, Toast, etc.)
- PWA manifest and service worker
