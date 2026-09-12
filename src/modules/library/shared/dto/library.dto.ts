/**
 * The vocabulary the whole Library module shares.
 *
 * Option lists carry only values and translation keys — the visible label is
 * resolved through next-intl at the call site, so the same list works in both
 * locales. Keys are nested under `statusValue` / `reasonValue` style namespaces
 * and never share a name with a flat label key: a next-intl key cannot be both
 * a string and a namespace, which is the `INSUFFICIENT_PATH` failure.
 */

export const COPY_STATUSES = [
	"AVAILABLE",
	"ISSUED",
	"LOST",
	"DAMAGED",
	"UNDER_REPAIR",
	"WITHDRAWN",
] as const;
export type CopyStatus = (typeof COPY_STATUSES)[number];

export const LOAN_STATUSES = ["ISSUED", "RETURNED", "LOST", "CANCELLED"] as const;
export type LoanStatus = (typeof LOAN_STATUSES)[number];

export const FINE_REASONS = ["OVERDUE", "DAMAGE", "LOST", "OTHER"] as const;
export type FineReason = (typeof FINE_REASONS)[number];

export const FINE_STATUSES = ["PENDING", "PAID", "WAIVED"] as const;
export type FineStatus = (typeof FINE_STATUSES)[number];

export const ACQUISITION_SOURCES = [
	"PURCHASE",
	"DONATION",
	"GOVERNMENT",
	"EXCHANGE",
	"OTHER",
] as const;
export type AcquisitionSource = (typeof ACQUISITION_SOURCES)[number];

export const BOOK_CONDITIONS = ["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"] as const;
export type BookCondition = (typeof BOOK_CONDITIONS)[number];

export const BORROWER_TYPES = ["student", "teacher", "staff"] as const;
export type BorrowerType = (typeof BORROWER_TYPES)[number];

export const PAYMENT_METHODS = [
	"cash",
	"bank",
	"mobile_banking",
	"cheque",
	"other",
] as const;

/** BD school collections are overwhelmingly Bangla, with an English section. */
export const LANGUAGES = [
	{ value: "bn", labelKey: "bangla" },
	{ value: "en", labelKey: "english" },
	{ value: "ar", labelKey: "arabic" },
	{ value: "other", labelKey: "otherLanguage" },
] as const;

/**
 * A copy's status, coloured by what it means for the shelf.
 *
 * Green is on the shelf, blue is legitimately out, amber needs attention and
 * red is gone. Withdrawn is deliberately grey: it is not a problem, it is a
 * closed register line.
 */
export const copyStatusColors: Record<string, string> = {
	AVAILABLE:
		"bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
	ISSUED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
	LOST: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
	DAMAGED: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
	UNDER_REPAIR:
		"bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
	WITHDRAWN: "bg-muted text-muted-foreground",
};

export const loanStatusColors: Record<string, string> = {
	ISSUED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
	RETURNED:
		"bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
	LOST: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
	CANCELLED: "bg-muted text-muted-foreground",
};

export const fineStatusColors: Record<string, string> = {
	PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
	PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
	WAIVED: "bg-muted text-muted-foreground",
};

export const borrowerTypeColors: Record<string, string> = {
	student: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
	teacher:
		"bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
	staff: "bg-slate-100 text-slate-800 dark:bg-slate-800/60 dark:text-slate-300",
};

/** Taka, always two decimals — these numbers end up on receipts. */
export function formatMoney(value: unknown) {
	const amount = Number(value || 0);
	return Number.isFinite(amount)
		? amount.toLocaleString(undefined, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			})
		: "0.00";
}

export function formatDate(value?: string | Date | null) {
	if (!value) return "—";
	const date = typeof value === "string" ? new Date(value) : value;
	if (Number.isNaN(date.getTime())) return "—";
	return date.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}

/**
 * The typed library-card code.
 *
 * `employeeCode` is not unique and lives in two tables, so a bare code cannot
 * name a person; the printed card carries the prefix and the desk resolves the
 * type from it. Kept in sync with the server's CARD_PREFIX map.
 */
export const CARD_PREFIX_BY_TYPE: Record<BorrowerType, string> = {
	student: "S",
	teacher: "T",
	staff: "F",
};

export function buildCardCode(type: BorrowerType, code?: string | null) {
	return `${CARD_PREFIX_BY_TYPE[type]}:${code || ""}`;
}
