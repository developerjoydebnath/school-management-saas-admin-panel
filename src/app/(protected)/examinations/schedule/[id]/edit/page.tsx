"use client";

import ExamForm from "@/modules/examinations/schedule/components/ExamForm";
import { ExamStatusEnum, ExamTypeEnum } from "@/modules/examinations/schedule/dto/exam.dto";
import { useExam } from "@/modules/examinations/schedule/hooks/use-exam";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function EditExamPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const { data, isLoading } = useExam(id);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("examinations"), href: PATHS.EXAMINATIONS.ROOT },
			{
				label: tNav("examinations_schedule"),
				href: PATHS.EXAMINATIONS.SCHEDULE.ROOT,
			},
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	if (isLoading || !data) {
		return (
			<div className="@container/page space-y-6">
				<PageHeading routeName="EditExam" />
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="EditExam" />
			<ExamForm
				id={id}
				isEdit
				defaultValues={{
					sessionId: data.sessionId || "",
					name: data.name || "",
					nameBn: data.nameBn || "",
					type: data.type || ExamTypeEnum.HALF_YEARLY,
					startDate: data.startDate?.slice(0, 10) || "",
					endDate: data.endDate?.slice(0, 10) || "",
					status: data.status || ExamStatusEnum.DRAFT,
					classIds: data.classes?.map((item: any) => item.classId) || [],
					instructions: data.instructions || "",
					instructionsBn: data.instructionsBn || "",
					gradingScale: data.gradingScale || "gpa_5",
					defaultTotalMarks: data.defaultTotalMarks ?? 100,
					defaultPassMarks: data.defaultPassMarks ?? 33,
					notes: data.notes || "",
				}}
			/>
		</div>
	);
}
