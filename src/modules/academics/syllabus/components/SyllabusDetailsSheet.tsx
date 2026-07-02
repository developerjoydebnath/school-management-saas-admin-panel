"use client";

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
										value={`${percent(data.completionPercent)}%`}
									/>
								</div>
								<Progress value={Number(data.completionPercent || 0)} className="mt-4 h-2" />
							</section>
							<section className="rounded-md border bg-card p-4">
								<h3 className="text-sm font-normal">{t("subjectPlan")}</h3>
								<p className="text-muted-foreground mt-1 text-xs">
									{t("subjectPlanDescription")}
								</p>
								<div className="mt-3 space-y-3">
									{data.subjects?.map((subject: any) => (
										<div key={subject.id} className="rounded-md border p-3">
											<div className="flex items-center justify-between gap-3">
												<p className="text-sm">{subject.subject?.enName}</p>
												<p className="text-muted-foreground text-xs">
													{subject.completedTopics}/{subject.totalTopics} ·{" "}
													{percent(subject.completionPercent)}%
												</p>
											</div>
											<Progress
												value={Number(subject.completionPercent || 0)}
												className="mt-2 h-1.5"
											/>
											<div className="mt-3 space-y-2">
												{subject.chapters?.map((chapter: any) => (
													<div key={chapter.id} className="rounded-md bg-muted/30 p-2">
														<div className="flex items-center justify-between gap-3">
															<p className="text-sm">{chapter.title}</p>
															<p className="text-muted-foreground text-xs">
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
										</div>
									))}
								</div>
							</section>
						</>
					)}
				</div>
			</ScrollArea>
		</SheetContent>
	);
}
