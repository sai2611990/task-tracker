---
name: frontend-review
description: Reviews and assists with frontend code including React, Next.js, TypeScript, Tailwind CSS, and shadcn/ui. Automatically invoked when working with UI components, styling, or frontend architecture.
---

# Frontend Development Skill

This skill provides comprehensive frontend development assistance for the TaskTracker Pro application.

## Tech Stack Context
- **Framework:** Next.js 14 (App Router)
- **UI Library:** React 18 with TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Icons:** Lucide React

## Component Review Guidelines

When reviewing or creating React components:

### Structure
- Use functional components with TypeScript
- Props should be typed with interfaces (not types for objects)
- Use `'use client'` directive only when necessary (client-side interactivity)
- Prefer Server Components for data fetching

### Naming Conventions
- Components: PascalCase (`TaskCard.tsx`)
- Hooks: camelCase with `use` prefix (`useTaskData.ts`)
- Utils: camelCase (`formatDate.ts`)
- Types: PascalCase with descriptive names (`TaskStatus`, `UserProfile`)

### Best Practices
1. Keep components small and focused (single responsibility)
2. Extract reusable logic into custom hooks
3. Use composition over prop drilling
4. Implement proper error boundaries
5. Add loading states for async operations

## Accessibility Checklist
- [ ] All interactive elements are keyboard accessible
- [ ] Images have alt text
- [ ] Form inputs have associated labels
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Focus states are visible
- [ ] ARIA labels for icon-only buttons
- [ ] Semantic HTML elements used appropriately

## Performance Guidelines
1. Use `React.memo()` for expensive pure components
2. Implement `useMemo` and `useCallback` judiciously
3. Lazy load heavy components with `dynamic()` or `React.lazy()`
4. Optimize images with `next/image`
5. Avoid inline object/array creation in JSX
6. Use virtualization for long lists

## shadcn/ui Patterns

### Importing Components
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
```

### Common Component Patterns
```tsx
// Dialog with form
<Dialog>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    {/* Form content */}
  </DialogContent>
</Dialog>
```

## Tailwind CSS Conventions

### Spacing Scale
- Use consistent spacing: `p-4`, `gap-4`, `space-y-4`
- Margins for layout, padding for content

### Responsive Design
- Mobile-first approach
- Breakpoints: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- Common pattern: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

### Dark Mode
- Use `dark:` variant for dark mode styles
- Prefer semantic colors: `bg-background`, `text-foreground`

### Class Organization
Order classes logically:
1. Layout (flex, grid, position)
2. Sizing (w-, h-, max-w-)
3. Spacing (p-, m-, gap-)
4. Typography (text-, font-)
5. Colors (bg-, text-, border-)
6. Effects (shadow, rounded, opacity)
7. States (hover:, focus:, active:)
8. Responsive (sm:, md:, lg:)

## Code Examples

### Typical Page Component
```tsx
// app/(dashboard)/example/page.tsx
import { Suspense } from 'react'
import { ExampleList } from '@/components/example-list'
import { ExampleSkeleton } from '@/components/example-skeleton'

export default function ExamplePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Example</h1>
        <Button>Add New</Button>
      </div>
      <Suspense fallback={<ExampleSkeleton />}>
        <ExampleList />
      </Suspense>
    </div>
  )
}
```

### Client Component with State
```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface TaskFormProps {
  onSubmit: (data: TaskData) => Promise<void>
  initialData?: TaskData
}

export function TaskForm({ onSubmit, initialData }: TaskFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
```
