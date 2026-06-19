"use client";

import { SubscriptionPlanEditForm } from "@/modules/schools-management/subscription-plans/components/SubscriptionPlanEditForm";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useLocale, useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function SubscriptionPlanEditPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const locale = useLocale();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("schools_management"), href: PATHS.SCHOOLS_MANAGEMENT.ROOT },
			{ label: tNav("schools_management_subscription_plans"), href: PATHS.SCHOOLS_MANAGEMENT.SUBSCRIPTION_PLANS.ROOT },
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav, locale]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="SubscriptionPlanEditPage" />
			<SubscriptionPlanEditForm id={id} />
		</div>
	);
}
