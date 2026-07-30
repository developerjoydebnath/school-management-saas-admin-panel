"use client";

import ParentPortalAccess from "@/modules/parents/portal-access/components/ParentPortalAccess";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function ParentPortalAccessPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("parents"), href: PATHS.PARENTS.ROOT },
			{ label: tNav("parents_portal"), href: PATHS.PARENTS.PORTAL.ROOT },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="ParentPortalAccess" />
			<ParentPortalAccess />
		</div>
	);
}
