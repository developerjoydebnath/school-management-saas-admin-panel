"use client";

import { SchoolSubscriptionList } from "@/modules/schools-management/school-subscriptions/components/SchoolSubscriptionList";
import { SchoolSubscriptionCreateButton } from "@/modules/schools-management/school-subscriptions/components/SchoolSubscriptionCreateButton";
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
			{ label: tNav("schools_management"), href: PATHS.SCHOOLS_MANAGEMENT.ROOT },
			{ label: tNav("schools_management_school_subscriptions") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="SchoolsManagementSchoolSubscriptions">
				<div className="hidden @3xl/page:flex">
					<SchoolSubscriptionCreateButton />
				</div>
			</PageHeading>
			<SchoolSubscriptionList />
		</div>
	);
}
