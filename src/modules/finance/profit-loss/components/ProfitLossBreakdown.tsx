"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";
import { ProfitLossBreakdownRow } from "../models/profit-loss.model";
import { formatTaka } from "./profit-loss.utils";

/**
 * Ranked bars, not a pie. Both sides routinely run past a dozen heads, and a
 * reader can compare bar lengths at a glance where they cannot compare wedge
 * angles. The bar is scaled to the largest row so the top item fills the track.
 */
function BreakdownPanel({
	title,
	description,
	rows,
	tone,
	emptyLabel,
	showRecurrence = false,
}: {
	title: string;
	description: string;
	rows: ProfitLossBreakdownRow[];
	tone: "income" | "expense";
	emptyLabel: string;
	showRecurrence?: boolean;
}) {
	const t = useTranslations("ProfitLoss");
	const largest = rows[0]?.total || 0;

	return (
		<Card className="bg-card/70 border-border/70 rounded-md">
			<CardHeader className="pb-3">
				<CardTitle className="text-base">{title}</CardTitle>
				<p className="text-muted-foreground text-xs">{description}</p>
			</CardHeader>
			<CardContent>
				{rows.length ? (
					<ul className="space-y-3">
						{rows.map((row) => (
							<li key={row.key} className="space-y-1.5">
								<div className="flex items-center justify-between gap-2">
									<div className="flex min-w-0 items-center gap-2">
										<span className="truncate text-sm font-medium">{row.label}</span>
										{showRecurrence && row.recurrence === "RECURRING" && (
											<Badge variant="outline" className="shrink-0 text-[10px]">
												{t("recurring")}
											</Badge>
										)}
									</div>
									<div className="flex shrink-0 items-baseline gap-2">
										<span className="text-sm tabular-nums">{formatTaka(row.total)}</span>
										<span className="text-muted-foreground w-11 text-right text-xs tabular-nums">
											{row.share}%
										</span>
									</div>
								</div>
								<div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
									<div
										className={cn(
											"h-full rounded-full",
											tone === "income" ? "bg-emerald-500/70" : "bg-rose-500/70"
										)}
										style={{
											width: `${largest ? Math.max((row.total / largest) * 100, 2) : 0}%`,
										}}
									/>
								</div>
							</li>
						))}
					</ul>
				) : (
					<div className="border-border/70 flex h-[180px] items-center justify-center rounded-md border border-dashed">
						<p className="text-muted-foreground text-sm">{emptyLabel}</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export default function ProfitLossBreakdown({
	incomeByHead,
	expenseByCategory,
}: {
	incomeByHead: ProfitLossBreakdownRow[];
	expenseByCategory: ProfitLossBreakdownRow[];
}) {
	const t = useTranslations("ProfitLoss");

	return (
		<div className="grid gap-4 @4xl/page:grid-cols-2">
			<BreakdownPanel
				title={t("incomeHeadsTitle")}
				description={t("incomeHeadsDescription")}
				rows={incomeByHead}
				tone="income"
				emptyLabel={t("noIncomeInPeriod")}
			/>
			<BreakdownPanel
				title={t("expenseHeadsTitle")}
				description={t("expenseHeadsDescription")}
				rows={expenseByCategory}
				tone="expense"
				emptyLabel={t("noExpenseInPeriod")}
				showRecurrence
			/>
		</div>
	);
}
