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

---

## Select Field Rule

When rendering dropdown fields through `InputField`, always use `type="select"`. Do not use `type="native_select"` in forms.

```tsx
// ✅ Correct
<InputField
	control={form.control}
	name="status"
	label="Status"
	type="select"
	options={statusOptions}
/>

// ❌ Wrong
<InputField
	control={form.control}
	name="status"
	label="Status"
	type="native_select"
	options={statusOptions}
/>
```

**Why:** The app uses the shared styled select for consistent behavior, theme, spacing, and interaction across create/update forms.

## Placeholder Rule

Every form field rendered through `InputField` must include a meaningful `placeholder` prop. Use concrete examples for text/number fields and clear action text for select fields.

```tsx
// ✅ Correct
<InputField
	control={form.control}
	name="roomNo"
	label="Room No"
	type="text"
	placeholder="e.g. 301"
	required
/>

<InputField
	control={form.control}
	name="status"
	label="Status"
	type="select"
	placeholder="Select status"
	options={statusOptions}
	required
/>

// ❌ Wrong
<InputField control={form.control} name="roomNo" label="Room No" type="text" />
```

**Why:** Placeholders make forms faster to understand, clarify expected formats, and keep create/update pages consistent.

## Page Form Width Rule

Dedicated create/update page forms must be centered and capped at `max-w-7xl`.

```tsx
// ✅ Correct
<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
	{/* fields */}
</form>
```

Do not use narrower page-form caps such as `max-w-5xl` unless the user explicitly asks for a smaller form. Dialog forms may rely on the dialog width, but page-level forms must use `mx-auto max-w-7xl`.

**Why:** Large school-management forms need enough horizontal room for container-query grids while staying centered on wide screens.

### Server-Backed Select Fields

Do not call option-list APIs directly inside form components when the data is only used to fill a select box. Create a reusable select component in `src/shared/components/form`, make that component fetch its own options, and expose it through `InputField` as a custom field type.

```tsx
<InputField
	control={form.control}
	name="planId"
	label="Subscription Plan"
	type="subscriptionPlanSelect"
	placeholder="Select subscription plan"
/>
```

Examples include `sessionSelect`, `schoolSelect`, and `subscriptionPlanSelect`.

**Why:** Forms stay focused on submit logic and validation, while server-backed select options become reusable across create/update pages and other modules.

---

## Generic DataTable Wrapper

When displaying lists of data, use the shared `<DataTable<T>>` component rather than writing raw table logic or iterating over rows manually.

```tsx
<DataTable
	data={entities}
	isLoading={isLoading}
	pagination={{
		page: meta.page,
		limit: meta.limit,
		total: meta.total,
		totalPages: meta.totalPages,
		onPageChange: setPage,
		onLimitChange: setLimit,
	}}
	columns={columns}
/>
```

---

## Inline Column Definitions

Define table `columns` directly inside the parent component rather than in a separate `columns.tsx` file. This allows direct access to `useTranslations` and routing tools.

```tsx
export function EntityList() {
	const t = useTranslations("EntityPage");

	const columns: ColumnDef<any>[] = [
		{
			id: "name",
			header: t("name"),
			cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
		},
	];

	return <DataTable columns={columns} data={data} />;
}
```

---

## Page Breadcrumbs

Every page component MUST implement breadcrumbs using the `useBreadcrumbStore` hook and `next-intl` navigation translations.

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

	return ( /* ... */ );
}
```

---

## Button Component Rules

1. **Icons in Buttons**: Never use margin utilities (`mr-2`, `ml-2`) inside a Button. The Button uses `gap` automatically.
   ```tsx
   // ✅ Correct
   <Button><Plus className="size-4" /> Add</Button>
   // ❌ Wrong
   <Button><Plus className="mr-2 size-4" /> Add</Button>
   ```

2. **Link Buttons**: Use `nativeButton={false}` + `render` prop when wrapping a `<Link>`.
   ```tsx
   <Button nativeButton={false} render={<Link href="/some-path" />}>Go</Button>
   ```

3. **Trigger Buttons**: Use `render` prop for `AlertDialogTrigger` and similar.
   ```tsx
   <AlertDialogTrigger render={<Button variant="destructive"><Trash2 className="size-4" /></Button>} />
   ```

---

## Responsive Layouts & Container Queries

This project uses **CSS Container Queries** instead of viewport media queries.

- `@container/body`: Root body context — for full-height layout calculations.
- `@container/page`: Every `page.tsx` wraps content in `<div className="@container/page">`.
- Use `@xl/page:`, `@3xl/page:` for responsive grids and visibility inside pages.

---

## Filter Component Architecture

Always support both desktop (inline) and mobile (drawer) filter views using shared `Filter.tsx` components.

```tsx
import { FilterDesktopWrapper, FilterMobileWrapper, FilterContainer, FilterTriggerButton, FilterContent } from "@/shared/components/custom/Filter";
import FilterButton from "@/shared/components/form/FilterButton";

