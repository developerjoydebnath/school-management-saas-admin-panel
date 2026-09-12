"use client";

import BehaviorOverview from "@/modules/students/behavior/components/BehaviorOverview";
import PageHeading from "@/shared/components/custom/PageHeading";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";

export default function StudentsBehaviorPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("StudentBehavior");

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
					<Link href={PATHS.STUDENTS.BEHAVIOR.CREATE} passHref>
						<Button>
							<PlusCircle className="h-4 w-4" />
							{t("dialog.title")}
						</Button>
					</Link>
				</PermissionGuard>
			</PageHeading>

			<div className="grid grid-cols-1 items-start gap-8">
				<BehaviorOverview />
			</div>
		</div>
	);
}
