"use client";

import { Card, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useState } from "react";
import { useProfitLoss } from "../hooks/use-profit-loss";
import ProfitLossBreakdown from "./ProfitLossBreakdown";
import ProfitLossChart from "./ProfitLossChart";
import ProfitLossFilterBar, {
	ProfitLossFilter,
	resolvePreset,
} from "./ProfitLossFilterBar";
import ProfitLossSummary from "./ProfitLossSummary";
import ProfitLossTable from "./ProfitLossTable";

const initialFilter: ProfitLossFilter = {
	...resolvePreset("last_12_months"),
};

function StatementSkeleton() {
	return (
		<div className="space-y-4">
			<div className="grid gap-3 @2xl/page:grid-cols-2 @5xl/page:grid-cols-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<Skeleton key={index} className="h-28 rounded-md" />
				))}
			</div>
			<Skeleton className="h-[360px] rounded-md" />
			<div className="grid gap-4 @4xl/page:grid-cols-2">
				<Skeleton className="h-[260px] rounded-md" />
				<Skeleton className="h-[260px] rounded-md" />
			</div>
			<Skeleton className="h-[320px] rounded-md" />
		</div>
	);
}

export default function ProfitLossView() {
	const [filter, setFilter] = useState<ProfitLossFilter>(initialFilter);
	const { statement, isLoading } = useProfitLoss(filter);

	return (
		<div className="space-y-4">
			<Card className="p-6 shadow-none ring-0">
				<CardHeader className="p-0">
					<ProfitLossFilterBar filter={filter} setFilter={setFilter} />
				</CardHeader>
			</Card>

			{isLoading || !statement ? (
				<StatementSkeleton />
			) : (
				<div className="space-y-4">
					<ProfitLossSummary statement={statement} />
					<ProfitLossChart statement={statement} />
					<ProfitLossBreakdown
						incomeByHead={statement.incomeByHead}
						expenseByCategory={statement.expenseByCategory}
					/>
					<ProfitLossTable statement={statement} />
				</div>
			)}
		</div>
	);
}
