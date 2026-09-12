"use client";

import { useSyllabus } from "@/modules/academics/syllabus/hooks/use-syllabus";
import { toggleSyllabusTopic } from "@/modules/academics/syllabus/hooks/use-syllabus-mutations";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Progress } from "@/shared/components/ui/progress";
import { Separator } from "@/shared/components/ui/separator";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { Check, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
	id: string;
};

const percent = (value: unknown) => Math.max(0, Math.min(100, Number(value || 0)));

export function SyllabusProgressView({ id }: Props) {
	const t = useTranslations("Syllabus");
	const { data, isLoading, mutate } = useSyllabus(id);
	const [savingTopicId, setSavingTopicId] = useState<string | null>(null);
	const [draftProgress, setDraftProgress] = useState<Record<string, number>>({});

	const updateTopic = async (topicId: string, progressPercent: number) => {
		setSavingTopicId(topicId);
		try {
			await toggleSyllabusTopic(id, topicId, {
				progressPercent,
				isCompleted: progressPercent >= 100,
			});
			toast.success(t("progressUpdateSuccess"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setSavingTopicId(null);
			await mutate();
		}
	};

	if (isLoading || !data) {
		return (
			<div className="mx-auto max-w-7xl space-y-4">
				<Skeleton className="h-32 w-full" />
				<Skeleton className="h-80 w-full" />
			</div>
		);
	}

	// Manual syllabuses carry no topic tree, so there is nothing to track here.
	// The list hides this action for them; this covers a direct URL visit.
	if (data.mode === "MANUAL") {
		return (
			<div className="mx-auto max-w-7xl">
				<Card className="border-dashed shadow-none ring-0">
					<CardContent className="text-muted-foreground flex min-h-48 flex-col items-center justify-center gap-2 text-center text-sm">
						<p>{t("progressNotAvailableManual")}</p>
						<Button asChild variant="outline" size="sm">
							<Link href={PATHS.ACADEMICS.SYLLABUS.EDIT(id)}>{t("editSyllabus")}</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl space-y-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("progressOverview")}</CardTitle>
					<CardDescription>{t("progressOverviewDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2">
					<div className="flex items-center justify-between text-sm">
						<span>{data.title || data.exam?.name || "-"}</span>
						<span>{percent(data.completionPercent).toFixed(0)}%</span>
					</div>
					<Progress value={percent(data.completionPercent)} className="h-2" />
				</CardContent>
			</Card>

			{/* One collapsible panel per subject — a published syllabus can carry
			    a dozen subjects with dozens of chapters/topics each, so every
			    subject expanded at once would make this page unusable. */}
			<Accordion type="multiple" className="gap-4">
				{data.subjects?.map((subject: any) => (
					<AccordionItem
						key={subject.id}
						value={subject.id}
						className="bg-card rounded-md border px-6"
					>
						<AccordionTrigger className="py-4 hover:no-underline">
							<div className="flex min-w-0 flex-1 items-center justify-between gap-3 pr-3">
								<span className="flex min-w-0 items-center gap-2">
									<span className="truncate text-sm font-medium">
										{subject.subject?.enName || "-"}
									</span>
									<Badge variant="secondary" className="h-5 shrink-0 px-1.5 text-[11px] font-normal">
										{subject.chapters?.length || 0} ch
									</Badge>
								</span>
								<span className="text-muted-foreground shrink-0 text-xs tabular-nums">
									{percent(subject.completionPercent).toFixed(0)}%
								</span>
							</div>
						</AccordionTrigger>
						<AccordionContent className="space-y-4 pb-6">
							{subject.chapters?.map((chapter: any) => (
							<div key={chapter.id} className="rounded-md border bg-muted/20 p-4">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<div>
										<p className="text-sm">{chapter.title}</p>
										<p className="text-muted-foreground text-xs">
											Chapter Weight: {percent(chapter.weightPercent).toFixed(0)}%
										</p>
									</div>
									<span className="text-sm">
										{percent(chapter.completionPercent).toFixed(0)}%
									</span>
								</div>
								<Progress value={percent(chapter.completionPercent)} className="mt-3 h-1.5" />
								<div className="mt-4 space-y-3">
									{chapter.topics?.map((topic: any) => {
										const value =
											draftProgress[topic.id] ?? percent(topic.progressPercent);
										return (
											<div
												key={topic.id}
												className="grid grid-cols-1 gap-3 rounded-md border bg-background/60 p-3 lg:grid-cols-2"
											>
												<div>
													<p className="text-sm">{topic.title}</p>
													<p className="text-muted-foreground text-xs">
														Topic Weight: {percent(topic.weightPercent).toFixed(0)}%
													</p>
												</div>

												<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
													<Input
														type="number"
														min={0}
														max={100}
														step={1}
														className="w-full sm:w-24 min-w-16"
														value={value}
														onChange={(event) =>
															setDraftProgress((current) => ({
																...current,
																[topic.id]: percent(event.target.value),
															}))
														}
													/>
													<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
														<Button
															type="button"
															variant="outline"
															className="w-full sm:w-auto"
															disabled={savingTopicId === topic.id}
															onClick={() => updateTopic(topic.id, value)}
														>
															<Save className="size-4" />
															{t("saveProgress")}
														</Button>
														<Separator
															orientation="vertical"
															className="hidden h-8 sm:block"
														/>
														<Button
															type="button"
															variant="outline"
															className="w-full sm:w-auto"
															disabled={savingTopicId === topic.id}
															onClick={() => {
																setDraftProgress((current) => ({
																	...current,
																	[topic.id]: 100,
																}));
																updateTopic(topic.id, 100);
															}}
															title={t("markCompleted")}
														>
															<Check className="size-4" />
															<span>{t("markCompleted")}</span>
														</Button>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						))}
						</AccordionContent>
					</AccordionItem>
				))}
			</Accordion>
		</div>
	);
}
