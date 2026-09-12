"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	EXPENSE_INTERVAL_OPTIONS,
	EXPENSE_RECURRENCE_OPTIONS,
	ExpenseCategoryFormValues,
	expenseCategorySchema,
} from "../dto/expense-category.dto";
import {
	createExpenseCategory,
	updateExpenseCategory,
} from "../hooks/use-expense-category-mutations";

type Props = {
	id?: string;
	defaultValues: ExpenseCategoryFormValues;
	isEdit?: boolean;
	/** Seeded categories: the machine key and source are fixed for good. */
	isSystem?: boolean;
};

const statusOptions = [
	{ label: "Active", value: "true" },
	{ label: "Inactive", value: "false" },
];

export default function ExpenseCategoryForm({
	id,
	defaultValues,
	isEdit = false,
	isSystem = false,
}: Props) {
	const router = useRouter();
	const t = useTranslations("ExpenseCategories");
	const ft = useTranslations("Forms");

	const form = useForm<ExpenseCategoryFormValues>({
		resolver: zodResolver(expenseCategorySchema as any),
		shouldFocusError: false,
		defaultValues,
	});

	const recurrence = form.watch("recurrence");
	const isRecurring = recurrence === "RECURRING";

	const onSubmit = async (data: ExpenseCategoryFormValues) => {
		// `interval` is always sent explicitly, never omitted: on an edit the API
		// falls back to the stored interval when the field is absent, so flipping
		// a monthly bill to one-off would be rejected as "one-off with a repeat".
		const payload = {
			...data,
			interval: isRecurring ? data.interval : null,
			nameBn: data.nameBn || undefined,
			description: data.description || undefined,
		};

		try {
			if (isEdit && id) {
				// The API derives the machine key once, at creation, and the
				// automations look categories up by it — so it is never resent.
				const updatePayload = { ...payload };
				delete updatePayload.code;
				await updateExpenseCategory(id, updatePayload);
				toast.success(t("updateSuccess"));
			} else {
				await createExpenseCategory({
					...payload,
					code: payload.code || undefined,
				});
				toast.success(t("createSuccess"));
			}
			router.push(PATHS.FINANCE.EXPENSE_CATEGORIES.ROOT);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-4xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{isEdit ? t("editTitle") : t("createTitle")}</CardTitle>
					<CardDescription>
						{isEdit ? t("editDescription") : t("createDescription")}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
					<InputField
						control={form.control}
						name="name"
						label={t("name")}
						type="text"
						placeholder="e.g. Electricity Bill"
						required
					/>
					<InputField
						control={form.control}
						name="nameBn"
						label={t("nameBn")}
						type="text"
						placeholder="বিদ্যুৎ বিল"
					/>
					{!isEdit && (
						<InputField
							control={form.control}
							name="code"
							label={t("code")}
							type="text"
							placeholder="electricity_bill"
							helperText={t("codeHelper")}
						/>
					)}
					<InputField
						control={form.control}
						name="recurrence"
						label={t("recurrence")}
						type="select"
						placeholder={t("selectRecurrence")}
						options={EXPENSE_RECURRENCE_OPTIONS}
						helperText={t("recurrenceHelper")}
						required
					/>
					{isRecurring && (
						<InputField
							control={form.control}
							name="interval"
							label={t("interval")}
							type="select"
							placeholder={t("selectInterval")}
							options={EXPENSE_INTERVAL_OPTIONS}
							required
						/>
					)}
					<InputField
						control={form.control}
						name="sortOrder"
						label={t("sortOrder")}
						type="number"
						placeholder="500"
						helperText={t("sortOrderHelper")}
					/>
					<InputField
						control={form.control}
						name="isActive"
						label={t("status")}
						type="select"
						placeholder={t("selectStatus")}
						options={statusOptions}
					/>
					<InputField
						control={form.control}
						name="description"
						label={t("descriptionLabel")}
						type="textarea"
						placeholder={t("descriptionPlaceholder")}
						fieldClass="col-span-full"
					/>
					{isSystem && (
						<p className="text-muted-foreground border-border/70 bg-muted/40 col-span-full rounded-md border border-dashed p-3 text-xs">
							{t("systemCategoryNotice")}
						</p>
					)}
				</CardContent>
			</Card>

			<div className="bg-background/95 sticky bottom-0 z-10 flex justify-end gap-3 rounded-md p-4 shadow-lg backdrop-blur">
				<Button
					variant="outline"
					type="button"
					onClick={() => router.push(PATHS.FINANCE.EXPENSE_CATEGORIES.ROOT)}
					disabled={form.formState.isSubmitting}
				>
					{ft("cancel")}
				</Button>
				<Button type="submit" disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting
						? isEdit
							? ft("updateLoading")
							: ft("saveLoading")
						: isEdit
							? ft("update")
							: ft("save")}
				</Button>
			</div>
		</form>
	);
}
