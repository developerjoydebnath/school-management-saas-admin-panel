"use client";

import { useSchoolSubscription } from "@/modules/schools-management/hooks/use-school-subscriptions";
import { SchoolSubscriptionForm } from "@/modules/schools-management/school-subscriptions/components/SchoolSubscriptionForm";
import {
	billingCycleEnum,
	subscriptionStatusEnum,
	type SchoolSubscriptionFormValues,
} from "@/modules/schools-management/school-subscriptions/dto/school-subscription.dto";
import PageHeading from "@/shared/components/custom/PageHeading";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { use, useEffect } from "react";

const toDateInput = (value?: string | null) => {
	if (!value) return "";
	return new Date(value).toISOString().slice(0, 10);
};

export default function EditSchoolSubscriptionPage({
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
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);


	if (isLoading) {
		return <div className="mx-auto max-w-5xl space-y-4">
			<Skeleton className="h-48 w-full" />
			<Skeleton className="h-48 w-full" />
			<Skeleton className="h-48 w-full" />
		</div>
	}

	const defaultValues: SchoolSubscriptionFormValues = {
		schoolId: subscription?.schoolId || "",
		planId: subscription?.planId || "",
		startsAt: toDateInput(subscription?.startsAt),
		expiresAt: toDateInput(subscription?.expiresAt),
		trialEndsAt: toDateInput(subscription?.trialEndsAt),
		status: (subscription?.status || subscriptionStatusEnum.TRIAL) as subscriptionStatusEnum,
		gracePeriodDays: subscription?.gracePeriodDays ?? 7,
		maxStudents: subscription?.maxStudents ?? undefined,
		maxTeachers: subscription?.maxTeachers ?? undefined,
		maxStaff: subscription?.maxStaff ?? undefined,
		maxClasses: subscription?.maxClasses ?? undefined,
		maxSubjects: subscription?.maxSubjects ?? undefined,
		maxBranches: subscription?.maxBranches ?? undefined,
		storageGb: subscription?.storageGb ?? undefined,
		freeStudentLimit: subscription?.freeStudentLimit ?? 0,
		hasSmsNotifications: subscription?.hasSmsNotifications ?? false,
		hasEmailNotifications: subscription?.hasEmailNotifications ?? true,
		hasParentPortal: subscription?.hasParentPortal ?? false,
		hasOnlineAdmission: subscription?.hasOnlineAdmission ?? false,
		hasOnlineFeePayment: subscription?.hasOnlineFeePayment ?? false,
		hasResultPublishing: subscription?.hasResultPublishing ?? false,
		hasCustomDomain: subscription?.hasCustomDomain ?? false,
		hasApiAccess: subscription?.hasApiAccess ?? false,
		hasAdvancedReports: subscription?.hasAdvancedReports ?? false,
		hasPrioritySupport: subscription?.hasPrioritySupport ?? false,
		hasDedicatedAccountManager: subscription?.hasDedicatedAccountManager ?? false,
		priceBdt: Number(subscription?.priceBdt ?? 0),
		billingCycle: (subscription?.billingCycle || billingCycleEnum.MONTHLY) as billingCycleEnum,
		setupFeeBdt: Number(subscription?.setupFeeBdt ?? 0),
		discountPct: Number(subscription?.discountPct ?? 0),
		discountNote: subscription?.discountNote || "",
		notes: subscription?.notes || "",
	}

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="SchoolsManagementSchoolSubscriptionsEdit" />
			{!subscription ? (
				<div className="mx-auto max-w-5xl space-y-4">
					{/* show in a card no subscription found */}
					<div className="rounded-lg border bg-card p-6 text-center">
						<h2 className="text-lg font-semibold">No subscription found</h2>
						<p className="text-sm text-muted-foreground">
							The subscription you are trying to edit does not exist or has been deleted.
						</p>
					</div>
				</div>
			) : (
				<SchoolSubscriptionForm id={subscription.id} defaultValues={defaultValues} isEdit={true} />
			)}
		</div>
	);
}
