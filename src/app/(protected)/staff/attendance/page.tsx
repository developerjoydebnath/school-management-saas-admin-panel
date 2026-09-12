"use client";

import { StaffAttendanceBoard } from "@/modules/staff/attendance/components/board/StaffAttendanceBoard";
import PageHeading from "@/shared/components/custom/PageHeading";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { CalendarRange, Settings2, UserCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";

export default function StaffAttendancePage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("staff"), href: PATHS.STAFF.ROOT },
			{ label: tNav("staff_attendance"), href: PATHS.STAFF.ATTENDANCE.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="StaffAttendance">
				<div className="hidden items-center gap-2 @3xl/page:flex">
					<Button variant="outline" asChild className="gap-2">
						<Link href={PATHS.STAFF.ATTENDANCE.MY}>
							<UserCheck className="h-4 w-4" />
							My attendance
						</Link>
					</Button>
					<Button variant="outline" asChild className="gap-2">
						<Link href={PATHS.STAFF.ATTENDANCE.REPORT}>
							<CalendarRange className="h-4 w-4" />
							Monthly report
						</Link>
					</Button>
					<PermissionGuard
						permissions={[
							PERMISSIONS.STAFF.ATTENDANCE.SETTINGS,
							PERMISSIONS.STAFF.ATTENDANCE.ALL,
							PERMISSIONS.STAFF.ALL,
						]}
					>
						<Button variant="outline" asChild className="gap-2">
							<Link href={PATHS.STAFF.ATTENDANCE.SETTINGS}>
								<Settings2 className="h-4 w-4" />
								Settings
							</Link>
						</Button>
					</PermissionGuard>
				</div>
			</PageHeading>
			<StaffAttendanceBoard />
		</div>
	);
}
