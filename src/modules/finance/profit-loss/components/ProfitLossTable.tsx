"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { ProfitLossStatement } from "../models/profit-loss.model";
import { formatMoney, monthLabel } from "./profit-loss.utils";

/**
 * The month-by-month statement, laid out the way a managing committee reads it:
 * one row per month, income and expenditure side by side, the surplus or
 * deficit, and the running balance carried down the page.
 *
 * A hand-built table rather than DataTable — this is a fixed statement with a
 * totals row, not a paginated, filterable list of records.
 */
export default function ProfitLossTable({
	statement,
}: {
	statement: ProfitLossStatement;
}) {
	const t = useTranslations("ProfitLoss");
	const { monthly, totals } = statement;

	// Newest first — the month someone opens this page to check is the one they
	// are living in. The running balance is still the chronological carry-forward
	// computed server-side, so each row reads "the balance as at that month"; it
	// simply descends down the page instead of accumulating down it.
	const rows = useMemo(() => [...monthly].reverse(), [monthly]);

	return (
		<Card className="bg-card/70 border-border/70 rounded-md">
			<CardHeader className="pb-3">
				<CardTitle className="text-base">{t("tableTitle")}</CardTitle>
				<p className="text-muted-foreground text-xs">{t("tableDescription")}</p>
			</CardHeader>
			<CardContent>
				{/* The table scrolls inside its own box so the page body never
				    scrolls sideways on a phone. */}
				<div className="border-border/70 overflow-x-auto rounded-md border">
					<table className="w-full min-w-180 border-collapse text-sm">
						<thead>
							<tr className="bg-muted/50 text-muted-foreground text-left">
								<th className="px-4 py-2.5 font-medium">{t("colMonth")}</th>
								<th className="px-4 py-2.5 text-right font-medium">{t("colIncome")}</th>
								<th className="px-4 py-2.5 text-right font-medium">{t("colExpense")}</th>
								<th className="px-4 py-2.5 text-right font-medium">{t("colNet")}</th>
								<th className="px-4 py-2.5 text-right font-medium">{t("colMargin")}</th>
								<th className="px-4 py-2.5 text-right font-medium">{t("colRunning")}</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((row) => {
								const isEmpty = row.income === 0 && row.expense === 0;
								return (
									<tr
										key={row.month}
										className={cn(
											"border-border/60 border-t",
											// A month with no activity is dimmed rather than hidden:
											// the gap in the series is itself information.
											isEmpty && "text-muted-foreground"
										)}
									>
										<td className="px-4 py-2.5">
											<div className="flex items-center gap-2">
												<span className="font-medium whitespace-nowrap">
													{monthLabel(row.month)}
												</span>
												{row.unpaidExpense > 0 && (
													<Badge variant="outline" className="text-[10px] whitespace-nowrap">
														{t("unpaidBadge", { amount: formatMoney(row.unpaidExpense) })}
													</Badge>
												)}
											</div>
										</td>
										<td className="px-4 py-2.5 text-right tabular-nums">
											{formatMoney(row.income)}
										</td>
										<td className="px-4 py-2.5 text-right tabular-nums">
											{formatMoney(row.expense)}
										</td>
										<td
											className={cn(
												"px-4 py-2.5 text-right font-medium tabular-nums",
												!isEmpty && row.net > 0 && "text-emerald-600",
												!isEmpty && row.net < 0 && "text-rose-600"
											)}
										>
											{formatMoney(row.net)}
										</td>
										<td className="px-4 py-2.5 text-right tabular-nums">
											{row.marginPercent === null ? "—" : `${row.marginPercent}%`}
										</td>
										<td
											className={cn(
												"px-4 py-2.5 text-right tabular-nums",
												row.cumulativeNet < 0 && "text-rose-600"
											)}
										>
											{formatMoney(row.cumulativeNet)}
										</td>
									</tr>
								);
							})}
						</tbody>
						<tfoot>
							<tr className="bg-muted/50 border-border border-t-2 font-semibold">
								<td className="px-4 py-3">{t("colTotal")}</td>
								<td className="px-4 py-3 text-right tabular-nums">
									{formatMoney(totals.income)}
								</td>
								<td className="px-4 py-3 text-right tabular-nums">
									{formatMoney(totals.expense)}
								</td>
								<td
									className={cn(
										"px-4 py-3 text-right tabular-nums",
										totals.net > 0 && "text-emerald-600",
										totals.net < 0 && "text-rose-600"
									)}
								>
									{formatMoney(totals.net)}
								</td>
								<td className="px-4 py-3 text-right tabular-nums">
									{totals.marginPercent === null ? "—" : `${totals.marginPercent}%`}
								</td>
								<td className="text-muted-foreground px-4 py-3 text-right text-xs font-normal">
									{t("allAmountsBdt")}
								</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</CardContent>
		</Card>
	);
}
