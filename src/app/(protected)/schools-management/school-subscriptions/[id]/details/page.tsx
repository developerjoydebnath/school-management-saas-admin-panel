"use client";

import { SchoolSubscriptionDetails } from "@/modules/schools-management/school-subscriptions/components/SchoolSubscriptionDetails";
import { useSchoolSubscription } from "@/modules/schools-management/hooks/use-school-subscriptions";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

export default function SchoolSubscriptionDetailsPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");
	const { data: subscription, isLoading } = useSchoolSubscription(id);

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("schools_management"), href: PATHS.SCHOOLS_MANAGEMENT.ROOT },
			{
				label: tNav("schools_management_school_subscriptions"),
				href: PATHS.SCHOOLS_MANAGEMENT.SCHOOL_SUBSCRIPTIONS.ROOT,
			},
			{ label: tNav("details") },
		]);
	}, [setBreadcrumbs, tNav]);

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="SchoolsManagementSchoolSubscriptionsDetails" />
			{isLoading || !subscription ? (
				<div className="space-y-4">
					<Skeleton className="h-48 w-full" />
					<Skeleton className="h-48 w-full" />
					<Skeleton className="h-48 w-full" />
				</div>
			) : (
				<SchoolSubscriptionDetails subscription={subscription} />
			)}
		</div>
	);
}
