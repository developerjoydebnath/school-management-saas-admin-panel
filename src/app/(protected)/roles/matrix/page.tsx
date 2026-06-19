"use client";

import { PermissionCreate } from "@/modules/permissions/components/PermissionCreate";
import { PermissionList } from "@/modules/permissions/components/PermissionList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function PermissionsPage() {
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("roles"), href: PATHS.ROLES.ROOT },
			{ label: tNav("roles_matrix") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="PermissionsPage">
				<div className="hidden @3xl/page:flex">
					<PermissionCreate />
				</div>
			</PageHeading>

			<PermissionList />
		</div>
	);
}
