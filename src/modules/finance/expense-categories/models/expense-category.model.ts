export type ExpenseCategoryModel = {
	id: string;
	name: string;
	nameBn?: string | null;
	code: string;
	description?: string | null;
	recurrence: "RECURRING" | "ONE_OFF";
	interval?: "MONTHLY" | "QUARTERLY" | "HALF_YEARLY" | "YEARLY" | null;
	/**
	 * MANUAL categories are typed by a person. INVENTORY and PAYROLL categories
	 * are owned by their own subsystem — the UI must not offer them as a choice
	 * when someone records an expense by hand, or the spend is counted twice.
	 */
	source: "MANUAL" | "INVENTORY" | "PAYROLL";
	/** Seeded rows: deactivatable, never deletable. */
	isSystem: boolean;
	isActive: boolean;
	sortOrder: number;
	createdAt: string;
	updatedAt: string;
};

/** The shape `/finance/expense-categories/active-list` returns. */
export type ExpenseCategoryOption = {
	id: string;
	name: string;
	nameBn?: string | null;
	code: string;
	recurrence: "RECURRING" | "ONE_OFF";
	interval?: string | null;
};
