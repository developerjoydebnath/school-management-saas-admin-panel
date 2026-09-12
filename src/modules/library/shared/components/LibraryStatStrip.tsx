"use client";

import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import type { LucideIcon } from "lucide-react";

export type LibraryStat = {
	label: string;
	value: string | number;
	icon?: LucideIcon;
	/** Use for the one number that means "something needs attention". */
	tone?: "default" | "good" | "warning" | "critical";
	hint?: string;
};

const toneClasses: Record<string, string> = {
	default: "",
	good: "text-emerald-600 dark:text-emerald-400",
	warning: "text-amber-600 dark:text-amber-400",
	critical: "text-red-600 dark:text-red-400",
};

/**
 * The row of numbers above every library list.
 *
 * Deliberately plain: the value is the largest thing on the card, and the only
 * colour is on the one stat that is asking for action (overdue books, pending
 * fines). Colouring all of them would mean none of them stands out.
 */
export default function LibraryStatStrip({
	stats,
	isLoading,
	columns = 4,
}: {
	stats: LibraryStat[];
	isLoading?: boolean;
	columns?: 3 | 4 | 5;
}) {
	const gridClass = cn(
		"grid grid-cols-2 gap-3",
		columns === 3 && "@2xl/page:grid-cols-3",
		columns === 4 && "@2xl/page:grid-cols-4",
		columns === 5 && "@2xl/page:grid-cols-3 @4xl/page:grid-cols-5",
	);

	if (isLoading) {
		return (
			<div className={gridClass}>
				{Array.from({ length: columns }).map((_, index) => (
					<Skeleton key={index} className="h-20 rounded-md" />
				))}
			</div>
		);
	}

	return (
		<div className={gridClass}>
			{stats.map((stat) => {
				const Icon = stat.icon;
				return (
					<div
						key={stat.label}
						className="bg-card/70 border-border/70 flex min-h-20 items-start justify-between gap-3 rounded-md border p-4"
					>
						<div className="min-w-0 space-y-1">
							<p className="text-muted-foreground truncate text-sm">
								{stat.label}
							</p>
							<p
								className={cn(
									"text-2xl font-semibold tabular-nums",
									toneClasses[stat.tone || "default"],
								)}
							>
								{stat.value}
							</p>
							{stat.hint && (
								<p className="text-muted-foreground text-xs">{stat.hint}</p>
							)}
						</div>
						{Icon && <Icon className="text-muted-foreground size-4 shrink-0" />}
					</div>
				);
			})}
		</div>
	);
}
