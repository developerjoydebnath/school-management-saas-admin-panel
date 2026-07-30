"use client";

import ParentDirectory from "@/modules/parents/directory/components/ParentDirectory";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function ParentDirectoryPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("parents"), href: PATHS.PARENTS.ROOT },
			{ label: tNav("parents_directory"), href: PATHS.PARENTS.DIRECTORY.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="Parents" />
			<ParentDirectory />
		</div>
	);
}
