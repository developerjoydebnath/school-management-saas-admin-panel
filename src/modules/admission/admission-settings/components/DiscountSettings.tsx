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
import { Switch } from "@/shared/components/ui/switch";
import { useSWR } from "@/shared/hooks/use-swr";
import axios from "@/shared/lib/axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const quotaOptions = [
	{ label: "Sibling Quota", value: "sibling" },
	{ label: "Teacher Child Quota", value: "teacher_child" },
	{ label: "Committee Member Quota", value: "committee_member" },
	{ label: "Freedom Fighter Quota", value: "freedom_fighter" },
	{ label: "Other Quota", value: "other" },
];

const discountTypeOptions = [
	{ label: "Flat Amount", value: "fixed_amount" },
	{ label: "Percentage", value: "percentage" },
];

const discountScopeOptions = [
	{ label: "Admission Fee Only", value: "admission_fee" },
	{ label: "Required Total", value: "required_total" },
	{ label: "All Shown Fees", value: "shown_total" },
];

const discountStackingOptions = [
	{ label: "Apply all eligible discounts", value: "stack_all" },
	{ label: "Apply one best discount only", value: "best_only" },
];

const quotaRuleSchema = z.object({
	quotaType: z.string(),
	label: z.string(),
	enabled: z.boolean().optional(),
	type: z.enum(["fixed_amount", "percentage"]),
	scope: z.enum(["admission_fee", "required_total", "shown_total"]),
	value: z.coerce.number().min(0),
	maxAmount: z.coerce.number().min(0).optional().or(z.literal("")),
	reason: z.string().optional(),
});

const discountSchema = z.object({
	discountEnabled: z.boolean().optional(),
	discountType: z.enum(["fixed_amount", "percentage"]),
	discountScope: z.enum(["admission_fee", "required_total", "shown_total"]),
	discountValue: z.coerce.number().min(0),
	discountMaxAmount: z.coerce.number().min(0).optional().or(z.literal("")),
	discountStackingMode: z.enum(["stack_all", "best_only"]),
	manualDiscountEnabled: z.boolean().optional(),
	quotaDiscountEnabled: z.boolean().optional(),
	quotaDiscountRules: z.array(quotaRuleSchema),
	referenceEnabled: z.boolean().optional(),
});

type DiscountFormValues = z.infer<typeof discountSchema>;

function defaultQuotaRules(existingRules: any[] = []): DiscountFormValues["quotaDiscountRules"] {
	const existingByType = new Map(existingRules.map((rule) => [rule.quotaType, rule]));
	return quotaOptions.map((quota) => {
		const existing = existingByType.get(quota.value) || {};
		return {
			quotaType: quota.value,
			label: quota.label,
			enabled: existing.enabled ?? false,
			type: (existing.type || "fixed_amount") as "fixed_amount" | "percentage",
			scope: (existing.scope || "admission_fee") as
				| "admission_fee"
				| "required_total"
				| "shown_total",
			value: Number(existing.value || 0),
			maxAmount:
				existing.maxAmount === null || existing.maxAmount === undefined
					? ""
					: Number(existing.maxAmount),
			reason: existing.reason || `${quota.label} admission discount`,
		};
	});
}

