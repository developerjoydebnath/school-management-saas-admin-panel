"use client";

import { SeatPlanningRoomsList } from "@/modules/examinations/seat-planning/components/SeatPlanningRoomsList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function ExamSeatPlanningPage({
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
			{ label: "Seat Planning" },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page min-w-0 space-y-6">
			<PageHeading
				routeName="Exams"
				title="Exam Seat Planning"
				description="Open a room to seat students for the exam."
			/>
			<SeatPlanningRoomsList examId={examId} />
		</div>
	);
}
