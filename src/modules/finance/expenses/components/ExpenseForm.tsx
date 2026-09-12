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
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useActiveExpenseCategories } from "../../expense-categories/hooks/use-active-expense-categories";
import {
	EXPENSE_PAYMENT_METHOD_OPTIONS,
	EXPENSE_STATUS_OPTIONS,
	ExpenseFormValues,
	expenseSchema,
} from "../dto/expense.dto";
import { createExpense, updateExpense } from "../hooks/use-expense-mutations";

type Props = {
	id?: string;
	defaultValues: ExpenseFormValues;
	isEdit?: boolean;
};

/** Blank optional fields are dropped rather than sent as "". */
const clean = (value?: string | null) => (value ? value : undefined);

export default function ExpenseForm({ id, defaultValues, isEdit = false }: Props) {
	const router = useRouter();
	const t = useTranslations("Expenses");
	const ft = useTranslations("Forms");
	const tc = useTranslations("Common");
	const { categories, isLoading: isLoadingCategories } = useActiveExpenseCategories();

	const form = useForm<ExpenseFormValues>({
		resolver: zodResolver(expenseSchema as any),
		shouldFocusError: false,
		defaultValues,
	});

	const categoryOptions = useMemo(
		() => categories.map((category) => ({ label: category.name, value: category.id })),
		[categories]
	);

	const selectedCategoryId = form.watch("categoryId");
	const selectedCategory = categories.find((category) => category.id === selectedCategoryId);
	const isRecurring = selectedCategory?.recurrence === "RECURRING";

	const onSubmit = async (data: ExpenseFormValues) => {
		const payload = {
			categoryId: data.categoryId,
			title: data.title,
			description: clean(data.description),
			amount: Number(data.amount),
			expenseDate: data.expenseDate,
			status: data.status,
			paymentMethod: clean(data.paymentMethod) as ExpenseFormValues["paymentMethod"],
			referenceNo: clean(data.referenceNo),
			payee: clean(data.payee),
			billingPeriod: clean(data.billingPeriod),
			notes: clean(data.notes),
		};

		try {
			if (isEdit && id) {
				await updateExpense(id, payload);
				toast.success(t("updateSuccess"));
			} else {
				await createExpense(payload);
				toast.success(t("createSuccess"));
			}
			router.push(PATHS.FINANCE.EXPENSES.ROOT);
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
					{/* Only manually-owned categories are listed. Inventory purchases
					    already write their own entry, and salaries will come from
					    Payroll — typing either by hand would double-count the spend. */}
					<InputField
						control={form.control}
						name="categoryId"
						label={t("category")}
						type="select"
						placeholder={
							isLoadingCategories ? tc("loading") : t("selectCategory")
						}
						options={categoryOptions}
						required
					/>
					<InputField
						control={form.control}
						name="title"
						label={t("expenseTitle")}
						type="text"
						placeholder="e.g. DESCO electricity bill — March"
						required
					/>
					<InputField
						control={form.control}
						name="amount"
						label={t("amountBdt")}
						type="number"
						step="0.01"
						min={0}
						placeholder="0.00"
						required
					/>
					<InputField
						control={form.control}
						name="expenseDate"
						label={t("expenseDate")}
						type="date"
						required
					/>
					<InputField
						control={form.control}
						name="status"
						label={t("status")}
						type="select"
						placeholder={t("selectStatus")}
						options={EXPENSE_STATUS_OPTIONS}
						helperText={t("statusHelper")}
					/>
					<InputField
						control={form.control}
						name="paymentMethod"
						label={t("paymentMethod")}
						type="select"
						placeholder={t("selectPaymentMethod")}
						options={EXPENSE_PAYMENT_METHOD_OPTIONS}
					/>
					<InputField
						control={form.control}
						name="payee"
						label={t("payee")}
						type="text"
						placeholder="e.g. Dhaka WASA"
					/>
					<InputField
						control={form.control}
						name="referenceNo"
						label={t("referenceNo")}
						type="text"
						placeholder="Bill / voucher / cheque no."
					/>
					{/* A recurring bill is dated when it was paid but covers an earlier
					    month — an April electricity bill settled in May needs both. */}
					<InputField
						control={form.control}
						name="billingPeriod"
						label={t("billingPeriod")}
						type="month"
						helperText={isRecurring ? t("billingPeriodRecurringHelper") : t("billingPeriodHelper")}
					/>
					<InputField
						control={form.control}
						name="description"
						label={t("descriptionLabel")}
						type="textarea"
						placeholder={t("descriptionPlaceholder")}
						fieldClass="col-span-full"
					/>
					<InputField
						control={form.control}
						name="notes"
						label={t("notes")}
						type="textarea"
						placeholder={t("notesPlaceholder")}
						fieldClass="col-span-full"
					/>
				</CardContent>
			</Card>

			<div className="bg-background/95 sticky bottom-0 z-10 flex justify-end gap-3 rounded-md p-4 shadow-lg backdrop-blur">
				<Button
					variant="outline"
					type="button"
					onClick={() => router.push(PATHS.FINANCE.EXPENSES.ROOT)}
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
