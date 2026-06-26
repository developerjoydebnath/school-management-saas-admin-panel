"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
	SchoolSubscriptionFormValues,
	schoolSubscriptionSchema,
} from "../dto/school-subscription.dto";
import {
	createSchoolSubscription,
	updateSchoolSubscription,
} from "../hooks/use-school-subscription-mutations";

const STATUS_OPTIONS = [
	{ label: "Trial", value: "trial" },
	{ label: "Active", value: "active" },
	{ label: "Past Due", value: "past_due" },
	{ label: "Expired", value: "expired" },
	{ label: "Cancelled", value: "cancelled" },
	{ label: "Suspended", value: "suspended" },
];

const BILLING_CYCLE_OPTIONS = [
	{ label: "Monthly", value: "monthly" },
	{ label: "Quarterly", value: "quarterly" },
	{ label: "Semi Annual", value: "semi_annual" },
	{ label: "Annual", value: "annual" },
	{ label: "Lifetime", value: "lifetime" },
	{ label: "Custom", value: "custom" },
];

type Props = {
	id?: string;
	defaultValues: SchoolSubscriptionFormValues;
	isEdit?: boolean;
};

export function SchoolSubscriptionForm({ id, defaultValues, isEdit = false }: Props) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();
	const t = useTranslations("SchoolsManagementSchoolSubscriptions");

	const form = useForm<SchoolSubscriptionFormValues>({
		resolver: zodResolver(schoolSubscriptionSchema as any),
		shouldFocusError: false,
		defaultValues,
	});

	const onSubmit = async (data: SchoolSubscriptionFormValues) => {
		if (!isEdit && !data.schoolId) {
			form.setError("schoolId", { type: "manual", message: "School is required" });
			return;
		}

		setIsSubmitting(true);
		try {
			if (isEdit && id) {
				await updateSchoolSubscription(id, data);
				toast.success(t("updateSuccess"));
			} else {
				await createSchoolSubscription(data);
				toast.success(t("createSuccess"));
			}
			router.push(PATHS.SCHOOLS_MANAGEMENT.SCHOOL_SUBSCRIPTIONS.ROOT);
		} catch (error: any) {
			const errors = error?.response?.data?.errors;
			if (Array.isArray(errors)) {
				errors.forEach((err: any) => {
					if (err.field && err.message) {
						form.setError(err.field as any, {
							type: "server",
							message: err.message,
						});
					}
				});
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">{t("sectionAssignmentTitle")}</CardTitle>
					<CardDescription>{t("sectionAssignmentDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
					{!isEdit && (
						<InputField
							control={form.control}
							name="schoolId"
							label="School"
							type="schoolSelect"
							placeholder="Select school"
							required
						/>
					)}
					<InputField
						control={form.control}
						name="planId"
						label="Subscription Plan"
						type="subscriptionPlanSelect"
						placeholder="Select subscription plan"
						required
					/>
					<InputField
						control={form.control}
						name="status"
						label="Status"
						type="select"
						options={STATUS_OPTIONS}
						required
					/>
				</CardContent>
			</Card>

			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">{t("sectionPeriodTitle")}</CardTitle>
					<CardDescription>{t("sectionPeriodDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-3">
					<InputField
						control={form.control}
						name="startsAt"
						label="Starts At"
						type="date"
						required
					/>
					<InputField
						control={form.control}
						name="expiresAt"
						label="Expires At"
						type="date"
					/>
					<InputField
						control={form.control}
						name="trialEndsAt"
						label="Trial Ends At"
						type="date"
					/>
					<InputField
						control={form.control}
						name="gracePeriodDays"
						label="Grace Period Days"
						type="number"
						placeholder="7"
						required
					/>
				</CardContent>
			</Card>

			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">{t("sectionPricingTitle")}</CardTitle>
					<CardDescription>{t("sectionPricingDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-3">
					<InputField
						control={form.control}
						name="priceBdt"
						label="Price (BDT)"
						type="number"
						placeholder="0"
						required
					/>
					<InputField
						control={form.control}
						name="billingCycle"
						label="Billing Cycle"
						type="select"
						options={BILLING_CYCLE_OPTIONS}
						required
					/>
					<InputField
						control={form.control}
						name="setupFeeBdt"
						label="Setup Fee (BDT)"
						type="number"
						placeholder="0"
						required
					/>
					<InputField
						control={form.control}
						name="discountPct"
						label="Discount Percent"
						type="number"
						placeholder="0"
					/>
					<div className="@2xl/page:col-span-2">
						<InputField
							control={form.control}
							name="discountNote"
							label="Discount Note"
							type="text"
							placeholder="Reason for discount"
						/>
					</div>
				</CardContent>
			</Card>

			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">{t("sectionLimitsTitle")}</CardTitle>
					<CardDescription>{t("sectionLimitsDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-2 gap-4 @2xl/page:grid-cols-4">
					<InputField control={form.control} name="maxStudents" label="Max Students" type="number" />
					<InputField control={form.control} name="maxTeachers" label="Max Teachers" type="number" />
					<InputField control={form.control} name="maxStaff" label="Max Staff" type="number" />
					<InputField control={form.control} name="maxClasses" label="Max Classes" type="number" />
					<InputField control={form.control} name="maxSubjects" label="Max Subjects" type="number" />
					<InputField control={form.control} name="maxBranches" label="Max Branches" type="number" />
					<InputField control={form.control} name="storageGb" label="Storage (GB)" type="number" />
					<InputField
						control={form.control}
						name="freeStudentLimit"
						label="Free Student Limit"
						type="number"
						required
					/>
				</CardContent>
			</Card>

			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">{t("sectionFeaturesTitle")}</CardTitle>
					<CardDescription>{t("sectionFeaturesDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-2 gap-4 @2xl/page:grid-cols-3">
					<InputField control={form.control} name="hasSmsNotifications" label="SMS Notifications" type="switch" />
					<InputField control={form.control} name="hasEmailNotifications" label="Email Notifications" type="switch" />
					<InputField control={form.control} name="hasParentPortal" label="Parent Portal" type="switch" />
					<InputField control={form.control} name="hasOnlineAdmission" label="Online Admission" type="switch" />
					<InputField control={form.control} name="hasOnlineFeePayment" label="Online Fee Payment" type="switch" />
					<InputField control={form.control} name="hasResultPublishing" label="Result Publishing" type="switch" />
					<InputField control={form.control} name="hasCustomDomain" label="Custom Domain" type="switch" />
					<InputField control={form.control} name="hasApiAccess" label="API Access" type="switch" />
					<InputField control={form.control} name="hasAdvancedReports" label="Advanced Reports" type="switch" />
					<InputField control={form.control} name="hasPrioritySupport" label="Priority Support" type="switch" />
					<InputField control={form.control} name="hasDedicatedAccountManager" label="Dedicated Account Manager" type="switch" />
				</CardContent>
			</Card>

			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">{t("sectionNotesTitle")}</CardTitle>
					<CardDescription>{t("sectionNotesDescription")}</CardDescription>
				</CardHeader>
				<CardContent>
					<InputField
						control={form.control}
						name="notes"
						label="Internal Notes"
						type="textarea"
						placeholder="Add internal notes"
					/>
				</CardContent>
			</Card>

			<div className="bg-background/80 sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-lg border p-4 shadow-sm backdrop-blur-md">
				<Button
					variant="outline"
					type="button"
					onClick={() => router.back()}
					disabled={isSubmitting}
				>
					{t("cancel")}
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting
						? t("saving")
						: isEdit
							? t("updateSubscription")
							: t("createSubscription")}
				</Button>
			</div>
		</form>
	);
}
