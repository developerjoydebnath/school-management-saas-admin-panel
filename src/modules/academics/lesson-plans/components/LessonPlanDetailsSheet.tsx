"use client";

import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { LessonPlanStatusEnum } from "../dto/lesson-plan.dto";
import { useLessonPlan } from "../hooks/use-lesson-plans";

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

function Block({ label, value }: { label: string; value?: string | null }) {
	if (!value) return null;
	return (
		<div>
			<p className="text-muted-foreground text-xs font-medium">{label}</p>
			<p className="mt-1 text-sm whitespace-pre-wrap">{value}</p>
		</div>
	);
}

const titleCase = (value: string) =>
	value.charAt(0) + value.slice(1).toLowerCase();

const formatDate = (value?: string | null) =>
	value
		? new Date(value).toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			})
		: "-";

const statusVariant = (status: LessonPlanStatusEnum) => {
	switch (status) {
		case LessonPlanStatusEnum.PUBLISHED:
			return "default" as const;
		case LessonPlanStatusEnum.COMPLETED:
			return "secondary" as const;
		case LessonPlanStatusEnum.CANCELLED:
			return "destructive" as const;
		default:
			return "outline" as const;
	}
};

export default function LessonPlanDetailsSheet({ id, open }: Props) {
	const t = useTranslations("LessonPlans");
	const { data, isLoading } = useLessonPlan(open ? id : undefined);

	return (
		<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[56vw]">
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
						</div>
					) : (
						<>
							<section className="bg-card rounded-md border p-4">
								<div className="flex flex-wrap items-start justify-between gap-2">
									<div className="min-w-0">
										<h3 className="text-sm font-medium">{data.title}</h3>
										<p className="text-muted-foreground mt-0.5 text-xs">{data.topic}</p>
									</div>
									<Badge variant={statusVariant(data.status)} className="font-normal">
										{titleCase(data.status)}
									</Badge>
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
									<Item label={t("date")} value={formatDate(data.lessonDate)} />
									<Item
										label={t("startTime")}
										value={`${data.startTime} - ${data.endTime}`}
									/>
								</div>

								{data.teachingMethods?.length ? (
									<div className="mt-4 flex flex-wrap gap-1.5">
										{data.teachingMethods.map((method) => (
											<Badge key={method} variant="secondary" className="font-normal">
												{method}
											</Badge>
										))}
									</div>
								) : null}
							</section>

							<section className="bg-card space-y-4 rounded-md border p-4">
								<h3 className="text-sm font-normal">{t("preparationSection")}</h3>
								<Block label={t("learningOutcomes")} value={data.learningOutcomes} />
								<Block label={t("priorKnowledge")} value={data.priorKnowledge} />
								<Block label={t("teachingAids")} value={data.teachingAids} />
							</section>

							<section className="bg-card space-y-4 rounded-md border p-4">
								<h3 className="text-sm font-normal">{t("deliverySection")}</h3>
								<Block label={t("introduction")} value={data.introduction} />
								<Block label={t("mainActivity")} value={data.mainActivity} />
								<Block label={t("evaluation")} value={data.evaluation} />
							</section>

							{data.homeworkNote || data.teacherReflection ? (
								<section className="bg-card space-y-4 rounded-md border p-4">
									<h3 className="text-sm font-normal">{t("wrapUpSection")}</h3>
									<Block label={t("homeworkNote")} value={data.homeworkNote} />
									<Block label={t("teacherReflection")} value={data.teacherReflection} />
								</section>
							) : null}
						</>
					)}
				</div>
			</ScrollArea>
		</SheetContent>
	);
}
