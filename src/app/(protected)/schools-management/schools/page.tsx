"use client";

import { SchoolCreate } from "@/modules/schools-management/schools/components/SchoolCreateButton";
import { SchoolList } from "@/modules/schools-management/schools/components/SchoolList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";

export default function SchoolsPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const locale = useLocale();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("schools_management"), href: PATHS.SCHOOLS_MANAGEMENT.ROOT },
			{ label: tNav("schools_management_schools") },
		]);
	}, [setBreadcrumbs, tNav, locale]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="SchoolsManagementSchools">
				<div className="hidden @3xl/page:flex">
					<SchoolCreate />
				</div>
			</PageHeading>
			<SchoolList />
		</div>
	);
}
