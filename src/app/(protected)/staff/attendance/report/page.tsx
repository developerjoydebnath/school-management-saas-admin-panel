"use client";

import { MonthlyReport } from "@/modules/staff/attendance/components/report/MonthlyReport";
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
			{ label: "Monthly report", href: PATHS.STAFF.ATTENDANCE.REPORT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="StaffAttendanceReport" />
			<MonthlyReport />
		</div>
	);
}
