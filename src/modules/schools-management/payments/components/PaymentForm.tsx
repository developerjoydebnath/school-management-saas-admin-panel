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
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { usePaymentQuote } from "../../hooks/use-payments";
import {
	PaymentFormValues,
	paymentMethodEnum,
	paymentSchema,
	paymentStatusEnum,
} from "../dto/payment.dto";
import {
	createPayment,
	getPaymentQuote,
	updatePayment,
} from "../hooks/use-payment-mutations";

const STATUS_OPTIONS = [
	{ label: "Pending", value: paymentStatusEnum.PENDING },
	{ label: "Completed", value: paymentStatusEnum.COMPLETED },
	{ label: "Failed", value: paymentStatusEnum.FAILED },
	{ label: "Refunded", value: paymentStatusEnum.REFUNDED },
];

const METHOD_OPTIONS = [
	{ label: "Cash", value: paymentMethodEnum.CASH },
	{ label: "Bank Transfer", value: paymentMethodEnum.BANK_TRANSFER },
	{ label: "Credit Card", value: paymentMethodEnum.CREDIT_CARD },
	{ label: "Mobile Banking", value: paymentMethodEnum.MOBILE_BANKING },
	{ label: "Other", value: paymentMethodEnum.OTHER },
];

const CURRENCY_OPTIONS = [
	{ label: "BDT", value: "BDT" },
	{ label: "USD", value: "USD" },
];

type Props = {
	id?: string;
	defaultValues: PaymentFormValues;
	isEdit?: boolean;
};

const formatMoney = (amount?: number) =>
	Number(amount ?? 0).toLocaleString("en-US", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	});

