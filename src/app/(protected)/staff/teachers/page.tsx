"use client";

import TeacherList from "@/modules/staff/teachers/components/TeacherList";
import PageHeading from "@/shared/components/custom/PageHeading";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect } from "react";

export default function TeachersPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const t = useTranslations("Teachers");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("staff"), href: PATHS.STAFF.ROOT },
			{ label: tNav("staff_teachers"), href: PATHS.STAFF.TEACHERS.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Teachers">
				<div className="hidden @3xl/page:flex">
					<PermissionGuard
						permissions={[
							PERMISSIONS.STAFF.TEACHERS.CREATE,
							PERMISSIONS.STAFF.TEACHERS.ALL,
							PERMISSIONS.STAFF.ALL,
						]}
					>
						<Button asChild>
							<Link href={PATHS.STAFF.TEACHERS.CREATE}>
								<Plus className="h-4 w-4" />
								{t("addTeacher")}
							</Link>
						</Button>
					</PermissionGuard>
				</div>
			</PageHeading>
			<TeacherList />
		</div>
	);
}
