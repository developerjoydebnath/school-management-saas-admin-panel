"use client";

import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/lib/utils";
import { AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatDate } from "../../shared/dto/library.dto";
import LoanActions from "./LoanActions";

/**
 * The books this borrower already has, with a Return button on each.
 *
 * Sits directly under the card because the other half of a library period is
 * children handing books back, and making the librarian navigate to a separate
 * screen to do it would double the queue.
 */
export default function OpenLoansPanel({
	loans,
	onChanged,
}: {
	loans: any[];
	onChanged?: () => void;
}) {
	const t = useTranslations("LibraryCirculation");

	return (
		<div className="space-y-2">
			{loans.map((loan) => (
				<div
					key={loan.id}
					className={cn(
						"flex flex-wrap items-center justify-between gap-3 rounded-md border p-3",
						loan.isOverdue &&
							"border-amber-300 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20",
					)}
				>
					<div className="min-w-0 flex-1 space-y-0.5">
						<p className="truncate text-sm font-medium">{loan.book?.title}</p>
						<div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs">
							<span className="font-mono">{loan.accessionNo}</span>
							<span>{t("dueOn", { date: formatDate(loan.dueDate) })}</span>
							{loan.renewCount > 0 && (
								<span>{t("renewedTimes", { count: loan.renewCount })}</span>
							)}
						</div>
						{loan.isOverdue && (
							<Badge className="border-transparent bg-amber-100 text-[10px] font-normal text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
								<AlertTriangle className="mr-1 size-3" />
								{t("overdueBy", { days: loan.daysOverdue })}
							</Badge>
						)}
					</div>
					<LoanActions loan={loan} onChanged={onChanged} />
				</div>
			))}
		</div>
	);
}
