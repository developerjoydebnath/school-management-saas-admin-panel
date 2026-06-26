"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { discountTypeEnum, VoucherFormValues, voucherSchema } from "../dto/voucher.dto";
import { updateVoucher } from "../hooks/use-voucher-mutations";
import { VoucherModel } from "../../models/voucher.model";

const DISCOUNT_TYPE_OPTIONS = [
	{ label: "Percentage", value: "percentage" },
	{ label: "Fixed Amount", value: "fixed_amount" },
];

export function VoucherEditForm({ voucher }: { voucher: VoucherModel }) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const router = useRouter();
	const t = useTranslations("VouchersPage");
	const tf = useTranslations("Forms");

	const form = useForm<VoucherFormValues>({
		resolver: zodResolver(voucherSchema as any),
		shouldFocusError: false,
		defaultValues: {
			code: voucher.code,
			name: voucher.name,
			description: voucher.description,
			discountType: voucher.discountType as discountTypeEnum,
			discountValue: voucher.discountValue,
			maxDiscountBdt: voucher.maxDiscountBdt,
			maxRedemptions: voucher.maxRedemptions,
			onePerSchool: voucher.onePerSchool,
			durationCycles: voucher.durationCycles,
			applicablePlanIds: voucher.applicablePlanIds,
			minimumBillBdt: voucher.minimumBillBdt,
			validFrom: voucher.validFrom ? new Date(voucher.validFrom).toISOString().slice(0, 16) : "",
			expiresAt: voucher.expiresAt ? new Date(voucher.expiresAt).toISOString().slice(0, 16) : null,
			isActive: voucher.isActive,
			notes: voucher.notes,
		},
	});

	const onSubmit = async (data: VoucherFormValues) => {
		setIsSubmitting(true);
		try {
			const payload = {
				...data,
				validFrom: data.validFrom ? new Date(data.validFrom).toISOString() : data.validFrom,
				expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : data.expiresAt,
			};
			await updateVoucher(voucher.id, payload);
			toast.success(t("updateSuccess") || "Voucher updated successfully");
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
		<form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-7xl space-y-6">
			{/* Basic Information */}
			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">{t("sectionBasicInfo") || "Basic Information"}</CardTitle>
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
					<CardTitle className="text-base">{t("sectionDiscount") || "Discount Config"}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-3">
						<InputField
							control={form.control}
							name="discountType"
							label="Discount Type"
							type="select"
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
					<CardTitle className="text-base">{t("sectionLimits") || "Limits & Duration"}</CardTitle>
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
					<CardTitle className="text-base">{t("sectionSettings") || "Settings"}</CardTitle>
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

			{/* Form Actions */}
			<div className="bg-background/80 sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-lg border p-4 shadow-sm backdrop-blur-md">
				<Button
					variant="outline"
					type="button"
					onClick={() => router.back()}
					disabled={isSubmitting}
				>
					{tf("cancel") || "Cancel"}
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? (tf("updateLoading") || "Updating...") : (t("updateVoucher") || "Update Voucher")}
				</Button>
			</div>
		</form>
	);
}
