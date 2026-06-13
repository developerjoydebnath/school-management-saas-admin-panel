# Error Handling

## Global Auto-Toasting

All API errors automatically trigger a toast notification via the Axios interceptor. Components should rely on this global handling for UI notifications.

```ts
// ✅ Correct
const handleSubmit = async (data) => {
    try {
        await axios.post("/endpoint", data);
        toast.success("Saved successfully");
    } catch (error) {
        // Only handle component-specific state, e.g. turning off a loading spinner
        setLoading(false);
    }
};

// ❌ Wrong
const handleSubmit = async (data) => {
    try {
        await axios.post("/endpoint", data);
    } catch (error) {
        // Redundant - the interceptor already showed a toast
        toast.error("Failed to save");
    }
};
```

**Why:** It prevents redundant error handling code across the codebase. Developers can just fire the API request and know the user will be notified consistently if it fails.

## 404 GET Suppression

The global Axios interceptor intentionally suppresses toasts for `404 Not Found` errors on `GET` requests. 

- **Do not** manually toast a 404 error if a `GET` request fails.
- **Do** handle the 404 gracefully in the UI (e.g. show an "Empty State" or "Not Found" component).
- `POST`, `PUT`, `PATCH`, and `DELETE` requests that return 404 *will* still trigger a toast, as those indicate an action failed on a missing resource.

**Why:** When a GET request returns a 404, it usually means a record wasn't found (e.g. visiting a deleted student's page). The UI handles this gracefully with an 'empty state'. Toasting "Not found" at the top of the screen would be annoying and redundant for the user.

## NestJS Error Parsing

The global Axios interceptor expects and explicitly unpacks NestJS error response structures.

```ts
if (typeof data.message === "string") {
    errorMessage = data.message;
} else if (Array.isArray(data.message) && data.message.length > 0) {
    errorMessage = data.message[0]; // First validation error
} else if (typeof data.error === "string") {
    errorMessage = data.error;
}
```

**Why:** NestJS often returns `{ message: ["email must be an email"], error: "Bad Request" }` for validation failures. Unpacking it ensures the user sees a single, human-readable string ("email must be an email") instead of raw array objects, `[object Object]`, or generic "Bad Request" strings.
