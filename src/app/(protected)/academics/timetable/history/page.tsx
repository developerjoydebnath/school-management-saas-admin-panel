"use client";

import { TimetableHistoryView } from "@/modules/academics/timetable/components/TimetableHistoryView";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function TimetableHistoryPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const searchParams = useSearchParams();

	const sessionId = searchParams.get("sessionId");
	const classId = searchParams.get("classId");
	const sectionId = searchParams.get("sectionId");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_timetable"), href: PATHS.ACADEMICS.TIMETABLE.ROOT },
			{ label: tNav("academics_timetable_history") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page min-w-0 space-y-6">
			<PageHeading routeName="TimetableHistory" />
			<TimetableHistoryView
				defaultSessionId={sessionId}
				defaultClassId={classId}
				defaultSectionIds={sectionId ? [sectionId] : []}
			/>
		</div>
	);
}
