# Component Standards

## Mega-Controller InputField Pattern

When building forms with `react-hook-form`, do not use the standard, verbose `shadcn/ui` composition (`FormItem`, `FormControl`, `FormLabel`, etc.) for every single field. Instead, use the global `InputField` wrapper.

```tsx
// ✅ Correct
<InputField
    control={form.control}
    name="firstName"
    label="First Name"
    type="text"
    placeholder="Enter first name"
/>

// ❌ Wrong (Too verbose for this codebase)
<FormField
  control={form.control}
  name="firstName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>First Name</FormLabel>
      <FormControl>
        <Input placeholder="Enter first name" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Why:** It significantly reduces boilerplate. Standard forms require 6+ lines per field. The `InputField` reduces this to 1 line, making complex, multi-field forms much cleaner, easier to read, and simpler to maintain.

## Generic DataTable Wrapper

When displaying lists of data, use the shared `<DataTable<T>>` component rather than writing raw table logic or iterating over rows manually.

```tsx
<DataTable
	data={filteredStudents}
	isLoading={isLoading}
	pagination={{
		page: meta.page,
		limit: meta.limit,
		total: filteredStudents.length,
		totalPages: Math.ceil(filteredStudents.length / limit),
		onPageChange: setPage,
		onLimitChange: setLimit,
	}}
	columns={columns}
/>
```

**Why:** It enforces consistency across the entire app. Instead of every developer re-implementing empty states, loading skeletons, and error handling for their specific table, the generic `<DataTable>` wrapper guarantees that every list view looks and behaves identically.

## Inline Column Definitions

Define table `columns` directly inside the parent component (e.g., inside `StudentListTable`) rather than in a separate `columns.tsx` file.

```tsx
export default function StudentListTable() {
	const t = useTranslations("StudentList");

	// Define columns inline
	const columns: ColumnDef<any>[] = [
		{
			id: "fullName",
			header: t("studentName"), // Access translations directly
			cell: ({ row }) => <span>{row.original.fullName}</span>,
		},
	];

	return <DataTable columns={columns} data={data} />;
}
```

**Why:** It makes it much easier to access component-level context like `useTranslations` (for i18n headers) and routing tools (for cell action links). Extracting them to a separate file would require tediously passing down `t` functions or router objects.

## Page Breadcrumbs

Every page component MUST implement breadcrumbs using the `useBreadcrumbStore` hook and `next-intl` navigation translations. This ensures consistent navigation state across the application.

```tsx
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { PATHS } from "@/shared/configs/paths.config";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function ExamplePage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("parent_module"), href: PATHS.MODULE.ROOT },
			{ label: tNav("current_page") }, // Current page has no href
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		// ...
	);
}
```

**Why:** It centralizes breadcrumb state management through the store rather than passing props deeply. Using the `Navigation` namespace ensures breadcrumbs are properly localized and maintain a consistent layout throughout the entire admin panel.

## Button Component Rules

When using the `Button` component, adhere to these composition rules:

1. **Icons in Buttons**: Do NOT use margin utilities (like `mr-2` or `ml-2`) to space icons from text inside a `Button`. The `Button` component inherently uses `gap` utilities to space its children automatically.

    ```tsx
    // ✅ Correct
    <Button><Plus className="size-4" /> Add</Button>

    // ❌ Wrong
    <Button><Plus className="mr-2 size-4" /> Add</Button>
    ```

2. **Nesting Buttons**: If you need to render a Button inside another element that acts as a button (or replace its underlying element), use the `render` prop.

    ```tsx
    <Button render={<Button />}></Button>
    ```

3. **Nesting Non-Button Elements (e.g. Links, Triggers)**: When rendering a `Button` that encapsulates a non-button element—such as wrapping a `Link` tag or using it inside a trigger component like `AlertDialogTrigger`—pass the `nativeButton={false}` prop along with `render` to avoid rendering an invalid `<button>` inside a `<button>` or a `<a>` inside a `<button>`.
    ```tsx
    // For Triggers:
    <AlertDialogTrigger
    	render={
    		<Button variant="destructive">
    			<Trash2 className="size-4" />
    		</Button>
    	}
    />
    
    // For Links:
    <Button nativeButton={false} render={<Link href="/some-path" />}>
        Go to Path
    </Button>
    ```
