/** Shared formatting so the cards, chart, breakdowns and table never disagree
 * about how a taka figure is written. */

export function formatMoney(value: unknown, fractionDigits = 0) {
	const amount = Number(value || 0);
	if (!Number.isFinite(amount)) return "0";
	return amount.toLocaleString(undefined, {
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits,
	});
}

export function formatTaka(value: unknown, fractionDigits = 0) {
	return `BDT ${formatMoney(value, fractionDigits)}`;
}

/** Axis ticks: 1,25,000 is unreadable on a 12-bar chart, 1.3L is not. */
export function compactTaka(value: number) {
	const amount = Number(value || 0);
	const sign = amount < 0 ? "-" : "";
	const abs = Math.abs(amount);
	if (abs >= 10_000_000) return `${sign}${(abs / 10_000_000).toFixed(1)}Cr`;
	if (abs >= 100_000) return `${sign}${(abs / 100_000).toFixed(1)}L`;
	if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}k`;
	return `${sign}${abs}`;
}

export function formatPercent(value: number | null | undefined) {
	if (value === null || value === undefined) return "—";
	return `${value > 0 ? "+" : ""}${value}%`;
}

/** A month label for a `YYYY-MM` key, without going through a local Date. */
export function monthLabel(month: string) {
	if (!/^\d{4}-\d{2}$/.test(month)) return month;
	return new Date(`${month}-01T00:00:00.000Z`).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	});
}