<FilterDesktopWrapper>
	<FilterButton title="Status" selected={filter.status} onSelect={...} />
</FilterDesktopWrapper>

<FilterMobileWrapper>
	<EntityCreate />   {/* Create button always in mobile wrapper */}
	<FilterContainer>
		<FilterTriggerButton className="w-fit">
			<IconFilter className="size-4" /> Filter
		</FilterTriggerButton>
		<FilterContent>
			<FilterButton title="Status" selected={filter.status} onSelect={...} />
		</FilterContent>
	</FilterContainer>
</FilterMobileWrapper>
```

---

## Page Architecture (3-Layer Pattern)

Every feature page follows this strict, three-layer pattern. **All layers are mandatory.**

### Layer 1: Page Route (`src/app/(protected)/...`)

The thinnest possible shell. Only sets breadcrumbs, renders `<PageHeading>`, and mounts the list. No state, no data fetching, no business logic.

```tsx
// ✅ Correct: src/app/(protected)/roles/matrix/page.tsx
"use client";

import { EntityCreate } from "@/modules/feature/components/EntityCreate";
import { EntityList } from "@/modules/feature/components/EntityList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function EntityPage() {
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("parent"), href: PATHS.PARENT.ROOT },
			{ label: tNav("entity") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="EntityPage">
				{/* Desktop-only Create button slot */}
				<div className="hidden @3xl/page:flex">
					<EntityCreate />
				</div>
			</PageHeading>
			<EntityList />
		</div>
	);
}
```

**The `EntityCreate` appears in TWO places:**
1. Inside `<PageHeading>` wrapped in `<div className="hidden @3xl/page:flex">` — visible on desktop.
2. As `children` passed to `<EntityFilterBar>` inside `EntityList` — visible on mobile.

### Layer 2: EntityList Component

Self-contained unit that owns filter state, pagination state, delete handlers, and the edit dialog/navigation trigger.

```tsx
// ✅ Correct: src/modules/feature/components/EntityList.tsx
"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { deleteEntity } from "../hooks/use-entity-mutations";
import { useEntities } from "../hooks/use-entities";
import { EntityCreate } from "./EntityCreate";
import EntityFilterBar from "./EntityFilterBar";
// Dialog-mode: import { EntityForm } from "./EntityForm";
// Page-mode:   import Link from "next/link"; import { PATHS } from "@/shared/configs/paths.config";

export type EntityFilter = { search: string };
const initialFilters: EntityFilter = { search: "" };

