"use client";

import { purchasePlan, verifyVoucher } from "@/modules/payments/hooks/use-payments-mutations";
import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { useSWR } from "@/shared/hooks/use-swr";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import { z } from "zod";

const paymentSchema = z.object({
	planId: z.string().uuid("Please select a valid subscription plan"),
	voucherCode: z.string().optional(),
	transactionId: z.string().max(100).optional().refine((val) => !val || !/\s/.test(val), {
		message: "Transaction ID cannot contain spaces",
	}),
	method: z.enum(["cash", "bank_transfer", "mobile_banking", "credit_card"], {
		message: "Payment method is required",
	}),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function PaymentPage() {
	const params = useParams();
	const id = params.id as string;
	const router = useRouter();
	const { setBreadcrumbs } = useBreadcrumbStore();
	const { mutate } = useSWRConfig();

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);
	const [priceBreakdown, setPriceBreakdown] = useState<{
		planPrice: number;
		discountAmount: number;
		finalPrice: number;
		voucherName?: string;
	} | null>(null);

	// Fetch Data
	const { data: schoolRes, isLoading: isLoadingSchool } = useSWR(`/superadmin/schools/${id}`);
	const { data: plansRes, isLoading: isLoadingPlans } = useSWR("/superadmin/subscription-plans");
	const { data: vouchersRes, isLoading: isLoadingVouchers } = useSWR("/vouchers?isActive=true");

	const school = schoolRes?.data;
	const plans = plansRes?.data?.items || [];
	const vouchers = vouchersRes?.data?.items || [];

	const form = useForm<PaymentFormValues>({
		resolver: zodResolver(paymentSchema as any),
		defaultValues: {
			planId: "",
			voucherCode: "",
			transactionId: "",
			method: "bank_transfer",
		},
	});

	const planId = form.watch("planId");
	const voucherCode = form.watch("voucherCode");

	useEffect(() => {
		form.setValue("voucherCode", "");
	}, [planId, form]);

	// Update breakdown when plan changes (and no voucher applied)
	useEffect(() => {
		if (planId) {
			const selectedPlan = plans.find((p: any) => p.id === planId);
			if (selectedPlan && !priceBreakdown?.voucherName) {
				setPriceBreakdown({
					planPrice: Number(selectedPlan.priceBdt),
					discountAmount: 0,
					finalPrice: Number(selectedPlan.priceBdt),
				});
			}
		}
	}, [planId, plans, priceBreakdown?.voucherName]);

	useEffect(() => {
		setBreadcrumbs([
			{ label: "Dashboard", href: PATHS.DASHBOARD },
			{ label: "Schools", href: PATHS.SCHOOLS_MANAGEMENT.SCHOOLS.ROOT },
			{ label: "Activate & Payment" },
		]);
	}, [setBreadcrumbs]);

	const handleVerifyVoucher = async () => {
		if (!planId) {
			toast.error("Please select a subscription plan first");
			return;
		}
		if (!voucherCode || voucherCode === "none") {
			toast.error("Please enter or select a voucher code");
			return;
		}

		setIsVerifying(true);
		try {
			const res = await verifyVoucher({ schoolId: id, planId, voucherCode });
			setPriceBreakdown(res.data);
			toast.success(res.message || "Voucher applied successfully");
		} catch (error: any) {
			setPriceBreakdown(null);
			// Error handled by global interceptor
		} finally {
			setIsVerifying(false);
		}
	};

	const handleRemoveVoucher = () => {
		form.setValue("voucherCode", "none");
		const selectedPlan = plans.find((p: any) => p.id === planId);
		if (selectedPlan) {
			setPriceBreakdown({
				planPrice: Number(selectedPlan.priceBdt),
				discountAmount: 0,
				finalPrice: Number(selectedPlan.priceBdt),
			});
		}
	};

	const onSubmit = async (data: PaymentFormValues) => {
		setIsSubmitting(true);
		try {
			await purchasePlan({
				schoolId: id,
				planId: data.planId,
				voucherCode: data.voucherCode === "none" ? undefined : data.voucherCode,
				transactionId: data.transactionId?.trim() || undefined,
				method: data.method,
			});
			toast.success("Payment completed and school activated successfully");
			mutate((key: any) => typeof key === "string" && key.startsWith("/superadmin/schools"));
			router.push(PATHS.SCHOOLS_MANAGEMENT.SCHOOLS.ROOT);
		} catch (error: any) {
			// error handled by axios interceptor
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoadingSchool || isLoadingPlans || isLoadingVouchers) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="text-primary h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!school || school.status !== "pending") {
		return (
			<div className="flex h-64 flex-col items-center justify-center gap-4">
				<p className="text-destructive font-medium">
					This school is either not found or already activated.
				</p>
				<Button onClick={() => router.push(PATHS.SCHOOLS_MANAGEMENT.SCHOOLS.ROOT)}>
					Go Back to Schools
				</Button>
			</div>
		);
	}

	return (
		<div className="@container/page mx-auto max-w-3xl">
			<div className="mb-6">
				<h1 className="text-3xl font-bold">Activate School</h1>
				<p className="text-muted-foreground">
					Select a subscription plan and process payment for{" "}
					<span className="text-foreground font-semibold">{school.schoolName}</span>
				</p>
			</div>

			<FormProvider {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Plan Selection</CardTitle>
							<CardDescription>
								Choose the appropriate subscription plan
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<InputField
								control={form.control}
								name="planId"
								type="select"
								label="Subscription Plan *"
								placeholder="Select a plan"
								options={plans.map((p: any) => ({
									value: p.id,
									label: `${p.name} - ৳${p.priceBdt} / ${p.billingCycle}`,
								}))}
							/>

							<div className="flex flex-col items-end gap-4 sm:flex-row">
								<div className="w-full flex-1">
									<InputField
										control={form.control}
										name="voucherCode"
										type="select"
										label="Voucher Code (Optional)"
										placeholder="Select or type voucher"
										disabled={!planId}
										options={[
											{ value: "none", label: "No Voucher" },
											...vouchers.map((v: any) => ({
												value: v.code,
												label: `${v.code} - ${v.name} (${v.maxRedemptions ? `Quota: ${v.maxRedemptions - v.currentRedemptions} left` : "Unlimited"} ${v.expiresAt ? `| Expires: ${new Date(v.expiresAt).toLocaleDateString()}` : ""})`,
											})),
										]}
									/>
								</div>
								{priceBreakdown?.voucherName ? (
									<Button
										type="button"
										variant="destructive"
										size="lg"
										onClick={handleRemoveVoucher}
									>
										Remove Voucher
									</Button>
								) : (
									<Button
										type="button"
										variant="secondary"
										className="mb-[2px]"
										onClick={handleVerifyVoucher}
										disabled={!voucherCode || voucherCode === "none" || isVerifying}
									>
										{isVerifying && (
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										)}
										Apply Voucher
									</Button>
								)}
							</div>

							{/* Price Breakdown */}
							{priceBreakdown && (
								<div className="bg-secondary/20 border-secondary mt-4 rounded-md border p-4">
									<h4 className="mb-2 font-semibold">Price Summary</h4>
									<div className="mb-1 flex justify-between text-sm">
										<span>Plan Price:</span>
										<span>৳{priceBreakdown.planPrice.toFixed(2)}</span>
									</div>
									{priceBreakdown.discountAmount > 0 && (
										<div className="mb-1 flex justify-between text-sm text-green-600">
											<span>Discount ({priceBreakdown.voucherName}):</span>
											<span>
												-৳{priceBreakdown.discountAmount.toFixed(2)}
											</span>
										</div>
									)}
									<div className="mt-2 flex justify-between border-t pt-2 text-lg font-bold">
										<span>Total Payable:</span>
										<span>৳{priceBreakdown.finalPrice.toFixed(2)}</span>
									</div>
								</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Payment Details</CardTitle>
							<CardDescription>
								Enter the manual payment transaction details
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<InputField
								control={form.control}
								name="method"
								type="select"
								label="Payment Method *"
								placeholder="Select payment method"
								options={[
									{ value: "cash", label: "Cash" },
									{ value: "bank_transfer", label: "Bank Transfer" },
									{
										value: "mobile_banking",
										label: "Mobile Banking (bKash/Nagad)",
									},
									{ value: "credit_card", label: "Credit Card" },
								]}
							/>

							<InputField
								control={form.control}
								name="transactionId"
								type="text"
								label="Transaction ID / Reference *"
								placeholder="Enter TXN ID"
							/>
						</CardContent>
						<CardFooter className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.push(PATHS.SCHOOLS_MANAGEMENT.SCHOOLS.ROOT)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting || !priceBreakdown}>
								{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Confirm Payment & Activate
							</Button>
						</CardFooter>
					</Card>
				</form>
			</FormProvider>
		</div>
	);
}
