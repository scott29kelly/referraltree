# Chat Starter Prompt

Copy everything below the line when starting a new chat session.

---

## Guardianship PWA - Continuation Session

I'm working on the **Guardianship** referral tracking PWA for Guardian Storm Repair. This is a continuation of previous work.

### Quick Context
- **Stack**: Next.js 16 (App Router), Tailwind CSS 4, Framer Motion, ReactFlow, Supabase-ready
- **Purpose**: Sales reps track referrals, earn $250/closed deal, admins manage pipeline
- **Three user types**: Reps, Admins, Customers (public referral submission)

### Important Files to Reference
1. `@05_UI_UX_Improvement_Plan.md` - Master task list with phases and progress
2. `@01_Mission_Brief` - Project vision ("2026 Premium" aesthetic)
3. `@02_Design_System` - Colors, typography, UI patterns
4. `@03_Component_Specs` - Component requirements
5. `@04_Execution_Plan` - Original implementation phases

### Token Management
- **End this chat between 100k-120k tokens** to maintain model performance
- Update the Session Log in `05_UI_UX_Improvement_Plan.md` before ending
- Commit and push changes before transitioning

### Current Session Task
**[UPDATE THIS SECTION BASED ON WHAT YOU WANT TO WORK ON]**

Continue with Phase X from the improvement plan:
- [ ] Specific task 1
- [ ] Specific task 2
- [ ] Specific task 3

### Session Rules
1. Read the improvement plan first to understand current progress
2. Check the Session Log for context from previous sessions
3. Mark tasks complete as you finish them
4. Commit frequently with descriptive messages
5. Update Session Log before ending chat

---

## Quick Start Commands

```bash
# Start dev server
npm run dev

# Check for lint errors
npm run lint

# Build for production
npm run build
```

## Key File Locations

| Purpose | Path |
|---------|------|
| Root layout | `src/app/layout.tsx` |
| Global CSS | `src/app/globals.css` |
| Auth hook | `src/hooks/useAuth.ts` |
| Data layer | `src/lib/data.ts` |
| Mock data | `src/lib/mock-data.ts` |
| Types | `src/types/database.ts` |
| Dashboard layout | `src/app/dashboard/layout.tsx` |
| Admin layout | `src/app/admin/layout.tsx` |
| Referral tree | `src/components/referral-tree/ReferralTree.tsx` |

---

## Example Session Prompts

### Starting Phase 1 (Shadcn/UI)
```
Continue with Phase 1 from the improvement plan:
- Install and configure Shadcn/UI
- Set up the base components (Button, Card, Sheet, Dialog)
- Ensure it works with our existing dark mode theme
```

### Starting Phase 2 (Mobile)
```
Continue with Phase 2 from the improvement plan:
- Implement bottom sheet navigation for mobile
- Create a floating action button component
- Add swipe gestures to referral cards
```

### Bug Fix Session
```
I found an issue with [describe issue]. Please:
1. Read the relevant files
2. Identify the root cause
3. Implement a fix
4. Test and verify
```

### Feature Addition
```
I want to add [feature name]. Please:
1. Review the improvement plan for related tasks
2. Propose an implementation approach
3. Implement with proper types and error handling
4. Update the plan with progress
```
