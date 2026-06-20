"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { PATHS } from "@/shared/configs/paths.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSubscriptionPlan } from "../../hooks/use-subscription-plan";
import { SubscriptionPlanFormValues, subscriptionPlanSchema } from "../dto/subscription-plan.dto";
import { updateSubscriptionPlan } from "../hooks/use-subscription-plan-mutations";
import { SubscriptionPlanFormSkeleton } from "./SubscriptionPlanFormSkeleton";

const BILLING_CYCLE_OPTIONS = [
	{ label: "Monthly", value: "monthly" },
	{ label: "Quarterly", value: "quarterly" },
	{ label: "Semi Annual", value: "semi_annual" },
	{ label: "Annual", value: "annual" },
	{ label: "Lifetime", value: "lifetime" },
	{ label: "Custom", value: "custom" },
];

interface Props {
	id: string;
}

export function SubscriptionPlanEditForm({ id }: Props) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();
	const t = useTranslations("SubscriptionPlansPage");

	// Fetch plan details by ID
	const { data: plan, isLoading } = useSubscriptionPlan(id);

	const form = useForm<SubscriptionPlanFormValues>({
		resolver: zodResolver(subscriptionPlanSchema as any),
		defaultValues: {
			name: "",
			tagline: "",
			description: "",
			priceBdt: 0,
			billingCycle: "monthly",
			setupFeeBdt: 0,
			trialDays: 0,
			gracePeriodDays: 7,
			maxStudents: 0,
			maxTeachers: 0,
			maxStaff: 0,
			maxClasses: 0,
			maxSubjects: 0,
			maxBranches: 1,
			storageGb: 5,
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
			isPublic: true,
			isActive: true,
			sortOrder: 0,
			notes: "",
		},
	});

	// Pre-populate form once data loaded
	useEffect(() => {
		if (plan) {
			const raw = plan.original;
			form.reset({
				name: raw.name || "",
				tagline: raw.tagline || "",
				description: raw.description || "",
				priceBdt: raw.priceBdt ?? 0,
				billingCycle: raw.billingCycle || "monthly",
				setupFeeBdt: raw.setupFeeBdt ?? 0,
				trialDays: raw.trialDays ?? 0,
				gracePeriodDays: raw.gracePeriodDays ?? 7,
				maxStudents: raw.maxStudents ?? 0,
				maxTeachers: raw.maxTeachers ?? 0,
				maxStaff: raw.maxStaff ?? 0,
				maxClasses: raw.maxClasses ?? 0,
				maxSubjects: raw.maxSubjects ?? 0,
				maxBranches: raw.maxBranches ?? 1,
				storageGb: raw.storageGb ?? 5,
				freeStudentLimit: raw.freeStudentLimit ?? 0,
				hasSmsNotifications: raw.hasSmsNotifications ?? false,
				hasEmailNotifications: raw.hasEmailNotifications ?? true,
				hasParentPortal: raw.hasParentPortal ?? false,
				hasOnlineAdmission: raw.hasOnlineAdmission ?? false,
				hasOnlineFeePayment: raw.hasOnlineFeePayment ?? false,
				hasResultPublishing: raw.hasResultPublishing ?? false,
				hasCustomDomain: raw.hasCustomDomain ?? false,
				hasApiAccess: raw.hasApiAccess ?? false,
				hasAdvancedReports: raw.hasAdvancedReports ?? false,
				hasPrioritySupport: raw.hasPrioritySupport ?? false,
				hasDedicatedAccountManager: raw.hasDedicatedAccountManager ?? false,
				isPublic: raw.isPublic ?? true,
				isActive: raw.isActive ?? true,
				sortOrder: raw.sortOrder ?? 0,
				notes: raw.notes || "",
			});
		}
	}, [plan?.id, form]); // eslint-disable-line react-hooks/exhaustive-deps

	const onSubmit = async (data: SubscriptionPlanFormValues) => {
		setIsSubmitting(true);
		try {
			await updateSubscriptionPlan(id, data);
			toast.success(t("updateSuccess"));
			router.push(PATHS.SCHOOLS_MANAGEMENT.SUBSCRIPTION_PLANS.ROOT);
		} catch (error: any) {
			// Global axios interceptor auto-toasts errors
			if (error.response?.data?.errors) {
				const errors = error.response.data.errors;
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
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return <SubscriptionPlanFormSkeleton />;
	}

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
			{/* Basic Information */}
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">{t("sectionBasicInfo")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
						<InputField
							control={form.control}
							name="name"
							label="Plan Name"
							type="text"
							placeholder="Enter plan name"
							required
						/>
						<InputField
							control={form.control}
							name="tagline"
							label="Tagline"
							type="text"
							placeholder="Enter tagline"
						/>
					</div>
					<InputField
						control={form.control}
						name="description"
						label="Description"
						type="textEditor"
						placeholder="Enter description"
					/>
				</CardContent>
			</Card>

			{/* Pricing */}
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">{t("sectionPricing")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-3">
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
							type="native_select"
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
					</div>
					<div className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-3">
						<InputField
							control={form.control}
							name="trialDays"
							label="Trial Days"
							type="number"
							placeholder="0"
							required
						/>
						<InputField
							control={form.control}
							name="gracePeriodDays"
							label="Grace Period Days"
							type="number"
							placeholder="7"
							required
						/>
						<InputField
							control={form.control}
							name="freeStudentLimit"
							label="Free Student Limit"
							type="number"
							placeholder="0"
							required
						/>
					</div>
				</CardContent>
			</Card>

			{/* Limits */}
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">{t("sectionLimits")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4 @2xl/page:grid-cols-4">
						<InputField
							control={form.control}
							name="maxStudents"
							label="Max Students"
							type="number"
							placeholder="0"
						/>
						<InputField
							control={form.control}
							name="maxTeachers"
							label="Max Teachers"
							type="number"
							placeholder="0"
						/>
						<InputField
							control={form.control}
							name="maxStaff"
							label="Max Staff"
							type="number"
							placeholder="0"
						/>
						<InputField
							control={form.control}
							name="maxClasses"
							label="Max Classes"
							type="number"
							placeholder="0"
						/>
						<InputField
							control={form.control}
							name="maxSubjects"
							label="Max Subjects"
							type="number"
							placeholder="0"
						/>
						<InputField
							control={form.control}
							name="maxBranches"
							label="Max Branches"
							type="number"
							placeholder="1"
						/>
						<InputField
							control={form.control}
							name="storageGb"
							label="Storage Limit (GB)"
							type="number"
							placeholder="5"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Features */}
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">{t("sectionFeatures")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4 @2xl/page:grid-cols-3">
						<InputField
							control={form.control}
							name="hasSmsNotifications"
							label="SMS Notifications"
							type="switch"
						/>
						<InputField
							control={form.control}
							name="hasEmailNotifications"
							label="Email Notifications"
							type="switch"
						/>
						<InputField
							control={form.control}
							name="hasParentPortal"
							label="Parent Portal"
							type="switch"
						/>
						<InputField
							control={form.control}
							name="hasOnlineAdmission"
							label="Online Admission"
							type="switch"
						/>
						<InputField
							control={form.control}
							name="hasOnlineFeePayment"
							label="Online Fee Payment"
							type="switch"
						/>
						<InputField
							control={form.control}
							name="hasResultPublishing"
							label="Result Publishing"
							type="switch"
						/>
						<InputField
							control={form.control}
							name="hasCustomDomain"
							label="Custom Domain"
							type="switch"
						/>
						<InputField
							control={form.control}
							name="hasApiAccess"
							label="API Access"
							type="switch"
						/>
						<InputField
							control={form.control}
							name="hasAdvancedReports"
							label="Advanced Reports"
							type="switch"
						/>
						<InputField
							control={form.control}
							name="hasPrioritySupport"
							label="Priority Support"
							type="switch"
						/>
						<InputField
							control={form.control}
							name="hasDedicatedAccountManager"
							label="Dedicated Account Manager"
							type="switch"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Settings */}
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">{t("sectionSettings")}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4 @2xl/page:grid-cols-3">
						<InputField
							control={form.control}
							name="isPublic"
							label="Public Plan"
							type="switch"
						/>
						<InputField
							control={form.control}
							name="isActive"
							label="Active"
							type="switch"
						/>
						<InputField
							control={form.control}
							name="sortOrder"
							label="Sort Order"
							type="number"
							placeholder="0"
						/>
					</div>
					<InputField
						control={form.control}
						name="notes"
						label="Internal Notes"
						type="textarea"
						placeholder="Add internal notes"
					/>
				</CardContent>
			</Card>

			<Separator />

			{/* Form Actions */}
			<div className="flex justify-end gap-3">
				<Button
					variant="outline"
					type="button"
					onClick={() => router.back()}
					disabled={isSubmitting}
				>
					{t("cancel")}
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? t("updating") : t("updatePlan")}
				</Button>
			</div>
		</form>
	);
}
