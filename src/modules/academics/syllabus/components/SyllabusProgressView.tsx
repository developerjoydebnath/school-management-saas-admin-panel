"use client";

import { useSyllabus } from "@/modules/academics/syllabus/hooks/use-syllabus";
import { toggleSyllabusTopic } from "@/modules/academics/syllabus/hooks/use-syllabus-mutations";
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
import { Check, Save } from "lucide-react";
import { useTranslations } from "next-intl";
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

			{data.subjects?.map((subject: any) => (
				<Card key={subject.id} className="shadow-none ring-0">
					<CardHeader>
						<CardTitle>{subject.subject?.enName || "-"}</CardTitle>
						<CardDescription>
							{percent(subject.completionPercent).toFixed(0)}%
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
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
					</CardContent>
				</Card>
			))}
		</div>
	);
}
