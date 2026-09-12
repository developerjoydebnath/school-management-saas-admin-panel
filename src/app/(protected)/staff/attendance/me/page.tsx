"use client";

import { PunchCardView } from "@/modules/staff/attendance/components/punch/PunchCardView";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function Page() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("staff"), href: PATHS.STAFF.ROOT },
			{ label: tNav("staff_attendance"), href: PATHS.STAFF.ATTENDANCE.ROOT },
			{ label: "My attendance", href: PATHS.STAFF.ATTENDANCE.MY },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="StaffAttendanceMe" />
			<PunchCardView />
		</div>
	);
}
