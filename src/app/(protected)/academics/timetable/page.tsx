"use client";

import TimetableView from "@/modules/academics/timetable/components/TimetableView";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function TimetablePage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("academics"), href: PATHS.ACADEMICS.ROOT },
			{ label: tNav("academics_timetable"), href: PATHS.ACADEMICS.TIMETABLE.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="min-w-0 space-y-6">
			<PageHeading routeName="Timetable" />
			<div className="w-full min-w-0">
				<TimetableView />
			</div>
		</div>
	);
}
