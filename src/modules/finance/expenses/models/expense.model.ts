export type ExpenseCategoryRef = {
	id: string;
	name: string;
	nameBn?: string | null;
	code: string;
	recurrence: "RECURRING" | "ONE_OFF";
};

export type ExpenseModel = {
	id: string;
	categoryId: string;
	category?: ExpenseCategoryRef | null;
	title: string;
	description?: string | null;
	/** Already converted from Prisma's Decimal to a number by the API. */
	amount: number;
	/** YYYY-MM-DD. */
	expenseDate: string;
	status: "PENDING" | "PAID" | "CANCELLED";
	paymentMethod?: string | null;
	referenceNo?: string | null;
	payee?: string | null;
	billingPeriod?: string | null;
	attachmentUrl?: string | null;
	notes?: string | null;
	/**
	 * Where the row came from. INVENTORY rows are written when a purchase price
	 * is recorded against stock or an asset — the purchase there is the source
	 * of truth, so they are read-only here.
	 */
	source: "MANUAL" | "INVENTORY" | "PAYROLL";
	sourceType?: string | null;
	sourceId?: string | null;
	/** Server-computed: `source !== "MANUAL"`. Drives the read-only UI. */
	isLocked: boolean;
	createdAt: string;
	updatedAt: string;
};

export type ExpenseSummary = {
	month: string;
	totals: {
		month: number;
		previousMonth: number;
		/** null when the previous month was zero — not "infinite percent". */
		changePercent: number | null;
		yearToDate: number;
		entries: number;
		pending: number;
		pendingCount: number;
	};
	byCategory: {
		categoryId: string;
		name: string;
		recurrence: "RECURRING" | "ONE_OFF";
		total: number;
		count: number;
	}[];
	trend: { month: string; label: string; total: number }[];
};