export default function DiscountSettings() {
	const { data: settingsResponse, mutate } = useSWR("/admission/settings/current");
	const settings = settingsResponse?.data;
	const form = useForm<DiscountFormValues>({
		resolver: zodResolver(discountSchema as any),
		defaultValues: {
			discountEnabled: false,
			discountType: "fixed_amount",
			discountScope: "required_total",
			discountValue: 0,
			discountMaxAmount: "",
			discountStackingMode: "stack_all",
			manualDiscountEnabled: true,
			quotaDiscountEnabled: false,
			quotaDiscountRules: defaultQuotaRules(),
			referenceEnabled: true,
		},
	});

	const quotaRules = form.watch("quotaDiscountRules") || [];
	const quotaDiscountEnabled = !!form.watch("quotaDiscountEnabled");

	useEffect(() => {
		if (!settings) return;
		form.reset({
			discountEnabled: settings.discountEnabled ?? false,
			discountType: settings.discountType || "fixed_amount",
			discountScope: settings.discountScope || "required_total",
			discountValue: Number(settings.discountValue || 0),
			discountMaxAmount:
				settings.discountMaxAmount === null || settings.discountMaxAmount === undefined
					? ""
					: Number(settings.discountMaxAmount),
			discountStackingMode: settings.discountStackingMode || "stack_all",
			manualDiscountEnabled: settings.manualDiscountEnabled ?? true,
			quotaDiscountEnabled: settings.quotaDiscountEnabled ?? false,
			quotaDiscountRules: defaultQuotaRules(settings.quotaDiscountRules || []),
			referenceEnabled: settings.referenceEnabled ?? true,
		});
	}, [form, settings]);

	const onSubmit = async (values: DiscountFormValues) => {
		if (!settings?.sessionId) return;
		await axios.put(`/admission/settings/${settings.sessionId}`, {
			admissionMode: settings.admissionMode,
			onlinePortalEnabled: settings.onlinePortalEnabled,
			onlinePortalSlug: settings.onlinePortalSlug,
			onlinePortalOpensAt: settings.onlinePortalOpensAt,
			onlinePortalClosesAt: settings.onlinePortalClosesAt,
			draftEnabled: settings.draftEnabled,
			defaultAdmissionFee: settings.defaultAdmissionFee,
			applicationPrefix: settings.applicationPrefix,
			...values,
			discountMaxAmount:
				values.discountMaxAmount === "" ? null : Number(values.discountMaxAmount || 0),
			quotaDiscountRules: values.quotaDiscountRules.map((rule) => ({
				...rule,
				value: Number(rule.value || 0),
				maxAmount: rule.maxAmount === "" ? null : Number(rule.maxAmount || 0),
			})),
		});
		await mutate();
		toast.success("Discount settings saved.");
	};

	return (
		<form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 pt-4">
			<div>
				<h2 className="text-2xl font-bold tracking-tight">Discount Settings</h2>
				<p className="text-muted-foreground">
					Configure admission discounts, quota benefits, manual discount permission, and references.
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Operational Controls</CardTitle>
					<CardDescription>
						Control whether references are collected and quota discounts are available.
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-6 md:grid-cols-2">
					<div className="flex items-center justify-between rounded-lg border p-4">
						<div>
							<div className="font-medium">Quota Discounts</div>
							<p className="text-muted-foreground text-sm">
								Apply admission fee discounts based on selected student quota.
							</p>
						</div>
						<Switch
							checked={!!form.watch("quotaDiscountEnabled")}
							onCheckedChange={(value) =>
								form.setValue("quotaDiscountEnabled", value, { shouldDirty: true })
							}
						/>
					</div>
					<div className="flex items-center justify-between rounded-lg border p-4">
						<div>
							<div className="font-medium">Reference Collection</div>
							<p className="text-muted-foreground text-sm">
								Collect reference name/mobile and match users if available.
							</p>
						</div>
						<Switch
							checked={!!form.watch("referenceEnabled")}
							onCheckedChange={(value) =>
								form.setValue("referenceEnabled", value, { shouldDirty: true })
							}
						/>
					</div>
					<div className="rounded-lg border p-4 md:col-span-2">
						<InputField
							control={form.control}
							name="discountStackingMode"
							label="Discount Application Rule"
							type="select"
							options={discountStackingOptions}
							placeholder="Select how discounts are applied"
						/>
						<p className="text-muted-foreground mt-2 text-sm">
							Use one best discount when the school allows only the highest applicable benefit.
							Use all eligible discounts when default and quota benefits can stack together.
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Quota Discount Rules</CardTitle>
					<CardDescription>
						Configure each quota independently. These settings affect admission-time fees only.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{quotaRules.map((rule, index) => (
						<div key={rule.quotaType} className="rounded-lg border p-4">
							<div className="mb-4 flex items-center justify-between gap-4">
								<div>
									<div className="font-medium">{rule.label}</div>
									<p className="text-muted-foreground text-xs">
										Use flat or percentage discount for this quota.
									</p>
								</div>
								<Switch
									checked={quotaDiscountEnabled && !!rule.enabled}
									disabled={!quotaDiscountEnabled}
									onCheckedChange={(value) =>
										form.setValue(`quotaDiscountRules.${index}.enabled`, value, {
											shouldDirty: true,
										})
									}
								/>
							</div>
							<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
								<InputField
									control={form.control}
									name={`quotaDiscountRules.${index}.type`}
									label="Discount Type"
									type="select"
									options={discountTypeOptions}
									placeholder="Select discount type"
									disabled={!quotaDiscountEnabled || !rule.enabled}
								/>
								<InputField
									control={form.control}
									name={`quotaDiscountRules.${index}.scope`}
									label="Apply On"
									type="select"
									options={discountScopeOptions}
									placeholder="Select discount scope"
									disabled={!quotaDiscountEnabled || !rule.enabled}
								/>
								<InputField
									control={form.control}
									name={`quotaDiscountRules.${index}.value`}
									label="Discount Value"
									type="number"
									placeholder="e.g. 500 or 100"
									disabled={!quotaDiscountEnabled || !rule.enabled}
								/>
								<InputField
									control={form.control}
									name={`quotaDiscountRules.${index}.maxAmount`}
									label="Max Discount"
									type="number"
									placeholder="e.g. 2000"
									disabled={!quotaDiscountEnabled || !rule.enabled}
								/>
								<InputField
									control={form.control}
									name={`quotaDiscountRules.${index}.reason`}
									label="Reason"
									type="text"
									placeholder="Enter discount reason"
									disabled={!quotaDiscountEnabled || !rule.enabled}
								/>
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Default Admission Discount</CardTitle>
					<CardDescription>
						This general rule follows the discount application rule configured above.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between rounded-lg border p-4">
						<div>
							<div className="font-medium">Enable Default Discount</div>
							<p className="text-muted-foreground text-sm">Apply this rule to new applications.</p>
						</div>
						<Switch
							checked={!!form.watch("discountEnabled")}
							onCheckedChange={(value) => {
								form.setValue("discountEnabled", value, { shouldDirty: true });
								if (value) {
									form.setValue("manualDiscountEnabled", false, { shouldDirty: true });
								}
							}}
						/>
					</div>
					<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
						<InputField
							control={form.control}
							name="discountType"
							label="Discount Type"
							type="select"
							options={discountTypeOptions}
							placeholder="Select discount type"
						/>
						<InputField
							control={form.control}
							name="discountScope"
							label="Apply On"
							type="select"
							options={discountScopeOptions}
							placeholder="Select discount scope"
						/>
						<InputField
							control={form.control}
							name="discountValue"
							label="Discount Value"
							type="number"
							placeholder="e.g. 500 or 10"
						/>
						<InputField
							control={form.control}
							name="discountMaxAmount"
							label="Max Discount"
							type="number"
							placeholder="e.g. 1000"
						/>
					</div>
					<div className="flex items-center justify-between rounded-lg border p-4">
						<div>
							<div className="font-medium">Manual Discount</div>
							<p className="text-muted-foreground text-sm">
								Allow staff to enter a custom discount during admission.
							</p>
						</div>
						<Switch
							checked={!!form.watch("manualDiscountEnabled")}
							onCheckedChange={(value) => {
								form.setValue("manualDiscountEnabled", value, { shouldDirty: true });
								if (value) {
									form.setValue("discountEnabled", false, { shouldDirty: true });
								}
							}}
						/>
					</div>
				</CardContent>
			</Card>

			<div className="bg-background/80 sticky bottom-4 z-40 flex justify-end rounded-lg border p-4 shadow-sm backdrop-blur-md">
				<Button type="submit" disabled={form.formState.isSubmitting}>
					<Save className="h-4 w-4" />
					Save Discount Settings
				</Button>
			</div>
		</form>
	);
}
