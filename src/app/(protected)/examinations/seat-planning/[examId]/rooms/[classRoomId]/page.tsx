"use client";

import { RoomSeatCanvas } from "@/modules/examinations/seat-planning/components/RoomSeatCanvas";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function ExamSeatPlanningRoomPage({
	params,
}: {
	params: Promise<{ examId: string; classRoomId: string }>;
}) {
	const { examId, classRoomId } = use(params);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("examinations"), href: PATHS.EXAMINATIONS.ROOT },
			{ label: tNav("examinations_schedule"), href: PATHS.EXAMINATIONS.SCHEDULE.ROOT },
			{ label: "Seat Planning", href: PATHS.EXAMINATIONS.SEAT_PLANNING.EXAM(examId) },
			{ label: "Room" },
		]);
	}, [examId, setBreadcrumbs, tNav]);

	return (
		<div className="@container/page min-w-0 space-y-6">
			<PageHeading
				routeName="Exams"
				title="Room Seat Plan"
				description="Click an empty seat to assign a student."
			/>
			<RoomSeatCanvas examId={examId} classRoomId={classRoomId} />
		</div>
	);
}
