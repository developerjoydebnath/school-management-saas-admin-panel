"use client";

import DepartmentForm from "@/modules/staff/departments/components/DepartmentForm";
import { useDepartment } from "@/modules/staff/departments/hooks/use-department";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function EditDepartmentPage() {
	const { id } = useParams<{ id: string }>();
	const { department, isLoading } = useDepartment(id);
	
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("staff"), href: PATHS.STAFF.ROOT },
			{ label: tNav("staff_departments"), href: PATHS.STAFF.DEPARTMENTS.ROOT },
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	if (isLoading) {
		return (
			<div className="@container/page space-y-6">
				<PageHeading routeName="Departments" />
				<div className="flex h-64 items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
				</div>
			</div>
		);
	}

	if (!department) {
		return (
			<div className="@container/page space-y-6">
				<PageHeading routeName="Departments" />
				<div className="flex h-64 items-center justify-center">
					<p className="text-muted-foreground">Department not found</p>
				</div>
			</div>
		);
	}

	const defaultValues = {
		name: department.name,
		nameBn: department.nameBn,
		headTeacherId: department.headTeacherId || "",
		description: department.description || "",
		isActive: department.isActive,
	};

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Departments" />
			<DepartmentForm id={id} defaultValues={defaultValues} isEdit />
		</div>
	);
}
