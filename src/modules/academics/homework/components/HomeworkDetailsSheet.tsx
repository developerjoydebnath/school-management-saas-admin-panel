"use client";

import { ZoomableImage } from "@/shared/components/media/ZoomableImage";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useTranslations } from "next-intl";
import {
	HomeworkStatusEnum,
	HomeworkSubmissionRecord,
	HomeworkSubmissionStatusEnum,
} from "../dto/homework.dto";
import { useHomework } from "../hooks/use-homeworks";
import { toAbsolute } from "./HomeworkAttachments";

type Props = {
	id: string;
	open: boolean;
};

function Item({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div>
			<p className="text-muted-foreground text-xs">{label}</p>
			<div className="text-sm">{value || "-"}</div>
		</div>
	);
}

const titleCase = (value: string) => value.charAt(0) + value.slice(1).toLowerCase();

const formatDate = (value?: string | null) =>
	value
		? new Date(value).toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			})
		: "-";

const statusVariant = (status: HomeworkStatusEnum) =>
	status === HomeworkStatusEnum.PUBLISHED
		? "default"
		: status === HomeworkStatusEnum.ARCHIVED
			? "outline"
			: "secondary";

const ordinal = (position: number) => {
	const mod100 = position % 100;
	if (mod100 >= 11 && mod100 <= 13) return `${position}th`;
	switch (position % 10) {
		case 1:
			return `${position}st`;
		case 2:
			return `${position}nd`;
		case 3:
			return `${position}rd`;
		default:
			return `${position}th`;
	}
};

/**
 * Competition ranking (1, 1, 3, 4 …): tied marks share the same merit position,
 * and the position right after a tie skips ahead by the tie's size — the same
 * convention Bangladeshi schools use for exam merit lists.
 */
function buildMeritPositions(
	submissions: HomeworkSubmissionRecord[]
): Record<string, number> {
	const ranked = submissions
		.filter((submission) => submission.obtainedMarks != null)
		.sort((a, b) => Number(b.obtainedMarks) - Number(a.obtainedMarks));

	const positions: Record<string, number> = {};
	let lastMarks: number | null = null;
	let lastPosition = 0;
	ranked.forEach((submission, index) => {
		const marks = Number(submission.obtainedMarks);
		if (lastMarks === null || marks !== lastMarks) {
			lastPosition = index + 1;
			lastMarks = marks;
		}
		positions[submission.id] = lastPosition;
	});
	return positions;
}

const submissionVariant = (status: HomeworkSubmissionStatusEnum) => {
	switch (status) {
		case HomeworkSubmissionStatusEnum.GRADED:
		case HomeworkSubmissionStatusEnum.SUBMITTED:
			return "default" as const;
		case HomeworkSubmissionStatusEnum.MISSING:
			return "destructive" as const;
		case HomeworkSubmissionStatusEnum.LATE:
			return "outline" as const;
		default:
			return "secondary" as const;
	}
};

