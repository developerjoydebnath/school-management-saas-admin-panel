"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Separator } from "@/shared/components/ui/separator";
import { PATHS } from "@/shared/configs/paths.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { VoucherFormValues, voucherSchema } from "../dto/voucher.dto";
import { createVoucher } from "../hooks/use-voucher-mutations";

const DISCOUNT_TYPE_OPTIONS = [
	{ label: "Percentage", value: "percentage" },
	{ label: "Fixed Amount", value: "fixed_amount" },
];

export function VoucherCreateForm() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();
	const t = useTranslations("VouchersPage");
	const tf = useTranslations("Forms");

	const form = useForm<VoucherFormValues>({
		resolver: zodResolver(voucherSchema as any),
		shouldFocusError: false,
		defaultValues: {
			code: "",
			name: "",
			description: "",
			discountType: "percentage",
			discountValue: 0,
			maxDiscountBdt: null,
			maxRedemptions: null,
			onePerSchool: true,
			durationCycles: 1,
			applicablePlanIds: [],
			minimumBillBdt: null,
			validFrom: new Date().toISOString(),
			expiresAt: null,
			isActive: true,
			notes: "",
		},
	});

	const onSubmit = async (data: VoucherFormValues) => {
		setIsSubmitting(true);
		try {
			await createVoucher(data);
			toast.success(t("createSuccess") || "Voucher created successfully");
			router.push(PATHS.SCHOOLS_MANAGEMENT.VOUCHERS.ROOT);
		} catch (error: any) {
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

	return (
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-5xl space-y-6">
			{/* Basic Information */}
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">
						{t("sectionBasicInfo") || "Basic Information"}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
						<InputField
							control={form.control}
							name="code"
							label="Voucher Code"
							type="text"
							placeholder="e.g. LAUNCH20"
							required
						/>
						<InputField
							control={form.control}
							name="name"
							label="Internal Name"
							type="text"
							placeholder="e.g. Launch Discount"
							required
						/>
					</div>
					<InputField
						control={form.control}
						name="description"
						label="Description (Visible on Invoice)"
						type="textarea"
						placeholder="Optional description"
					/>
				</CardContent>
			</Card>

			{/* Discount Value */}
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">
						{t("sectionDiscount") || "Discount Config"}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-3">
						<InputField
							control={form.control}
							name="discountType"
							label="Discount Type"
							type="native_select"
							options={DISCOUNT_TYPE_OPTIONS}
							required
						/>
						<InputField
							control={form.control}
							name="discountValue"
							label="Discount Value"
							type="number"
							placeholder="0"
							required
						/>
						<InputField
							control={form.control}
							name="maxDiscountBdt"
							label="Max Discount (BDT)"
							type="number"
							placeholder="No Limit"
						/>
					</div>
					<div className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
						<InputField
							control={form.control}
							name="minimumBillBdt"
							label="Minimum Bill (BDT)"
							type="number"
							placeholder="No Limit"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Redemption Limits & Duration */}
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">
						{t("sectionLimits") || "Limits & Duration"}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
						<InputField
							control={form.control}
							name="maxRedemptions"
							label="Max Redemptions (Total)"
							type="number"
							placeholder="Unlimited"
						/>
						<InputField
							control={form.control}
							name="durationCycles"
							label="Duration Cycles (Months/Years)"
							type="number"
							placeholder="1"
						/>
					</div>
					<div className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
						<InputField
							control={form.control}
							name="validFrom"
							label="Valid From"
							type="datetime-local"
						/>
						<InputField
							control={form.control}
							name="expiresAt"
							label="Expires At"
							type="datetime-local"
						/>
					</div>
					<div className="pt-2">
						<InputField
							control={form.control}
							name="onePerSchool"
							label="Limit 1 per school"
							type="switch"
						/>
					</div>
				</CardContent>
			</Card>

			{/* Settings */}
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">
						{t("sectionSettings") || "Settings"}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<InputField
							control={form.control}
							name="isActive"
							label="Active"
							type="switch"
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
					{tf("cancel") || "Cancel"}
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting
						? tf("createLoading") || "Creating..."
						: t("createVoucher") || "Create Voucher"}
				</Button>
			</div>
		</form>
	);
}
