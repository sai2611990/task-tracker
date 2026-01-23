# TaskTracker Pro

## Project Overview
Multi-company task management system for CEO managing 6 companies.
- Timeline-focused (weekly view preferred)
- Hierarchical structure: Companies → Departments → Teams → Members
- Department-level targets with freeze/commit functionality
- Checkpoints and reminders system

## Tech Stack
- **Frontend:** Next.js 14 (React) + Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL via Supabase
- **Auth:** Email/Password + Microsoft SSO
- **Hosting:** Vercel

## Key Commands
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run lint         # Run ESLint
npx supabase db push # Push database migrations
npx supabase gen types typescript --local > types/supabase.ts  # Generate types
```

## Project Structure
```
/app                    # Next.js app router
  /api                  # API routes
  /(auth)               # Login, signup pages
  /(dashboard)          # Main app pages
    /timeline           # Weekly/monthly views
    /companies          # Company management
    /departments        # Department management
    /teams              # Team management
    /tasks              # Task list view
    /settings           # User/app settings
/components
  /ui                   # shadcn components
  /timeline             # Calendar/timeline components
  /forms                # Form components
/lib
  /db                   # Database queries
  /auth                 # Auth utilities
  /utils                # Helper functions
/types                  # TypeScript definitions
```

## Data Model
- **Users**: id, email, name, role, avatar
- **Companies**: id, name, industry, color
- **Departments**: id, name, company_id, color
- **Teams**: id, name, department_id
- **TeamMemberships**: user_id, team_id, role (lead/member)
- **Projects**: id, name, company_id, department_id, status, dates, budget
- **Tasks**: id, title, project_id, assigned_to, status, priority, due_date, is_checkpoint
- **DepartmentTargets**: id, department_id, objective, timeline, status (draft/frozen)

## User Context
- CEO of 6 companies (NovaCube + 5 others)
- Prefers weekly timeline view
- Common departments: Accounts, Contracts, Sales, Support, HR
- Team members can be shared across departments
- Executive oversight feature needed (watch without membership)

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```
