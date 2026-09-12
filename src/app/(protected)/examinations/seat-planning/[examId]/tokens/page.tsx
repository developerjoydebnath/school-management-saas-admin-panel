"use client";

import { SeatTokensPlayground } from "@/modules/examinations/seat-planning/components/SeatTokensPlayground";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { use, useEffect } from "react";

export default function ExamSeatTokensPage({
	params,
}: {
	params: Promise<{ examId: string }>;
}) {
	const { examId } = use(params);
	const searchParams = useSearchParams();
	const classRoomId = searchParams.get("classRoomId") || undefined;
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("examinations"), href: PATHS.EXAMINATIONS.ROOT },
			{ label: tNav("examinations_schedule"), href: PATHS.EXAMINATIONS.SCHEDULE.ROOT },
			{ label: "Seat Planning", href: PATHS.EXAMINATIONS.SEAT_PLANNING.EXAM(examId) },
			{ label: "Seat Tokens" },
		]);
	}, [examId, setBreadcrumbs, tNav]);

	return (
		<div className="@container/page min-w-0 space-y-6">
			<PageHeading
				routeName="Exams"
				title="Seat Tokens"
				description="Pick a card design, preview the real PDF, then download and cut apart to paste on each bench."
			/>
			<SeatTokensPlayground examId={examId} classRoomId={classRoomId} />
		</div>
	);
}
