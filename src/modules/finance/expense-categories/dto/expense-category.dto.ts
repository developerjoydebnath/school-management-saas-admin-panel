import { z } from "zod";

/**
 * RECURRING bills arrive on a cycle (electricity, every month). ONE_OFF bills
 * are irregular — three plumbing repairs in one month, then nothing for a year.
 * `interval` only means something for a RECURRING category, which is why the
 * form clears it whenever the recurrence flips back to ONE_OFF.
 */
export const EXPENSE_RECURRENCE_OPTIONS = [
	{ label: "Recurring", value: "RECURRING" },
	{ label: "One-off", value: "ONE_OFF" },
];

export const EXPENSE_INTERVAL_OPTIONS = [
	{ label: "Monthly", value: "MONTHLY" },
	{ label: "Quarterly", value: "QUARTERLY" },
	{ label: "Half-yearly", value: "HALF_YEARLY" },
	{ label: "Yearly", value: "YEARLY" },
];

export const EXPENSE_SOURCE_OPTIONS = [
	{ label: "Manual", value: "MANUAL" },
	{ label: "Inventory", value: "INVENTORY" },
	{ label: "Payroll", value: "PAYROLL" },
];

export const expenseCategorySchema = z
	.object({
		name: z.string().min(1, "Name is required").max(120),
		nameBn: z.string().max(120).optional().nullable(),
		code: z
			.string()
			.max(60)
			.regex(/^[a-z0-9_]*$/, "Only lowercase letters, numbers and underscores")
			.optional()
			.nullable(),
		description: z.string().max(500).optional().nullable(),
		recurrence: z.enum(["RECURRING", "ONE_OFF"]).default("ONE_OFF"),
		interval: z
			.enum(["MONTHLY", "QUARTERLY", "HALF_YEARLY", "YEARLY"])
			.optional()
			.nullable(),
		isActive: z
			.union([z.boolean(), z.string()])
			.transform((value) => value === true || value === "true")
			.optional()
			.default(true),
		sortOrder: z.coerce.number().min(0).optional().default(500),
	})
	.refine((values) => values.recurrence !== "RECURRING" || !!values.interval, {
		message: "Pick how often this bill repeats",
		path: ["interval"],
	});

export type ExpenseCategoryFormValues = z.infer<typeof expenseCategorySchema>;
