"use client";

import ExamRoutineView from "@/modules/examinations/routine/components/ExamRoutineView";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function ExamRoutineForExamPage({
	params,
}: {
	params: Promise<{ examId: string }>;
}) {
	const { examId } = use(params);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("examinations"), href: PATHS.EXAMINATIONS.ROOT },
			{ label: tNav("examinations_schedule"), href: PATHS.EXAMINATIONS.SCHEDULE.ROOT },
			{ label: tNav("examinations_routine"), href: PATHS.EXAMINATIONS.ROUTINE.EXAM(examId) },
		]);
	}, [examId, setBreadcrumbs, tNav]);

	return (
		<div className="@container/page min-w-0 space-y-6">
			<PageHeading routeName="ExamRoutine" />
			<ExamRoutineView initialExamId={examId} />
		</div>
	);
}
