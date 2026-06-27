"use client";

import DepartmentForm from "@/modules/staff/departments/components/DepartmentForm";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

const defaultValues = {
	name: "",
	nameBn: "",
	headTeacherId: "",
	description: "",
	isActive: true,
};

export default function CreateDepartmentPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("staff"), href: PATHS.STAFF.ROOT },
			{ label: tNav("staff_departments"), href: PATHS.STAFF.DEPARTMENTS.ROOT },
			{ label: tNav("create") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Departments" />
			<DepartmentForm defaultValues={defaultValues} />
		</div>
	);
}
