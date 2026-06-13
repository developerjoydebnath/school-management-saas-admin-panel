"use client";

import AttendanceSheet from "@/modules/students/attendance/components/AttendanceSheet";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function AttendanceSheetPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("students"), href: PATHS.STUDENTS.ROOT },
			{ label: tNav("students_attendance"), href: PATHS.STUDENTS.ATTENDANCE.ROOT },
			{ label: "Attendance Sheet" },
		]);
	}, [setBreadcrumbs, tNav]);

	return <AttendanceSheet />;
}
