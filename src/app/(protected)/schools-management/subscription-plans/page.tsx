"use client";

import { SubscriptionPlanCreate } from "@/modules/schools-management/subscription-plans/components/SubscriptionPlanCreateButton";
import { SubscriptionPlanList } from "@/modules/schools-management/subscription-plans/components/SubscriptionPlanList";
import PageHeading from "@/shared/components/custom/PageHeading";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";

export default function SubscriptionPlansPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const locale = useLocale();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("schools_management"), href: PATHS.SCHOOLS_MANAGEMENT.ROOT },
			{ label: tNav("schools_management_subscription_plans") },
		]);
	}, [setBreadcrumbs, tNav, locale]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="SubscriptionPlansPage">
				{/* Desktop-only Create button in PageHeading slot */}
				<PermissionGuard
					permissions={[
						PERMISSIONS.SCHOOLS_MANAGEMENT.ALL,
						PERMISSIONS.SCHOOLS_MANAGEMENT.SUBSCRIPTION_PLANS.ALL,
						PERMISSIONS.SCHOOLS_MANAGEMENT.SUBSCRIPTION_PLANS.CREATE,
					]}
				>
					<div className="hidden @3xl/page:flex">
						<SubscriptionPlanCreate />
					</div>
				</PermissionGuard>
			</PageHeading>

			<SubscriptionPlanList />
		</div>
	);
}