export default function HomeworkDetailsSheet({ id, open }: Props) {
	const t = useTranslations("Homework");
	// Fetched by id rather than handed the list row: the list payload carries only
	// the summary, while this sheet shows instructions, images and every student.
	const { data, isLoading } = useHomework(open ? id : undefined);

	const attachments = data?.attachments || [];
	const submissions: HomeworkSubmissionRecord[] = data?.submissions || [];
	const summary = data?.submissionSummary;
	const graded = data?.totalMarks != null && data.totalMarks !== "";
	const percent =
		summary && summary.total > 0 ? Math.round((summary.submitted / summary.total) * 100) : 0;
	const meritPositions = buildMeritPositions(submissions);

	return (
		<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[64vw]">
			<SheetHeader className="border-b p-4">
				<SheetTitle className="text-base leading-6 font-normal">{t("detailsTitle")}</SheetTitle>
				<SheetDescription className="text-xs">{t("detailsDescription")}</SheetDescription>
			</SheetHeader>

			<ScrollArea className="h-[calc(100vh-73px)]">
				<div className="space-y-4 p-4">
					{isLoading || !data ? (
						<div className="space-y-3">
							<Skeleton className="h-40 w-full" />
							<Skeleton className="h-32 w-full" />
							<Skeleton className="h-32 w-full" />
						</div>
					) : (
						<>
							<section className="bg-card rounded-md border p-4">
								<div className="flex flex-wrap items-start justify-between gap-2">
									<div className="min-w-0">
										<h3 className="text-sm font-medium">{data.title}</h3>
										{data.titleBn ? (
											<p className="text-muted-foreground mt-0.5 text-xs">{data.titleBn}</p>
										) : null}
									</div>
									<div className="flex flex-wrap items-center gap-1.5">
										<Badge variant="secondary" className="font-normal">
											{titleCase(data.type)}
										</Badge>
										<Badge variant={statusVariant(data.status)} className="font-normal">
											{titleCase(data.status)}
										</Badge>
										{data.isOverdue ? (
											<Badge variant="destructive" className="font-normal">
												{t("overdue")}
											</Badge>
										) : null}
									</div>
								</div>

								<div className="mt-4 grid grid-cols-1 gap-3 @xl/body:grid-cols-3">
									<Item
										label={t("classSection")}
										value={`${data.class?.enName || "-"} / ${
											data.section?.name || t("allSections")
										}`}
									/>
									<Item label={t("subject")} value={data.subject?.enName} />
									<Item label={t("teacher")} value={data.teacher?.fullName} />
									<Item label={t("assignedDate")} value={formatDate(data.assignedDate)} />
									<Item label={t("dueDate")} value={formatDate(data.dueDate)} />
									{data.lessonPlan ? (
										<Item label={t("lesson")} value={data.lessonPlan.title} />
									) : null}
									<Item
										label={t("totalMarks")}
										value={
											graded ? (
												String(data.totalMarks)
											) : (
												<Badge variant="secondary" className="font-normal">
													{t("ungraded")}
												</Badge>
											)
										}
									/>
								</div>
							</section>

							<section className="bg-card rounded-md border p-4">
								<h3 className="text-sm font-normal">{t("instructions")}</h3>
								{data.instructions ? (
									/* Authored in the app's own rich-text editor. */
									<div
										className="prose prose-sm dark:prose-invert [&_th]:bg-muted/40 mt-3 max-w-none [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:p-1.5 [&_th]:border [&_th]:p-1.5"
										dangerouslySetInnerHTML={{ __html: data.instructions }}
									/>
								) : (
									<p className="text-muted-foreground mt-2 text-xs">{t("noInstructions")}</p>
								)}
							</section>

							{attachments.length ? (
								<section className="bg-card rounded-md border p-4">
									<h3 className="text-sm font-normal">{t("attachmentsSection")}</h3>
									<p className="text-muted-foreground mt-1 text-xs">
										{t("attachmentsViewHint")}
									</p>
									{/* Question sheets are usually photographed, so zoom/rotate matters
									    more here than a big thumbnail. */}
									<div className="mt-3 grid grid-cols-2 gap-3 @xl/body:grid-cols-4">
										{attachments.map((attachment, index) => (
											<div key={attachment.url} className="space-y-1">
												<ZoomableImage
													src={toAbsolute(attachment.url)}
													alt={attachment.name || `${t("attachmentsSection")} ${index + 1}`}
													className="bg-background aspect-[4/3] w-full rounded-md border"
													imageClassName="object-cover"
												/>
												{attachment.name ? (
													<p
														className="text-muted-foreground truncate text-[11px]"
														title={attachment.name}
													>
														{attachment.name}
													</p>
												) : null}
											</div>
										))}
									</div>
								</section>
							) : null}

							<section className="bg-card rounded-md border p-4">
								<h3 className="text-sm font-normal">{t("submissions")}</h3>
								{!summary || summary.total === 0 ? (
									<p className="text-muted-foreground mt-2 text-xs">
										{t("noSubmissionsYet")}
									</p>
								) : (
									<>
										<div className="mt-3 flex items-center justify-between text-xs tabular-nums">
											<span className="text-muted-foreground">
												{t("statusSubmitted")}: {summary.submitted}/{summary.total} ·{" "}
												{t("graded")}: {summary.graded}
											</span>
											<span>{percent}%</span>
										</div>
										<Progress value={percent} className="mt-2 h-2" />

										<div className="mt-4">
											<div className="bg-muted/40 text-muted-foreground grid grid-cols-[1fr_110px_70px_90px] gap-3 rounded-t-md px-3 py-2 text-xs font-medium">
												<span>{t("student")}</span>
												<span>{t("status")}</span>
												<span className="text-right">{t("marks")}</span>
												<span className="text-right">{t("meritPosition")}</span>
											</div>
											<div className="divide-y rounded-b-md border border-t-0">
												{submissions.map((submission) => {
													const position = meritPositions[submission.id];
													return (
														<div
															key={submission.id}
															className="grid grid-cols-[1fr_110px_70px_90px] items-center gap-3 px-3 py-2"
														>
															<div className="min-w-0">
																<p className="truncate text-sm">
																	{submission.student?.fullNameEn || "-"}
																</p>
																<p className="text-muted-foreground text-xs">
																	{submission.student?.rollNumber
																		? `Roll ${submission.student.rollNumber} · `
																		: ""}
																	{submission.student?.studentIdNo}
																</p>
															</div>
															<div>
																<Badge
																	variant={submissionVariant(submission.status)}
																	className="font-normal"
																>
																	{titleCase(submission.status)}
																</Badge>
															</div>
															<span className="text-right text-sm tabular-nums">
																{submission.obtainedMarks != null
																	? `${submission.obtainedMarks}${
																			graded ? `/${data.totalMarks}` : ""
																		}`
																	: "-"}
															</span>
															<span className="text-right text-sm tabular-nums">
																{position ? (
																	<Badge
																		variant={position === 1 ? "default" : "secondary"}
																		className="font-normal"
																	>
																		{ordinal(position)}
																	</Badge>
																) : (
																	"-"
																)}
															</span>
														</div>
													);
												})}
											</div>
										</div>
									</>
								)}
							</section>
						</>
					)}
				</div>
			</ScrollArea>
		</SheetContent>
	);
}
