"use client";

import ExamCalendarView from "@/modules/examinations/calendar/components/ExamCalendarView";
import PageHeading from "@/shared/components/custom/PageHeading";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useSessionStore } from "@/shared/stores/session-store";
import { AlarmClockCheck, ClipboardList } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";

export default function ExamCalendarPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const { selectedSessionId } = useSessionStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("ExamCalendar");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("examinations"), href: PATHS.EXAMINATIONS.ROOT },
			{ label: tNav("examinations_calendar"), href: PATHS.EXAMINATIONS.CALENDAR.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="ExamCalendar">
				{/* The calendar is read-only, so the useful actions are the two
				    modules that actually own the schedule it draws. */}
				<div className="hidden items-center gap-2 @3xl/page:flex">
					<PermissionGuard
						permissions={[
							PERMISSIONS.EXAMINATIONS.ALL,
							PERMISSIONS.EXAMINATIONS.SCHEDULE.VIEW,
						]}
					>
						<Button asChild variant="outline">
							<Link href={PATHS.EXAMINATIONS.SCHEDULE.ROOT}>
								<ClipboardList className="size-4" />
								{t("openSchedule")}
							</Link>
						</Button>
					</PermissionGuard>
					<PermissionGuard
						permissions={[
							PERMISSIONS.EXAMINATIONS.ALL,
							PERMISSIONS.EXAMINATIONS.SCHEDULE.VIEW,
						]}
					>
						<Button asChild variant="outline">
							<Link href={PATHS.EXAMINATIONS.ROUTINE.ROOT}>
								<AlarmClockCheck className="size-4" />
								{t("openRoutine")}
							</Link>
						</Button>
					</PermissionGuard>
				</div>
			</PageHeading>

			<Card className="p-6 shadow-none ring-0">
				<CardContent className="p-0">
					<ExamCalendarView sessionId={selectedSessionId || undefined} />
				</CardContent>
			</Card>
		</div>
	);
}
