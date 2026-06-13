# Permissions and Authorization

## PermissionGuard Component

When hiding or showing UI elements based on user permissions, always wrap the content in the `<PermissionGuard>` component rather than writing manual conditional logic.

```tsx
// ✅ Correct
<PermissionGuard permissions={["delete_user"]}>
    <Button variant="destructive">Delete User</Button>
</PermissionGuard>

// ❌ Wrong
{user?.permissions?.includes("delete_user") && (
    <Button variant="destructive">Delete User</Button>
)}
```

**Why:** It makes authorization declarative. Wrapping an element clearly communicates intent to developers at a glance, removes repetitive imperative logic from the render function, and inherently handles fallback behavior safely.

## Centralized `hasAccess` Utility

Never check `user.base_role` or write custom bypass logic inside components. Always use the centralized `hasAccess(user, permissions, requireAll)` utility.

```tsx
// ✅ Correct
const isAllowed = hasAccess(user, ["edit_class"]);

// ❌ Wrong
const isAllowed = user.base_role === "SUPER_ADMIN" || user.permissions.includes("edit_class");
```

**Why:** Bypass logic (like Developers and Super Admins getting access to everything) is a critical security rule. If components manually check permissions, someone will inevitably forget to include the Super Admin bypass. Centralizing it guarantees the bypass logic is enforced globally and correctly.

## Zustand Auth Sync

The user's authorization state (including their `base_role` and `permissions` array) must be pulled from the global Zustand store (`useAuthStore`).

```tsx
// ✅ Correct
const { user } = useAuthStore((state) => state.auth);
const isAllowed = hasAccess(user, ["view_dashboard"]);

// ❌ Wrong
const { data: user } = useSWR("/me");
const isAllowed = hasAccess(user, ["view_dashboard"]);
```

**Why:** By syncing the user object into a global Zustand store upon login, the frontend can perform synchronous, instant authorization checks anywhere in the app without needing to re-fetch the user profile from the API or parse a JWT payload on every render.

