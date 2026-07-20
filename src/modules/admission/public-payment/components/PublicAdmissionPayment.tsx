"use client";

import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import axios from "@/shared/lib/axios";
import { AlertCircle, CheckCircle2, CreditCard, Loader2, School } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type PaymentMethod = {
	label: string;
	value: string;
	id?: string;
	provider?: string;
	mode?: string;
};

type PaymentDetails = {
	application: {
		id: string;
		applicationNo?: string;
		studentName?: string;
		studentNameEn?: string;
		className?: string;
		sectionName?: string;
		status?: string;
		paymentStatus?: string;
	};
	fee: {
		requiredTotal: number;
		discount: number;
		discountAmount?: number;
		totalDiscount?: number;
		payable: number;
		payableAmount?: number;
		alreadyPaid: number;
		dueAmount: number;
	};
	paymentMethods: PaymentMethod[];
};

function unwrap<T>(response: any): T {
	return (response?.data?.data ?? response?.data) as T;
}

function today() {
	return new Date().toISOString().slice(0, 10);
}

function money(value: unknown) {
	return `BDT ${Number(value || 0).toLocaleString("en-BD")}`;
}

function paymentMethodText(method?: PaymentMethod) {
	if (!method) return "";
	return [method.label, method.mode ? `Mode: ${method.mode}` : ""]
		.filter(Boolean)
		.join(" - ");
}

