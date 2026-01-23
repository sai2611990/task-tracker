---
description: Get help with Tailwind CSS classes, responsive design, and styling patterns
allowed-tools: Read, Grep, Glob
---

# Tailwind CSS Helper

Help with Tailwind CSS classes, patterns, and responsive design.

## Common Tasks

### 1. Convert CSS to Tailwind
When given CSS, convert to equivalent Tailwind classes:
- `display: flex` → `flex`
- `justify-content: center` → `justify-center`
- `padding: 1rem` → `p-4`
- `margin-bottom: 0.5rem` → `mb-2`

### 2. Responsive Layouts
Suggest responsive patterns:
```
Mobile-first grid:
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4

Responsive flex:
flex flex-col md:flex-row items-center gap-4

Hide on mobile:
hidden md:block

Show only on mobile:
block md:hidden
```

### 3. Common UI Patterns

**Card:**
```
rounded-lg border bg-card p-6 shadow-sm
```

**Button (custom):**
```
inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2
```

**Input:**
```
flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
```

**Badge:**
```
inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
```

**Avatar:**
```
relative h-10 w-10 rounded-full overflow-hidden
```

### 4. Spacing Reference
```
0    → 0px
0.5  → 2px
1    → 4px
2    → 8px
3    → 12px
4    → 16px
5    → 20px
6    → 24px
8    → 32px
10   → 40px
12   → 48px
16   → 64px
20   → 80px
24   → 96px
```

### 5. Color Conventions (shadcn/ui)
Use semantic colors from the theme:
- `bg-background` / `text-foreground` - main content
- `bg-card` / `text-card-foreground` - card surfaces
- `bg-primary` / `text-primary-foreground` - primary actions
- `bg-secondary` / `text-secondary-foreground` - secondary actions
- `bg-muted` / `text-muted-foreground` - subdued content
- `bg-accent` / `text-accent-foreground` - highlights
- `bg-destructive` / `text-destructive-foreground` - errors/delete
- `border` - default border color

### 6. Animation Classes
```
transition-all duration-200
transition-colors duration-150
animate-spin
animate-pulse
animate-bounce
hover:scale-105 transition-transform
```

### 7. Dark Mode
Always consider dark mode with semantic colors or explicit dark: variants:
```
bg-white dark:bg-gray-900
text-gray-900 dark:text-gray-100
border-gray-200 dark:border-gray-700
```

## Example Queries

- "How do I center a div?"
- "Make this card responsive"
- "Convert this CSS to Tailwind: { display: flex; gap: 1rem; padding: 2rem; }"
- "Best classes for a sticky header"
- "How to make text truncate with ellipsis"
