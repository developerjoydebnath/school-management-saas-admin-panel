export type ProfitLossMonth = {
	/** YYYY-MM */
	month: string;
	/** Short display label, e.g. "Sep 26". */
	label: string;
	income: number;
	expense: number;
	/** The part of `expense` still marked PENDING. */
	unpaidExpense: number;
	net: number;
	cumulativeNet: number;
	/** null when nothing was collected that month — no meaningful margin. */
	marginPercent: number | null;
	incomeCount: number;
	expenseCount: number;
};

export type ProfitLossBreakdownRow = {
	key: string;
	label: string;
	labelBn?: string | null;
	recurrence?: "RECURRING" | "ONE_OFF";
	total: number;
	count: number;
	/** Percent of that side's total, to one decimal. */
	share: number;
};

export type ProfitLossStatement = {
	range: {
		from: string;
		to: string;
		months: number;
		sessionId: string | null;
	};
	totals: {
		income: number;
		expense: number;
		net: number;
		marginPercent: number | null;
		expenseRatio: number | null;
		averageMonthlyIncome: number;
		averageMonthlyExpense: number;
		previousIncome: number;
		previousExpense: number;
		previousNet: number;
		/** null when the comparison period was zero, never Infinity. */
		incomeChangePercent: number | null;
		expenseChangePercent: number | null;
		netChangePercent: number | null;
	};
	/** Deliberately outside the statement — balances, not period flows. */
	supplementary: {
		outstandingDues: number;
		outstandingCount: number;
		unpaidExpenses: number;
	};
	highlights: {
		bestMonth: { month: string; label: string; net: number } | null;
		worstMonth: { month: string; label: string; net: number } | null;
		surplusMonths: number;
		deficitMonths: number;
	};
	monthly: ProfitLossMonth[];
	incomeByHead: ProfitLossBreakdownRow[];
	expenseByCategory: ProfitLossBreakdownRow[];
};
