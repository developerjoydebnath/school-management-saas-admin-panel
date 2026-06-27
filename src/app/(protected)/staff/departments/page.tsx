"use client";

import { DepartmentCreate } from "@/modules/staff/departments/components/DepartmentCreate";
import DepartmentList from "@/modules/staff/departments/components/DepartmentList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function DepartmentsPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("staff"), href: PATHS.STAFF.ROOT },
			{ label: tNav("staff_departments"), href: PATHS.STAFF.DEPARTMENTS.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Departments">
				<div className="hidden @3xl/page:flex">
					<DepartmentCreate />
				</div>
			</PageHeading>
			<DepartmentList />
		</div>
	);
}
