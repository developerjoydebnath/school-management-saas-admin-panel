"use client";

import { SchoolSubscriptionList } from "@/modules/schools-management/school-subscriptions/components/SchoolSubscriptionList";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function SchoolSubscriptionsPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: "Schools Management", href: PATHS.SCHOOLS_MANAGEMENT.ROOT },
			{ label: "School Subscriptions" },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="SchoolsManagementSchoolSubscriptions" />
			<SchoolSubscriptionList />
		</div>
	);
}
