"use client";

import { EmployeeMonthDetail } from "@/modules/staff/attendance/components/report/EmployeeMonthDetail";
import { EmployeeType } from "@/modules/staff/attendance/dto/staff-attendance.dto";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function EmployeeAttendancePage() {
	const params = useParams();
	const employeeType = params?.employeeType as EmployeeType;
	const employeeId = params?.employeeId as string;
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("staff"), href: PATHS.STAFF.ROOT },
			{ label: tNav("staff_attendance"), href: PATHS.STAFF.ATTENDANCE.ROOT },
			{
				label: "Employee",
				href: PATHS.STAFF.ATTENDANCE.EMPLOYEE(employeeType, employeeId),
			},
		]);
	}, [setBreadcrumbs, tNav, employeeType, employeeId]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="StaffAttendanceEmployee" />
			<EmployeeMonthDetail employeeType={employeeType} employeeId={employeeId} />
		</div>
	);
}
