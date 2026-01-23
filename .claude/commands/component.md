---
description: Generate a new React component with shadcn/ui patterns and TypeScript
allowed-tools: Read, Write, Glob, Grep, Bash
---

# Generate UI Component

Create a new React component following the project's conventions.

## Instructions

When the user provides a component name and optional description:

1. **Determine component type:**
   - Page component → `src/app/(dashboard)/[name]/page.tsx`
   - UI component → `src/components/[name].tsx`
   - Feature component → `src/components/[feature]/[name].tsx`

2. **Ask clarifying questions if needed:**
   - Is this a Server or Client component?
   - Does it need data fetching?
   - What shadcn/ui components should it use?

3. **Generate the component with:**
   - Proper TypeScript interfaces for props
   - Appropriate 'use client' directive if needed
   - shadcn/ui imports
   - Tailwind CSS styling
   - Loading and error states if applicable
   - Accessibility attributes

## Component Templates

### Server Component (default)
```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ComponentNameProps {
  // props
}

export function ComponentName({ }: ComponentNameProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        {/* content */}
      </CardContent>
    </Card>
  )
}
```

### Client Component
```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ComponentNameProps {
  // props
}

export function ComponentName({ }: ComponentNameProps) {
  const [state, setState] = useState()

  return (
    <div>
      {/* interactive content */}
    </div>
  )
}
```

### Form Component
```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FormData {
  // form fields
}

interface ComponentNameProps {
  onSubmit: (data: FormData) => Promise<void>
  initialData?: Partial<FormData>
}

export function ComponentName({ onSubmit, initialData }: ComponentNameProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await onSubmit(Object.fromEntries(formData) as FormData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="field">Field</Label>
        <Input
          id="field"
          name="field"
          defaultValue={initialData?.field}
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
```

## Example Usage

User: `/component TaskCard - displays a task with title, status badge, and due date`

Generate a component that:
- Uses Card from shadcn/ui
- Shows task title, status Badge, and formatted due date
- Is properly typed with Task interface
- Includes hover effects and click handler