export function EntityList() {
	const [filter, setFilter] = useState<EntityFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const { mutate } = useSWRConfig();
	const t = useTranslations("EntityPage");
	const tc = useTranslations("Common");

	const { data: entities, meta, isLoading } = useEntities({ page, limit, ...filter });

	// Dialog-mode edit state (only used in dialog strategy):
	// const [isFormOpen, setIsFormOpen] = useState(false);
	// const [selectedEntity, setSelectedEntity] = useState<EntityModel | null>(null);

	const [entityToDelete, setEntityToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const confirmDelete = async (id: string) => {
		setEntityToDelete(id);
		setIsDeleting(true);
		try {
			await deleteEntity(id);
			toast.success(t("deleteSuccess"));
			mutate((key: any) => typeof key === "string" && key.startsWith("/entity"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsDeleting(false);
			setEntityToDelete(null);
		}
	};

	const columns: ColumnDef<any>[] = [
		{
			id: "name",
			header: t("name"),
			cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
		},
		{
			id: "actions",
			header: tc("actions"),
			cell: ({ row }) => {
				const entity = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard permissions={[PERMISSIONS.FEATURE.EDIT]}>
							{/* Dialog-mode: */}
							{/* <Button variant="outline" size="icon" onClick={() => { setSelectedEntity(entity); setIsFormOpen(true); }}><Edit2 className="h-4 w-4" /></Button> */}
							{/* Page-mode: */}
							<Button nativeButton={false} render={<Link href={PATHS.FEATURE.EDIT(entity.id)} />} variant="outline" size="icon">
								<Edit2 className="h-4 w-4 text-muted-foreground" />
							</Button>
						</PermissionGuard>
						<PermissionGuard permissions={[PERMISSIONS.FEATURE.DELETE]}>
							<ConfirmationModal
								onConfirm={() => confirmDelete(entity.id)}
								title={t("deleteTitle")}
								description={t("deleteDescription")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && entityToDelete === entity.id}
							>
								<AlertDialogTrigger render={<Button variant="outline" size="icon"><Trash2 className="h-4 w-4 text-red-500" /></Button>} />
							</ConfirmationModal>
						</PermissionGuard>
					</div>
				);
			},
		},
	];

	const resetFilters = () => { setFilter(initialFilters); setPage(1); setLimit(10); };

	return (
		<Card className="p-6 shadow-none ring-0">
			<CardHeader className="p-0">
				<EntityFilterBar filter={filter} setFilter={setFilter}>
					<EntityCreate />
				</EntityFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter filter={filter} setFilter={setFilter} resetFilters={resetFilters} />
				<DataTable
					columns={columns}
					data={entities || []}
					isLoading={isLoading}
					pagination={meta ? { page: meta.page, limit: meta.limit, total: meta.total, totalPages: meta.totalPages, onPageChange: setPage, onLimitChange: setLimit } : undefined}
				/>
			</CardContent>
			{/* Dialog-mode only: */}
			{/* <EntityForm isOpen={isFormOpen} initialData={selectedEntity} onClose={() => { setIsFormOpen(false); setSelectedEntity(null); }} /> */}
		</Card>
	);
}
```

---

## Create / Edit Form Strategy

### Decision Rule

| Situation | Strategy |
|---|---|
| **Simple form** (fewer than ~6 fields, no file uploads, no sections) | **Dialog Form** |
| **Complex form** (many fields, tabs, file uploads, multi-step, nested sections) | **Dedicated Page Form** |

### Strategy A: Dialog Form (Simple)

**`EntityCreate.tsx`** — owns the trigger button and dialog open state.

```tsx
"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { EntityForm } from "./EntityForm";

export function EntityCreate() {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const t = useTranslations("EntityPage");

	return (
		<>
			<PermissionGuard permissions={[PERMISSIONS.FEATURE.CREATE]}>
				<Button onClick={() => setIsCreateOpen(true)}>
					<Plus className="size-4" />
					{t("addEntity")}
				</Button>
			</PermissionGuard>
			<EntityForm isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
		</>
	);
}
```

**`EntityForm.tsx`** — shared dialog form for both Create (no initialData) and Edit (with initialData).

```tsx
"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { EntityModel } from "@/shared/models/entity.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { EntityFormValues, entitySchema } from "../dto/entity.dto";
import { createEntity, updateEntity } from "../hooks/use-entity-mutations";

interface EntityFormProps {
	isOpen: boolean;
	onClose: () => void;
	initialData?: EntityModel | null;
	onSuccess?: () => void;
}

export function EntityForm({ isOpen, onClose, initialData, onSuccess }: EntityFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { mutate } = useSWRConfig();
	const t = useTranslations("EntityPage");

	const form = useForm<EntityFormValues>({
		resolver: zodResolver(entitySchema),
		defaultValues: { name: "" },
	});

	useEffect(() => {
		if (isOpen) {
			form.reset(initialData ? { name: initialData.name } : { name: "" });
		}
	}, [isOpen, initialData, form]);

	const onSubmit = async (data: EntityFormValues) => {
		setIsSubmitting(true);
		try {
			if (initialData?.id) {
				await updateEntity(initialData.id, data);
				toast.success(t("updateSuccess"));
			} else {
				await createEntity(data);
				toast.success(t("createSuccess"));
			}
			mutate((key: any) => typeof key === "string" && key.startsWith("/entity"));
			if (onSuccess) onSuccess();
			onClose();
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{initialData ? t("editEntityTitle") : t("createEntityTitle")}
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<InputField control={form.control} name="name" label="Name" type="text" required />
					<div className="flex justify-end gap-3 pt-4">
						<Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
							{t("cancel")}
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? t("saving") : initialData ? t("updateEntity") : t("createEntity")}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
```

### Strategy B: Dedicated Page Form (Complex)

**`EntityCreate.tsx`** — navigates to the create page instead of opening a dialog.

```tsx
"use client";

import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function EntityCreate() {
	const t = useTranslations("EntityPage");
	return (
		<PermissionGuard permissions={[PERMISSIONS.FEATURE.CREATE]}>
			<Button nativeButton={false} render={<Link href={PATHS.FEATURE.CREATE} />}>
				<Plus className="size-4" />
				{t("addEntity")}
			</Button>
		</PermissionGuard>
	);
}
```

**Edit page: `src/app/(protected)/feature/[id]/edit/page.tsx`**

```tsx
"use client";

import { EntityEditForm } from "@/modules/feature/components/EntityEditForm";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function EntityEditPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("feature"), href: PATHS.FEATURE.ROOT },
			{ label: tNav("editEntity") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="EntityEditPage" />
			<EntityEditForm id={id} />
		</div>
	);
}
```

**`EntityEditForm.tsx`** — fetches entity by ID on mount and pre-populates the form.

```tsx
"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWR } from "@/shared/hooks/use-swr";
import { EntityFormValues, entitySchema } from "../dto/entity.dto";
import { updateEntity } from "../hooks/use-entity-mutations";
import { PATHS } from "@/shared/configs/paths.config";
import { EntityModel } from "@/shared/models/entity.model";

export function EntityEditForm({ id }: { id: string }) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();
	const t = useTranslations("EntityPage");

	// Fetch entity details by ID
	const { data: rawData, isLoading } = useSWR(`/feature/${id}`);
	const entity = rawData ? new EntityModel(rawData) : null;

	const form = useForm<EntityFormValues>({
		resolver: zodResolver(entitySchema),
		defaultValues: { name: "" },
	});

	// Pre-populate form once data is loaded
	useEffect(() => {
		if (entity) {
			form.reset({ name: entity.name });
		}
	}, [entity, form]);

	const onSubmit = async (data: EntityFormValues) => {
		setIsSubmitting(true);
		try {
			await updateEntity(id, data);
			toast.success(t("updateSuccess"));
			router.push(PATHS.FEATURE.ROOT);
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) return <div>Loading...</div>;

	return (
		<Card className="shadow-none ring-0">
			<CardHeader>
				<CardTitle>{t("editEntityTitle")}</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<InputField control={form.control} name="name" label="Name" type="text" required />
					<div className="flex justify-end gap-3 pt-4">
						<Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
							{t("cancel")}
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? t("saving") : t("updateEntity")}
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
```

---

## Form Validation Schema Standard

All Zod schemas live in `dto/entity.dto.ts` within the feature module. Always export both the schema and the inferred type.

```ts
// ✅ Correct: src/modules/feature/dto/entity.dto.ts
import { z } from "zod";

export const entitySchema = z.object({
	name: z.string().min(1, "Name is required"),
	// ... other fields
});

export type EntityFormValues = z.infer<typeof entitySchema>;
```

### Enum Validation Fields

For enum-like form values, define and export a TypeScript enum first, then validate with `z.enum(enumName)`. Do not keep reusable enum values as inline string arrays inside the schema.

```ts
export enum subscriptionStatusEnum {
	TRIAL = "trial",
	ACTIVE = "active",
	CANCELED = "cancelled",
	EXPIRED = "expired",
	PAST_DUE = "past_due",
	SUSPENDED = "suspended",
}

export const schoolSubscriptionSchema = z.object({
	status: z.enum(subscriptionStatusEnum),
});
```

**Why:** The same enum can be reused by create pages, edit pages, select options, default values, and model mapping without duplicating raw strings.

### Dedicated Create/Edit Page Form Flow

For complex page forms, keep the create/edit pages responsible for page concerns and initial value preparation. The shared form component should receive `id`, `defaultValues`, and `isEdit`, then only own validation, fields, submit state, and create/update submit branching.

```tsx
// create/page.tsx
const defaultValues = {
	name: "",
	status: entityStatusEnum.ACTIVE,
};

<EntityForm id={undefined} defaultValues={defaultValues} />;

// [id]/edit/page.tsx
const { data: entity, isLoading } = useEntity(id);
const defaultValues = {
	name: entity?.name || "",
	status: entity?.status || entityStatusEnum.ACTIVE,
};

<EntityForm id={entity.id} defaultValues={defaultValues} isEdit />;
```

```tsx
// EntityForm.tsx
type Props = {
	id?: string;
	defaultValues: EntityFormValues;
	isEdit?: boolean;
};

export function EntityForm({ id, defaultValues, isEdit = false }: Props) {
	const form = useForm<EntityFormValues>({
		resolver: zodResolver(entitySchema),
		shouldFocusError: false,
		defaultValues,
	});

	const onSubmit = async (data: EntityFormValues) => {
		if (isEdit && id) {
			await updateEntity(id, data);
		} else {
			await createEntity(data);
		}
	};
}
```

Do not fetch detail data inside the shared form. Do not use `initialData` plus `form.reset` for complex dedicated page forms when the create/edit page can prepare stable `defaultValues`.

---

## Mutation Hooks Standard

All POST / PATCH / DELETE calls live in `hooks/use-entity-mutations.ts`. Never call axios directly inside a component.

```ts
// ✅ Correct: src/modules/feature/hooks/use-entity-mutations.ts
import axios from "@/shared/lib/axios";
import { EntityFormValues } from "../dto/entity.dto";

export const createEntity = async (data: EntityFormValues) => {
	const response = await axios.post("/entity", data);
	return response.data;
};

export const updateEntity = async (id: string | number, data: Partial<EntityFormValues>) => {
	const response = await axios.patch(`/entity/${id}`, data);
	return response.data;
};

export const deleteEntity = async (id: string | number) => {
	const response = await axios.delete(`/entity/${id}`);
	return response.data;
};
```

---

## Dialogs & Modals

When creating modals that fetch detailed data (e.g., clicking an "Eye" icon in a data table):

### Avoid Loading Flashes
Use a `hasOpened` state to track if the dialog has ever been opened. Pass this to your `useSWR` hook to prevent the query key from changing back to `null` while the dialog is animating closed. This prevents the loading skeleton from flashing during the closing animation.

```tsx
const [isOpen, setIsOpen] = useState(false);
const [hasOpened, setHasOpened] = useState(false);

useEffect(() => {
    if (isOpen && !hasOpened) setHasOpened(true);
}, [isOpen, hasOpened]);

const { data } = useRole(hasOpened ? roleId : null);
```

### Scrollbars
Do not use `overflow-y-auto` with native scrollbars. Wrap the dialog content in the shadcn `<ScrollArea>` component.

```tsx
<DialogContent className="sm:max-w-[550px]">
    <DialogHeader>...</DialogHeader>
    <ScrollArea className="max-h-[70vh] pr-4 -mr-4">
        {/* Content */}
    </ScrollArea>
</DialogContent>
```

## Compact Sheet Details Pattern

When showing entity details in a right-side sheet, use a compact, quiet layout.

- On small screens, the sheet must be full width.
- Do not pass full list-row objects into details sheets. The list API must return only the fields needed by the visible table columns and row actions. When the user opens a details sheet, open the sheet immediately, show skeleton loading content, call the details API by id, and render the loaded details response.
- Use small text and normal font weight for titles, section headings, values, chips, and table rows.
- Do not use large display text, bold section headers, or oversized statistic cards inside details sheets.
- Put related summary fields into two-column sections when there is enough room.
- Keep section spacing tight (`p-4`, `space-y-4`, small table rows) while preserving readable labels and values.
- Localize the sheet title, description, and section titles only. Do not localize backend data values or field labels unless the task explicitly asks for it.

```tsx
<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[64vw]">
	<SheetHeader className="border-b p-4">
		<SheetTitle className="text-base font-normal leading-6">{t("detailsTitle")}</SheetTitle>
		<SheetDescription className="text-xs">{t("detailsDescription")}</SheetDescription>
	</SheetHeader>
	<ScrollArea className="h-[calc(100vh-73px)]">
		<div className="space-y-4 p-4">
			<section className="rounded-md border p-4">
				<h3 className="text-sm font-normal">{t("sectionTitle")}</h3>
				<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
					{/* compact label/value pairs */}
				</div>
			</section>
		</div>
	</ScrollArea>
</SheetContent>
```

---

## Rich Text Rendering

When rendering data that contains HTML tags (like `description` or `notes` generated by TipTap):
*   Break them out of CSS Grids to allow full-width reading.
*   Use Tailwind Typography plugin classes (`prose prose-sm dark:prose-invert`) alongside React's `dangerouslySetInnerHTML`.

```tsx
<div 
  className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
  dangerouslySetInnerHTML={{ __html: role.description }}
/>
```
