"use client";

import { PermissionCreate } from "@/modules/permissions/components/PermissionCreate";
import { PermissionList } from "@/modules/permissions/components/PermissionList";
import PageHeading from "@/shared/components/custom/PageHeading";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";

export default function PermissionsPage() {
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();
	const locale = useLocale();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("roles"), href: PATHS.ROLES.ROOT },
			{ label: tNav("roles_matrix") },
		]);
	}, [setBreadcrumbs, tNav, locale]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="PermissionsPage">
				<PermissionGuard
					permissions={[
						PERMISSIONS.ROLES.ALL,
						PERMISSIONS.ROLES.MATRIX.ALL,
						PERMISSIONS.ROLES.MATRIX.CREATE,
					]}
				>
					<div className="hidden @3xl/page:flex">
						<PermissionCreate />
					</div>
				</PermissionGuard>
			</PageHeading>

			<PermissionList />
		</div>
	);
}
