"use client";

import { SchoolSubscriptionForm } from "@/modules/schools-management/school-subscriptions/components/SchoolSubscriptionForm";
import {
	billingCycleEnum,
	subscriptionStatusEnum,
	type SchoolSubscriptionFormValues,
} from "@/modules/schools-management/school-subscriptions/dto/school-subscription.dto";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function CreateSchoolSubscriptionPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();
	const tNav = useTranslations("Navigation");

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("schools_management"), href: PATHS.SCHOOLS_MANAGEMENT.ROOT },
			{
				label: tNav("schools_management_school_subscriptions"),
				href: PATHS.SCHOOLS_MANAGEMENT.SCHOOL_SUBSCRIPTIONS.ROOT,
			},
			{ label: tNav("create") },
		]);
	}, [setBreadcrumbs, tNav]);

	const defaultValues: SchoolSubscriptionFormValues = {
		schoolId: "",
		planId: "",
		startsAt: new Date().toISOString().slice(0, 10),
		expiresAt: "",
		trialEndsAt: "",
		status: subscriptionStatusEnum.ACTIVE,
		gracePeriodDays: 7,
		maxStudents: undefined,
		maxTeachers: undefined,
		maxStaff: undefined,
		maxClasses: undefined,
		maxSubjects: undefined,
		maxBranches: undefined,
		storageGb: undefined,
		freeStudentLimit: 0,
		hasSmsNotifications: false,
		hasEmailNotifications: true,
		hasParentPortal: false,
		hasOnlineAdmission: false,
		hasOnlineFeePayment: false,
		hasResultPublishing: false,
		hasCustomDomain: false,
		hasApiAccess: false,
		hasAdvancedReports: false,
		hasPrioritySupport: false,
		hasDedicatedAccountManager: false,
		priceBdt: 0,
		billingCycle: billingCycleEnum.MONTHLY,
		setupFeeBdt: 0,
		discountPct: 0,
		discountNote: "",
		notes: "",
	}

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="SchoolsManagementSchoolSubscriptionsCreate" />
			<SchoolSubscriptionForm id={undefined} defaultValues={defaultValues} />
		</div>
	);
}
