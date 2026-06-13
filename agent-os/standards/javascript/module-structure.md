# Module Structure

## Domain-Driven Folders

Organize features inside `src/modules` by high-level business domain, then by feature. 

```text
// ✅ Correct
src/modules/academics/classes
src/modules/academics/subjects
src/modules/students/attendance

// ❌ Wrong
src/modules/classes
src/components/attendance
```

**Why:** It keeps the codebase scalable. Grouping by domain and feature means everything related to a specific business area is kept close together, avoiding massive, unmanageable `components` or `hooks` folders where context gets lost.

## Feature Encapsulation

Each feature directory must encapsulate its own `components`, `dto`, `constants`, and `hooks`.

```text
// ✅ Correct
src/modules/academics/classes/
  ├── components/
  │   ├── ClassForm.tsx
  │   └── ClassList.tsx
  ├── dto/
  │   └── class.dto.ts
  └── constants/
```

**Why:** It prevents global scope pollution. Files relevant only to a specific feature stay within that feature's boundary. 

- Use `src/shared` *strictly* for components, utilities, or constants that are actively used across multiple domains.
- If a component is only used by `classes`, it belongs in `src/modules/academics/classes/components/`.

## Separation from Routing

Keep business logic, state management, and UI out of the Next.js `src/app` routing directory. Next.js page files should only import and render components from `src/modules`.

```tsx
// ✅ Correct: src/app/(protected)/academics/classes/page.tsx
import { ClassList } from "@/modules/academics/classes/components/ClassList";

export default function ClassesPage() {
    return <ClassList />;
}
```

**Why:** It prevents the Next.js App Router from becoming bloated with business logic. The `src/app` directory strictly handles routing, layouts, and loading states. By keeping actual logic in `src/modules`, features remain modular, testable, and easily refactorable independently of the routing framework.
