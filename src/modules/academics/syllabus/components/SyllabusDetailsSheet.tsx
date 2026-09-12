"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/shared/components/ui/accordion";
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
import { useSyllabus } from "../hooks/use-syllabus";

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

const percent = (value: unknown) => Number(value || 0).toFixed(0);

export function SyllabusDetailsSheet({ id, open }: Props) {
	const t = useTranslations("Syllabus");
	const { data, isLoading } = useSyllabus(open ? id : undefined);

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
							<Skeleton className="h-24 w-full" />
							<Skeleton className="h-40 w-full" />
						</div>
					) : (
						<>
							<section className="rounded-md border bg-card p-4">
								<h3 className="text-sm font-normal">{t("syllabusInformation")}</h3>
								<p className="text-muted-foreground mt-1 text-xs">
									{t("syllabusInformationDescription")}
								</p>
								<div className="mt-3 grid grid-cols-1 gap-3 @xl/body:grid-cols-2">
									<Item label="Title" value={data.title} />
									<Item label="Exam" value={data.exam?.name} />
									<Item label="Class" value={data.class?.enName} />
									<Item label="Section" value={data.section?.name || "-"} />
									<Item label="Status" value={data.status} />
									<Item
										label="Progress"
										value={
											data.mode === "MANUAL" ? "-" : `${percent(data.completionPercent)}%`
										}
									/>
								</div>
								{data.mode === "MANUAL" ? null : (
									<Progress
										value={Number(data.completionPercent || 0)}
										className="mt-4 h-2"
									/>
								)}
							</section>
							{data.mode === "MANUAL" ? (
								<section className="bg-card rounded-md border p-4">
									<h3 className="text-sm font-normal">{t("syllabusDocument")}</h3>
									<p className="text-muted-foreground mt-1 text-xs">
										{t("syllabusDocumentDescription")}
									</p>
									{/* Authored in the app's own rich-text editor. */}
									<div
										className="prose prose-sm dark:prose-invert mt-3 max-w-none [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:p-1.5 [&_th]:border [&_th]:bg-muted/40 [&_th]:p-1.5"
										dangerouslySetInnerHTML={{ __html: data.content || "" }}
									/>
								</section>
							) : (
							<section className="rounded-md border bg-card p-4">
								<h3 className="text-sm font-normal">{t("subjectPlan")}</h3>
								<p className="text-muted-foreground mt-1 text-xs">
									{t("subjectPlanDescription")}
								</p>
								{/* One collapsible panel per subject. A published syllabus can carry
								    a dozen subjects with 20+ chapters each, so keeping every subject
								    collapsed by default makes the subject list itself scannable. */}
								<Accordion type="multiple" className="mt-3 gap-3">
									{data.subjects?.map((subject: any) => (
										<AccordionItem
											key={subject.id}
											value={subject.id}
											className="rounded-md border px-3"
										>
											<AccordionTrigger className="py-3 hover:no-underline">
												<div className="flex min-w-0 flex-1 flex-col gap-2 pr-3">
													<div className="flex items-center justify-between gap-3">
														<span className="flex min-w-0 items-center gap-2">
															<span className="truncate text-sm font-medium">
																{subject.subject?.enName}
															</span>
															<Badge
																variant="secondary"
																className="h-5 shrink-0 px-1.5 text-[11px] font-normal"
															>
																{subject.chapters?.length || 0} ch
															</Badge>
														</span>
														<span className="text-muted-foreground shrink-0 text-xs tabular-nums">
															{subject.completedTopics}/{subject.totalTopics} ·{" "}
															{percent(subject.completionPercent)}%
														</span>
													</div>
													<Progress
														value={Number(subject.completionPercent || 0)}
														className="h-1.5"
													/>
												</div>
											</AccordionTrigger>
											<AccordionContent className="pb-4">
												<div className="space-y-2">
													{subject.chapters?.map((chapter: any) => (
														<div key={chapter.id} className="rounded-md bg-muted/30 p-2">
															<div className="flex items-center justify-between gap-3">
																<p className="text-sm">
																	{chapter.chapterNo}. {chapter.title}
																</p>
																<p className="text-muted-foreground text-xs tabular-nums">
																	{percent(chapter.completionPercent)}%
																</p>
															</div>
															<Progress
																value={Number(chapter.completionPercent || 0)}
																className="mt-2 h-1"
															/>
															<div className="mt-2 flex flex-wrap gap-2">
																{chapter.topics?.map((topic: any) => (
																	<span
																		key={topic.id}
																		className="rounded-md border px-2 py-1 text-xs"
																	>
																		{topic.title} · {percent(topic.progressPercent)}%
																	</span>
																))}
															</div>
														</div>
													))}
												</div>
											</AccordionContent>
										</AccordionItem>
									))}
								</Accordion>
							</section>
							)}
						</>
					)}
				</div>
			</ScrollArea>
		</SheetContent>
	);
}
