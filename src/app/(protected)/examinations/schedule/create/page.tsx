"use client";

import ExamForm from "@/modules/examinations/schedule/components/ExamForm";
import { ExamStatusEnum, ExamTypeEnum } from "@/modules/examinations/schedule/dto/exam.dto";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function CreateExamPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("examinations"), href: PATHS.EXAMINATIONS.ROOT },
			{
				label: tNav("examinations_schedule"),
				href: PATHS.EXAMINATIONS.SCHEDULE.ROOT,
			},
			{ label: tNav("create") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="CreateExam" />
			<ExamForm
				defaultValues={{
					sessionId: "",
					name: "",
					nameBn: "",
					type: ExamTypeEnum.HALF_YEARLY,
					startDate: "",
					endDate: "",
					status: ExamStatusEnum.DRAFT,
					classIds: [],
					instructions: "",
					instructionsBn: "",
					gradingScale: "gpa_5",
					defaultTotalMarks: 100,
					defaultPassMarks: 33,
					notes: "",
				}}
			/>
		</div>
	);
}
