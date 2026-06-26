"use client";

import { RoleCreate } from "@/modules/roles/components/RoleCreate";
import { RoleList } from "@/modules/roles/components/RoleList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";

export default function RolesPage() {
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();
	const locale = useLocale();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("roles"), href: PATHS.ROLES.ROOT },
			{ label: tNav("roles_management") },
		]);
	}, [setBreadcrumbs, tNav, locale]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="RolesPage">
				<RoleCreate />
			</PageHeading>

			<RoleList />
		</div>
	);
}
