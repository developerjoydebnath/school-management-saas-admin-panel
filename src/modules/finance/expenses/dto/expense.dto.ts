import { z } from "zod";

export const EXPENSE_STATUS_OPTIONS = [
	{ label: "Paid", value: "PAID" },
	{ label: "Pending", value: "PENDING" },
	{ label: "Cancelled", value: "CANCELLED" },
];

/** Mirrors the backend `PaymentMethodEnum` — cash on hand is the common one. */
export const EXPENSE_PAYMENT_METHOD_OPTIONS = [
	{ label: "Cash", value: "cash" },
	{ label: "Bank", value: "bank" },
	{ label: "Cheque", value: "cheque" },
	{ label: "Mobile Banking", value: "mobile_banking" },
	{ label: "Card", value: "card" },
	{ label: "Other", value: "other" },
];

export const EXPENSE_SOURCE_FILTER_OPTIONS = [
	{ label: "Manual entry", value: "MANUAL" },
	{ label: "From Inventory", value: "INVENTORY" },
	{ label: "From Payroll", value: "PAYROLL" },
];

export const expenseSchema = z.object({
	categoryId: z.string().min(1, "Category is required"),
	title: z.string().min(1, "Title is required").max(200),
	description: z.string().max(1000).optional().nullable(),
	amount: z.coerce.number().min(0.01, "Amount must be greater than zero"),
	expenseDate: z.string().min(1, "Expense date is required"),
	status: z.enum(["PENDING", "PAID", "CANCELLED"]).default("PAID"),
	paymentMethod: z
		.enum(["cash", "bank", "cheque", "mobile_banking", "card", "other"])
		.optional()
		.nullable(),
	referenceNo: z.string().max(80).optional().nullable(),
	payee: z.string().max(150).optional().nullable(),
	/**
	 * Which month a recurring bill covers. An April electricity bill paid in May
	 * is dated May but bills April, and the monthly report needs both dates.
	 */
	billingPeriod: z
		.string()
		.regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use the YYYY-MM format")
		.optional()
		.nullable()
		.or(z.literal("")),
	notes: z.string().max(1000).optional().nullable(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