export function PaymentForm({ id, defaultValues, isEdit = false }: Props) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
	const [quoteOverride, setQuoteOverride] = useState<any>(null);
	const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | null>(null);
	const appliedQuoteSubscriptionRef = useRef<string>("");
	const router = useRouter();
	const t = useTranslations("SchoolsManagementPayments");

	const form = useForm<PaymentFormValues>({
		resolver: zodResolver(paymentSchema as any),
		shouldFocusError: false,
		defaultValues,
	});

	useEffect(() => {
		if (isEdit) {
			form.reset(defaultValues);
		}
	}, [defaultValues, form, isEdit]);

	const selectedSchoolId = useWatch({ control: form.control, name: "schoolId" });
	const selectedSubscriptionId = useWatch({
		control: form.control,
		name: "subscriptionId",
	});
	const selectedVoucherCode = useWatch({
		control: form.control,
		name: "voucherCode",
	});
	const selectedBillingCycles = useWatch({
		control: form.control,
		name: "billingCycles",
	});
	const { data: basePaymentQuote, isLoading: isQuoteLoading } = usePaymentQuote(
		!isEdit ? selectedSubscriptionId : null,
		selectedBillingCycles || 1,
		appliedVoucherCode
	);
	const paymentQuote =
		quoteOverride?.subscriptionId === selectedSubscriptionId &&
		quoteOverride?.billingCycles === Number(selectedBillingCycles || 1)
			? quoteOverride
			: basePaymentQuote;

	useEffect(() => {
		if (!isEdit) {
			form.setValue("subscriptionId", "");
			form.setValue("voucherCode", "");
			setAppliedVoucherCode(null);
			setQuoteOverride(null);
			appliedQuoteSubscriptionRef.current = "";
		}
	}, [selectedSchoolId, form, isEdit]);

	useEffect(() => {
		if (!isEdit) {
			form.setValue("voucherCode", "");
			setAppliedVoucherCode(null);
			setQuoteOverride(null);
			appliedQuoteSubscriptionRef.current = "";
		}
	}, [selectedSubscriptionId, form, isEdit]);

	useEffect(() => {
		if (
			appliedVoucherCode &&
			selectedVoucherCode &&
			selectedVoucherCode !== appliedVoucherCode
		) {
			setAppliedVoucherCode(null);
			setQuoteOverride(null);
			appliedQuoteSubscriptionRef.current = "";
		}
	}, [appliedVoucherCode, selectedVoucherCode]);

	useEffect(() => {
		if (!isEdit && paymentQuote?.discount?.voucherCode && !selectedVoucherCode) {
			form.setValue("voucherCode", paymentQuote.discount.voucherCode, {
				shouldDirty: false,
			});
		}
	}, [form, isEdit, paymentQuote?.discount?.voucherCode, selectedVoucherCode]);

	useEffect(() => {
		if (!selectedSubscriptionId) {
			appliedQuoteSubscriptionRef.current = "";
			return;
		}
		const quoteKey = `${paymentQuote?.subscriptionId || ""}:${paymentQuote?.billingCycles || 1}:${paymentQuote?.discount?.voucherCode || "none"}`;
		if (
			!isEdit &&
			paymentQuote?.subscriptionId &&
			quoteKey !== appliedQuoteSubscriptionRef.current
		) {
			form.setValue("amount", Number(paymentQuote.payableAmount ?? 0), {
				shouldDirty: true,
				shouldValidate: true,
			});
			appliedQuoteSubscriptionRef.current = quoteKey;
		}
	}, [form, isEdit, paymentQuote, selectedSubscriptionId]);

	const amountHelperText = useMemo(() => {
		if (isEdit) return undefined;
		if (isQuoteLoading) return "Loading subscription amount...";
		if (!paymentQuote) return undefined;

		if (!paymentQuote.discount) {
			return `${paymentQuote.billingCycles} month(s) at BDT ${formatMoney(paymentQuote.originalAmount)} per month. Total payable is BDT ${formatMoney(paymentQuote.payableAmount)}.`;
		}

		const voucherText = paymentQuote.discount.voucherCode
			? ` Voucher ${paymentQuote.discount.voucherCode} is active.`
			: " A voucher discount is active.";
		const cycleText =
			paymentQuote.discount.remainingCycles === null
				? " The discount is valid for this subscription lifetime."
				: ` ${paymentQuote.discount.remainingCycles} discounted cycle(s) will remain after this payment.`;
		const splitText =
			paymentQuote.remainingMaxDiscountAmount === 0
				? ` Voucher applies to ${paymentQuote.voucherAppliedCycles} month(s), but no discount is applied because the voucher maximum discount has already been used. ${paymentQuote.billingCycles} month(s) use original price.`
				: paymentQuote.fullPriceCycles > 0
				? ` Discount applies to ${paymentQuote.discountedCycles} month(s); ${paymentQuote.fullPriceCycles} month(s) use original price.`
				: ` Discount applies to all ${paymentQuote.discountedCycles} selected month(s).`;
		const maxDiscountText =
			paymentQuote.remainingMaxDiscountAmount === 0
				? ` Voucher maximum discount is BDT ${formatMoney(paymentQuote.maxDiscountBdt || 0)} and BDT ${formatMoney(paymentQuote.consumedMaxDiscountAmount)} has already been used.`
				: paymentQuote.isMaxDiscountApplied
					? ` Voucher maximum discount capped the total discount at BDT ${formatMoney(paymentQuote.maxDiscountBdt || 0)}.`
			: "";

		return `Original price is BDT ${formatMoney(paymentQuote.originalAmount)} per month. Total original bill is BDT ${formatMoney(paymentQuote.originalBillAmount)}.${voucherText}${splitText}${maxDiscountText}${cycleText} Total discounted amount is BDT ${formatMoney(paymentQuote.discountAmount)}.`;
	}, [isEdit, isQuoteLoading, paymentQuote]);

	const handleApplyVoucher = async () => {
		if (!selectedSubscriptionId) {
			form.setError("subscriptionId", {
				type: "manual",
				message: "Subscription is required",
			});
			return;
		}
		if (!selectedVoucherCode || selectedVoucherCode === "none") {
			form.setError("voucherCode", {
				type: "manual",
				message: "Voucher is required",
			});
			return;
		}

		setIsApplyingVoucher(true);
		try {
			const res = await getPaymentQuote({
				subscriptionId: selectedSubscriptionId,
				voucherCode: selectedVoucherCode,
				billingCycles: Number(selectedBillingCycles || 1),
			});
			setQuoteOverride(res.data);
			setAppliedVoucherCode(selectedVoucherCode);
			toast.success("Voucher applied successfully");
		} catch {
			setQuoteOverride(null);
		} finally {
			setIsApplyingVoucher(false);
		}
	};

	const onSubmit = async (data: PaymentFormValues) => {
		if (!isEdit && !data.schoolId) {
			form.setError("schoolId", { type: "manual", message: "School is required" });
			return;
		}
		if (!data.subscriptionId) {
			form.setError("subscriptionId", {
				type: "manual",
				message: "Subscription is required",
			});
			return;
		}

		setIsSubmitting(true);
		try {
			if (isEdit && id) {
				await updatePayment(id, data);
				toast.success(t("updateSuccess"));
			} else {
				await createPayment(data);
				toast.success(t("createSuccess"));
			}
			router.push(PATHS.SCHOOLS_MANAGEMENT.PAYMENTS.ROOT);
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
					{!isEdit && (
						<InputField
							control={form.control}
							name="subscriptionId"
							label="Subscription"
							type="schoolSubscriptionSelect"
							placeholder="Select subscription"
							dependencyId={selectedSchoolId}
							required
						/>
					)}
					{!isEdit && (
						<div className="@2xl/page:col-span-2 grid grid-cols-1 items-end gap-3 @2xl/page:grid-cols-[1fr_auto]">
							<InputField
								control={form.control}
								name="voucherCode"
								label="Voucher"
								type="voucherSelect"
								placeholder="Select voucher"
								disabled={!selectedSubscriptionId}
							/>
							<Button
								type="button"
								variant="secondary"
								onClick={handleApplyVoucher}
								disabled={
									!selectedSubscriptionId ||
									!selectedVoucherCode ||
									selectedVoucherCode === "none" ||
									isApplyingVoucher
								}
							>
								{isApplyingVoucher ? "Applying..." : "Apply Voucher"}
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">{t("sectionPaymentTitle")}</CardTitle>
					<CardDescription>{t("sectionPaymentDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-3">
					<InputField
						control={form.control}
						name="billingCycles"
						label="Months"
						type="number"
						placeholder="1"
						min={1}
						max={60}
						step={1}
						required
					/>
					<InputField
						control={form.control}
						name="amount"
						label="Amount"
						type="number"
						placeholder="0"
						min={0}
						step="any"
						helperText={amountHelperText}
						required
					/>
					<InputField
						control={form.control}
						name="currency"
						label="Currency"
						type="select"
						placeholder="Select currency"
						options={CURRENCY_OPTIONS}
						required
					/>
					<InputField
						control={form.control}
						name="paidAt"
						label="Paid At"
						type="date"
						placeholder="Select date"
					/>
					<InputField
						control={form.control}
						name="method"
						label="Payment Method"
						type="select"
						placeholder="Select method"
						options={METHOD_OPTIONS}
						required
					/>
					<InputField
						control={form.control}
						name="status"
						label="Status"
						type="select"
						placeholder="Select status"
						options={STATUS_OPTIONS}
						required
					/>
				</CardContent>
			</Card>

			<Card className="gap-0 shadow-none ring-0">
				<CardHeader className="pb-4">
					<CardTitle className="text-base">{t("sectionReferenceTitle")}</CardTitle>
					<CardDescription>{t("sectionReferenceDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
					<InputField
						control={form.control}
						name="transactionId"
						label="Transaction ID"
						type="text"
						placeholder="Transaction ID"
					/>
					<InputField
						control={form.control}
						name="invoiceId"
						label="Invoice ID"
						type="text"
						placeholder="Auto generated if empty"
					/>
					<div className="@2xl/page:col-span-2">
						<InputField
							control={form.control}
							name="notes"
							label="Notes"
							type="textarea"
							placeholder="Internal notes"
						/>
					</div>
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
							? t("updatePayment")
							: t("createPayment")}
				</Button>
			</div>
		</form>
	);
}
