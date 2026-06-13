"use client";

import { AddIncidentDialog } from "@/modules/students/behavior/components/AddIncidentDialog";
import BehaviorOverview from "@/modules/students/behavior/components/BehaviorOverview";
import PageHeading from "@/shared/components/custom/PageHeading";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function StudentsBehaviorPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("students"), href: PATHS.STUDENTS.ROOT },
			{ label: tNav("students_behavior"), href: PATHS.STUDENTS.BEHAVIOR.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="space-y-6">
			<PageHeading routeName="StudentBehavior">
				<PermissionGuard
					permissions={[
						PERMISSIONS.STUDENTS.BEHAVIOR.CREATE,
						PERMISSIONS.STUDENTS.BEHAVIOR.ALL,
						PERMISSIONS.STUDENTS.ALL,
					]}
				>
					<AddIncidentDialog />
				</PermissionGuard>
			</PageHeading>
			<BehaviorOverview />
		</div>
	);
}
