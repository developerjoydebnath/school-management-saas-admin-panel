"use client";

import ClassSummaryGrid from "@/modules/students/directory/components/ClassSummaryGrid";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function StudentsDirectoryPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("students"), href: PATHS.STUDENTS.ROOT },
			{ label: tNav("students_directory"), href: PATHS.STUDENTS.DIRECTORY.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="space-y-6">
			<PageHeading routeName="StudentsDirectory" />
			<ClassSummaryGrid />
		</div>
	);
}
