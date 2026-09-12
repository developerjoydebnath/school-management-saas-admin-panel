"use client";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import {
	ArrowDownRight,
	ArrowUpRight,
	Banknote,
	CircleAlert,
	Scale,
	TrendingDown,
	TrendingUp,
	Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { ProfitLossStatement } from "../models/profit-loss.model";
import { formatPercent, formatTaka } from "./profit-loss.utils";

type Tone = "income" | "expense" | "surplus" | "deficit" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
	income: "border-emerald-500/40 bg-emerald-500/10",
	expense: "border-rose-500/40 bg-rose-500/10",
	surplus: "border-emerald-500/40 bg-emerald-500/10",
	deficit: "border-rose-500/40 bg-rose-500/10",
	neutral: "",
};

function StatCard({
	label,
	value,
	hint,
	change,
	changeLabel,
	icon: Icon,
	tone = "neutral",
	/** For expenses, spending more is the bad direction — so the arrow's colour
	 * cannot be derived from the sign alone. */
	upIsGood = true,
}: {
	label: string;
	value: string;
	hint?: React.ReactNode;
	change?: number | null;
	changeLabel?: string;
	icon: typeof Wallet;
	tone?: Tone;
	upIsGood?: boolean;
}) {
	const hasChange = change !== null && change !== undefined;
	const isUp = hasChange && change > 0;
	const isGood = isUp === upIsGood;
	const ChangeIcon = isUp ? ArrowUpRight : ArrowDownRight;

	return (
		<div
			className={cn(
				"bg-card/70 border-border/70 flex min-h-28 flex-col justify-between gap-2 rounded-md border p-4",
				TONE_CLASS[tone]
			)}
		>
			<div className="flex items-start justify-between gap-3">
				<p className="text-muted-foreground text-sm">{label}</p>
				<Icon className="text-muted-foreground size-4 shrink-0" />
			</div>
			<p className="text-2xl font-semibold tabular-nums">{value}</p>
			{hasChange ? (
				<span
					className={cn(
						"flex items-center gap-1 text-xs",
						change === 0
							? "text-muted-foreground"
							: isGood
								? "text-emerald-600"
								: "text-rose-600"
					)}
				>
					<ChangeIcon className="size-3" />
					{formatPercent(change)} {changeLabel}
				</span>
			) : (
				hint || <span className="text-muted-foreground text-xs">&nbsp;</span>
			)}
		</div>
	);
}

export default function ProfitLossSummary({
	statement,
}: {
	statement: ProfitLossStatement;
}) {
	const t = useTranslations("ProfitLoss");
	const { totals, supplementary, highlights } = statement;
	const isSurplus = totals.net >= 0;

	return (
		<div className="space-y-3">
			<div className="grid gap-3 @2xl/page:grid-cols-2 @5xl/page:grid-cols-4">
				<StatCard
					label={t("totalIncome")}
					value={formatTaka(totals.income)}
					icon={Banknote}
					tone="income"
					change={totals.incomeChangePercent}
					changeLabel={t("vsPreviousPeriod")}
				/>
				<StatCard
					label={t("totalExpense")}
					value={formatTaka(totals.expense)}
					icon={Wallet}
					tone="expense"
					change={totals.expenseChangePercent}
					changeLabel={t("vsPreviousPeriod")}
					upIsGood={false}
				/>
				<StatCard
					label={isSurplus ? t("netSurplus") : t("netDeficit")}
					value={formatTaka(totals.net)}
					icon={isSurplus ? TrendingUp : TrendingDown}
					tone={isSurplus ? "surplus" : "deficit"}
					change={totals.netChangePercent}
					changeLabel={t("vsPreviousPeriod")}
				/>
				<StatCard
					label={t("margin")}
					value={totals.marginPercent === null ? "—" : `${totals.marginPercent}%`}
					icon={Scale}
					hint={
						<span className="text-muted-foreground text-xs">
							{totals.expenseRatio === null
								? t("noIncomeYet")
								: t("expenseRatioHint", { value: totals.expenseRatio })}
						</span>
					}
				/>
			</div>

			<div className="border-border/70 bg-muted/30 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-md border border-dashed px-4 py-3">
				<span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
					<CircleAlert className="size-3.5" />
					{t("notInStatement")}
				</span>
				<span className="text-sm">
					{t("outstandingDues")}:{" "}
					<span className="font-semibold tabular-nums">
						{formatTaka(supplementary.outstandingDues)}
					</span>
					<span className="text-muted-foreground ml-1 text-xs">
						({supplementary.outstandingCount})
					</span>
				</span>
				<span className="text-sm">
					{t("unpaidBills")}:{" "}
					<span className="font-semibold tabular-nums">
						{formatTaka(supplementary.unpaidExpenses)}
					</span>
				</span>
				<span className="ml-auto flex flex-wrap items-center gap-2">
					<Badge variant="outline" className="gap-1">
						<TrendingUp className="size-3 text-emerald-600" />
						{highlights.surplusMonths} {t("surplusMonths")}
					</Badge>
					<Badge variant="outline" className="gap-1">
						<TrendingDown className="size-3 text-rose-600" />
						{highlights.deficitMonths} {t("deficitMonths")}
					</Badge>
				</span>
			</div>
		</div>
	);
}