export default function PublicAdmissionPayment({
	slug,
	tenant,
	applicationId,
	resultStatus,
}: {
	slug: string;
	tenant?: string;
	applicationId: string;
	resultStatus?: string;
}) {
	const [details, setDetails] = useState<PaymentDetails | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState("");
	const [amount, setAmount] = useState("");
	const [paidAt, setPaidAt] = useState(today());
	const [transactionId, setTransactionId] = useState("");
	const [note, setNote] = useState("");

	const requestConfig = useMemo(
		() =>
			tenant
				? {
						headers: {
							"x-tenant-slug": tenant,
						},
					}
				: undefined,
		[tenant]
	);

	useEffect(() => {
		if (!slug || !applicationId) {
			setIsLoading(false);
			return;
		}
		let mounted = true;
		setIsLoading(true);
		axios
			.get(`/public/admission/${slug}/payments/${applicationId}`, requestConfig)
			.then((response) => {
				if (!mounted) return;
				const data = unwrap<PaymentDetails>(response);
				setDetails(data);
				const firstMethod = data.paymentMethods?.[0]?.value || "";
				setPaymentMethod(firstMethod);
				setAmount(String(data.fee?.dueAmount ?? data.fee?.payable ?? ""));
			})
			.catch((error: any) => {
				toast.error(error?.response?.data?.message || "Unable to load payment link");
			})
			.finally(() => {
				if (mounted) setIsLoading(false);
			});
		return () => {
			mounted = false;
		};
	}, [slug, applicationId, requestConfig]);

	const selectedMethod = details?.paymentMethods?.find(
		(method) => method.value === paymentMethod
	);
	const numericAmount = Number(amount || 0);
	const dueAmount = Number(details?.fee?.dueAmount || 0);

	const submitPayment = async () => {
		if (!paymentMethod) {
			toast.error("Select a payment method");
			return;
		}
		if (!numericAmount || numericAmount <= 0) {
			toast.error("Enter a valid payment amount");
			return;
		}
		if (numericAmount > dueAmount) {
			toast.error("Payment amount cannot be greater than due amount");
			return;
		}

		setIsSubmitting(true);
		try {
			const response = await axios.post(
				`/public/admission/${slug}/payments/${applicationId}`,
				{
					paymentMethod,
					amount: numericAmount,
					paidAt,
					transactionId,
					note,
				},
				requestConfig
			);
			const data = unwrap<{ redirectUrl?: string }>(response);
			if (data?.redirectUrl) {
				window.location.href = data.redirectUrl;
				return;
			}
			setIsSubmitted(true);
			toast.success("Payment information submitted successfully");
		} catch (error: any) {
			toast.error(error?.response?.data?.message || "Failed to submit payment");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!slug || !applicationId) {
		return (
			<div className="mx-auto flex min-h-screen max-w-3xl items-center p-6">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Payment link is incomplete</AlertTitle>
					<AlertDescription>
						Open the payment link sent by the school admission office.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="mx-auto max-w-5xl space-y-4 p-6">
				<Skeleton className="h-36 rounded-lg" />
				<div className="grid gap-4 md:grid-cols-3">
					<Skeleton className="h-28 rounded-lg" />
					<Skeleton className="h-28 rounded-lg" />
					<Skeleton className="h-28 rounded-lg" />
				</div>
				<Skeleton className="h-80 rounded-lg" />
			</div>
		);
	}

	if (!details) {
		return (
			<div className="mx-auto flex min-h-screen max-w-3xl items-center p-6">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Payment link unavailable</AlertTitle>
					<AlertDescription>
						This payment link is invalid, expired, or not ready for payment.
					</AlertDescription>
				</Alert>
			</div>
		);
	}

	if (isSubmitted) {
		return (
			<div className="mx-auto flex min-h-screen max-w-3xl items-center p-6">
				<Card className="w-full text-center shadow-none">
					<CardHeader>
						<div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10 text-green-600">
							<CheckCircle2 className="h-7 w-7" />
						</div>
						<CardTitle>Payment Submitted</CardTitle>
						<CardDescription>
							The school admission office will verify your payment and continue the
							approval process.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Badge variant="secondary">
							Application No: {details.application.applicationNo || details.application.id}
						</Badge>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (resultStatus && ["success", "failed", "cancelled"].includes(resultStatus)) {
		const isSuccess = resultStatus === "success";
		return (
			<div className="mx-auto flex min-h-screen max-w-3xl items-center p-6">
				<Card className="w-full text-center shadow-none">
					<CardHeader>
						<div
							className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${
								isSuccess ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
							}`}
						>
							{isSuccess ? (
								<CheckCircle2 className="h-7 w-7" />
							) : (
								<AlertCircle className="h-7 w-7" />
							)}
						</div>
						<CardTitle>
							{isSuccess ? "Payment Completed" : "Payment Not Completed"}
						</CardTitle>
						<CardDescription>
							{isSuccess
								? "Your admission payment was received. The school admission office will verify and continue the approval process."
								: "The payment was failed or cancelled. You can retry from the payment link when ready."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Badge variant="secondary">
							Application No: {details.application.applicationNo || details.application.id}
						</Badge>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
			<Card className="gap-0 overflow-hidden py-0 shadow-none">
				<CardHeader className="items-center border-b bg-card/80 py-8 text-center">
					<div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<School className="h-6 w-6 text-primary" />
					</div>
					<CardTitle className="text-2xl font-bold">Admission Payment</CardTitle>
					<CardDescription>
						Submit your admission payment information for school verification.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6 p-4 sm:p-6">
					<section className="grid gap-4 md:grid-cols-2">
						<div className="rounded-lg border p-4">
							<p className="text-muted-foreground text-sm">Applicant</p>
							<p className="font-semibold">
								{details.application.studentName ||
									details.application.studentNameEn ||
									"Admission Applicant"}
							</p>
							<p className="text-muted-foreground mt-1 text-sm">
								{details.application.applicationNo || details.application.id}
							</p>
						</div>
						<div className="rounded-lg border p-4">
							<p className="text-muted-foreground text-sm">Class</p>
							<p className="font-semibold">
								{details.application.className || "-"}
								{details.application.sectionName
									? ` - Section ${details.application.sectionName}`
									: ""}
							</p>
							<p className="text-muted-foreground mt-1 text-sm capitalize">
								Payment status: {details.application.paymentStatus || "pending"}
							</p>
						</div>
					</section>

					<section className="grid gap-4 md:grid-cols-4">
						<div className="rounded-lg border p-4">
							<p className="text-muted-foreground text-sm">Required Total</p>
							<p className="text-lg font-semibold">{money(details.fee.requiredTotal)}</p>
						</div>
						<div className="rounded-lg border p-4">
							<p className="text-muted-foreground text-sm">Discount</p>
							<p className="text-lg font-semibold">
								{money(
									details.fee.discount ??
										details.fee.discountAmount ??
										details.fee.totalDiscount ??
										0
								)}
							</p>
						</div>
						<div className="rounded-lg border p-4">
							<p className="text-muted-foreground text-sm">Already Paid</p>
							<p className="text-lg font-semibold">{money(details.fee.alreadyPaid)}</p>
						</div>
						<div className="rounded-lg border p-4">
							<p className="text-muted-foreground text-sm">Due Amount</p>
							<p className="text-lg font-semibold">{money(details.fee.dueAmount)}</p>
						</div>
					</section>

					<section className="rounded-lg border bg-card p-4 sm:p-5">
						<div className="mb-5 flex items-center gap-3 border-b pb-4">
							<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
								<CreditCard className="h-4 w-4" />
							</div>
							<div>
								<h2 className="font-semibold">Payment Information</h2>
								<p className="text-muted-foreground text-sm">
									Choose an active school payment method and submit the details.
								</p>
							</div>
						</div>

						{details.paymentMethods.length === 0 ? (
							<Alert>
								<AlertCircle className="h-4 w-4" />
								<AlertTitle>No active payment method</AlertTitle>
								<AlertDescription>
									Please contact the school admission office for payment instructions.
								</AlertDescription>
							</Alert>
						) : (
							<div className="grid gap-5 md:grid-cols-2">
								<div className="space-y-2">
									<Label>Payment Method</Label>
									<Select value={paymentMethod} onValueChange={setPaymentMethod}>
										<SelectTrigger>
											<SelectValue placeholder="Select payment method" />
										</SelectTrigger>
										<SelectContent>
											{details.paymentMethods.map((method) => (
												<SelectItem
													key={method.value}
													value={method.value}
													className="cursor-pointer py-2"
												>
													{paymentMethodText(method)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>Amount</Label>
									<Input
										type="number"
										min={1}
										max={dueAmount}
										value={amount}
										onChange={(event) => setAmount(event.target.value)}
										placeholder="Enter paid amount"
									/>
								</div>
								<div className="space-y-2">
									<Label>Payment Date</Label>
									<Input
										type="date"
										value={paidAt}
										onChange={(event) => setPaidAt(event.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label>Transaction ID</Label>
									<Input
										value={transactionId}
										onChange={(event) => setTransactionId(event.target.value)}
										placeholder={
											selectedMethod?.provider === "cash"
												? "Optional receipt or voucher number"
												: "Enter transaction ID"
										}
									/>
								</div>
								<div className="space-y-2 md:col-span-2">
									<Label>Payment Note</Label>
									<Input
										value={note}
										onChange={(event) => setNote(event.target.value)}
										placeholder="Optional payment note"
									/>
								</div>
								<div className="rounded-lg border bg-black p-4 md:col-span-2">
									<Button
										type="button"
										className="w-full"
										disabled={isSubmitting}
										onClick={submitPayment}
									>
										{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
										Submit Payment Information
									</Button>
								</div>
							</div>
						)}
					</section>
				</CardContent>
			</Card>
		</div>
	);
}
