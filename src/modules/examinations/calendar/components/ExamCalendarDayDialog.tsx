"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";
import { Clock, GraduationCap, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import {
	EXAM_TYPE_FALLBACK,
	ExamPaper,
	examTypeColors,
	paperStatusColors,
	paperTimeRange,
} from "../dto/exam-calendar.dto";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** The clicked day, as YYYY-MM-DD. */
	date: string | null;
	papers: ExamPaper[];
};

/**
 * Read-only detail for one day of the exam routine.
 *
 * Grouped by exam, because a day in exam week routinely holds the same subject
 * sitting for three classes at different times — a flat list reads as
 * duplicates, while "Half Yearly → Class 9 Physics, Class 10 Physics" reads as
 * the schedule it is.
 *
 * Deliberately has no actions: scheduling belongs to the Schedule and Routine
 * modules, and editing the routine from a calendar nobody expects to be
 * editable is how a paper silently moves.
 */
export default function ExamCalendarDayDialog({ open, onOpenChange, date, papers }: Props) {
	const t = useTranslations("ExamCalendar");
	const locale = useLocale();

	const grouped = useMemo(() => {
		const byExam = new Map<string, { exam: ExamPaper["exam"]; papers: ExamPaper[] }>();
		papers.forEach((paper) => {
			const entry = byExam.get(paper.examId) || { exam: paper.exam, papers: [] };
			entry.papers.push(paper);
			byExam.set(paper.examId, entry);
		});
		return Array.from(byExam.values()).map((entry) => ({
			...entry,
			// Undated-time papers sort last rather than jumping to the top, which
			// is what an empty string would do against "09:00".
			papers: [...entry.papers].sort((a, b) =>
				(a.startTime || "99:99").localeCompare(b.startTime || "99:99")
			),
		}));
	}, [papers]);

	if (!date) return null;

	const heading = new Intl.DateTimeFormat(locale, {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	}).format(new Date(`${date}T00:00:00.000Z`));

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
				<DialogHeader className="shrink-0 border-b px-6 py-5">
					<DialogTitle>{heading}</DialogTitle>
					<DialogDescription>
						{t("dayDialogCount", { count: papers.length })}
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
					{grouped.map(({ exam, papers: examPapers }) => {
						const colors = examTypeColors[exam.type] || EXAM_TYPE_FALLBACK;
						return (
							<div key={exam.id} className="space-y-2">
								<div className="flex items-center gap-2">
									<span className={cn("size-2.5 shrink-0 rounded-full", colors.dot)} />
									<span className="truncate text-sm font-medium">{exam.name}</span>
									<Badge variant="outline" className="shrink-0 text-[10px] font-normal">
										{t(`type.${exam.type}`)}
									</Badge>
								</div>

								<div className="space-y-2 pl-4">
									{examPapers.map((paper) => {
										const status = paperStatusColors[paper.status];
										const time = paperTimeRange(paper.startTime, paper.durationMins);
										return (
											<div
												key={paper.id}
												className={cn(
													"rounded-md border p-3",
													paper.status === "CANCELLED" && "opacity-60"
												)}
											>
												<div className="flex items-start justify-between gap-2">
													<span
														className={cn(
															"truncate text-sm font-medium",
															paper.status === "CANCELLED" && "line-through"
														)}
													>
														{paper.subject.enName}
														{paper.subject.code ? (
															<span className="text-muted-foreground font-normal">
																{" "}
																({paper.subject.code})
															</span>
														) : null}
													</span>
													<Badge
														className={cn(
															"shrink-0 border-transparent font-normal",
															status?.bg,
															status?.text
														)}
													>
														{t(`paperStatus.${paper.status}`)}
													</Badge>
												</div>
												<div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
													<span className="flex items-center gap-1">
														<GraduationCap className="size-3" />
														{paper.class.enName}
													</span>
													{time ? (
														<span className="flex items-center gap-1">
															<Clock className="size-3" />
															{time}
														</span>
													) : (
														<span>{t("timeNotSet")}</span>
													)}
													{paper.classRoom ? (
														<span className="flex items-center gap-1">
															<MapPin className="size-3" />
															{paper.classRoom.roomNo || paper.classRoom.name}
														</span>
													) : null}
													<span>{t("marks", { total: paper.totalMarks })}</span>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>

				<DialogFooter className="shrink-0 border-t px-6 py-4">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{t("close")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
