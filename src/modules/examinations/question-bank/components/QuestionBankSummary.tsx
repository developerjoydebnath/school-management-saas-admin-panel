"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";
import { CheckCircle2, FileText, Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import {
	difficultyColors,
	questionTypeColors,
} from "../dto/question-bank.dto";
import { QuestionBankSummary as Summary } from "../hooks/use-question-bank";

type Props = { summary?: Summary };

function StatCard({
	label,
	value,
	icon: Icon,
}: {
	label: string;
	value: number;
	icon: typeof FileText;
}) {
	return (
		<div className="bg-card/70 border-border/70 flex min-h-20 items-start justify-between gap-3 rounded-md border p-4">
			<div className="space-y-1.5">
				<p className="text-muted-foreground text-sm">{label}</p>
				<p className="text-2xl font-semibold tabular-nums">{value}</p>
			</div>
			<Icon className="text-muted-foreground size-4 shrink-0" />
		</div>
	);
}

/**
 * What the bank actually holds for the current class/subject.
 *
 * The question a head of department asks before writing a paper is "do I have
 * enough of each type, and is the difficulty spread sane?" — so the breakdown
 * is the point here, not the headline total.
 */
export default function QuestionBankSummary({ summary }: Props) {
	const t = useTranslations("QuestionBank");

	if (!summary) {
		return (
			<div className="grid gap-3 @2xl/page:grid-cols-3">
				{Array.from({ length: 3 }).map((_, index) => (
					<Skeleton key={index} className="h-20 rounded-md" />
				))}
			</div>
		);
	}

	const largestType = Math.max(...summary.byType.map((row) => row.count), 1);

	return (
		<div className="space-y-4">
			<div className="grid gap-3 @2xl/page:grid-cols-3">
				<StatCard label={t("totalQuestions")} value={summary.total} icon={FileText} />
				<StatCard label={t("publishedQuestions")} value={summary.published} icon={CheckCircle2} />
				<StatCard label={t("draftQuestions")} value={summary.draft} icon={Layers} />
			</div>

			{summary.total > 0 && (
				<div className="grid gap-4 @4xl/page:grid-cols-2">
					<Card className="bg-card/70 border-border/70 rounded-md">
						<CardHeader className="pb-3">
							<CardTitle className="text-base">{t("byTypeTitle")}</CardTitle>
							<p className="text-muted-foreground text-xs">{t("byTypeDescription")}</p>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2.5">
								{summary.byType.map((row) => {
									const colors = questionTypeColors[row.type];
									return (
										<li key={row.type} className="space-y-1.5">
											<div className="flex min-w-0 items-center justify-between gap-2">
												<span className="min-w-0 truncate text-sm">
													{t(`typeValue.${row.type}`)}
												</span>
												<span className="shrink-0 text-sm tabular-nums">{row.count}</span>
											</div>
											<div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
												<div
													className={cn("h-full rounded-full", colors?.bg || "bg-muted")}
													style={{
														width: `${Math.max((row.count / largestType) * 100, 2)}%`,
													}}
												/>
											</div>
										</li>
									);
								})}
							</ul>
						</CardContent>
					</Card>

					<Card className="bg-card/70 border-border/70 rounded-md">
						<CardHeader className="pb-3">
							<CardTitle className="text-base">{t("byDifficultyTitle")}</CardTitle>
							<p className="text-muted-foreground text-xs">
								{t("byDifficultyDescription")}
							</p>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2.5">
								{summary.byDifficulty.map((row) => {
									const colors = difficultyColors[row.difficulty];
									const share = summary.total
										? Math.round((row.count / summary.total) * 100)
										: 0;
									return (
										<li key={row.difficulty} className="space-y-1.5">
											<div className="flex min-w-0 items-center justify-between gap-2">
												<span className="min-w-0 truncate text-sm">
													{t(`difficultyValue.${row.difficulty}`)}
												</span>
												<span className="shrink-0 text-sm tabular-nums">
													{row.count}
													<span className="text-muted-foreground ml-1.5 text-xs">
														{share}%
													</span>
												</span>
											</div>
											<div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
												<div
													className={cn("h-full rounded-full", colors?.bg || "bg-muted")}
													style={{ width: `${Math.max(share, 2)}%` }}
												/>
											</div>
										</li>
									);
								})}
							</ul>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
