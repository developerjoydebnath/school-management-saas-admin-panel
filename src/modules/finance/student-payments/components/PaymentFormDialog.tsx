"use client";

import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import { useSWR } from "@/shared/hooks/use-swr";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
	CreateStudentPaymentPayload,
	PAYMENT_PURPOSE_OPTIONS,
	StudentPaymentDetails,
	UpdateStudentPaymentPayload,
} from "../dto/student-payment.dto";
import { createStudentPayment, updateStudentPayment } from "../hooks/use-student-payment-mutations";
import StudentPaymentCombobox, { StudentPaymentOption } from "./StudentPaymentCombobox";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "edit";
	initialData?: StudentPaymentDetails | null;
	onSuccess?: () => void;
};

// Purposes that bill against a recurring period rather than a one-off charge
// — the backend requires billingPeriod for these and doesn't accept it for
// admission_fee / other.
const PURPOSES_REQUIRING_BILLING_PERIOD = new Set([
	"tuition_fee",
	"exam_fee",
	"transport_fee",
	"library_fee",
	"hostel_fee",
]);

const todayStr = () => new Date().toISOString().slice(0, 10);

type PaymentFormState = {
	studentId: string;
	studentLabel: string;
	purpose: string;
	billingPeriod: string;
	paymentMethod: string;
	amount: string;
	requiredAmount: string;
	paidAt: string;
	transactionId: string;
	note: string;
};

function buildDefaults(initialData: StudentPaymentDetails | null | undefined): PaymentFormState {
	return {
		studentId: initialData?.student?.id || "",
		studentLabel: initialData?.studentName || "",
		purpose: initialData?.purpose || "",
		billingPeriod: initialData?.billingPeriod || "",
		paymentMethod: initialData?.paymentMethod || "",
		amount: initialData ? String(initialData.paidAmount ?? "") : "",
		requiredAmount:
			initialData?.requiredAmount != null ? String(initialData.requiredAmount) : "",
		paidAt: initialData?.paidAt ? initialData.paidAt.slice(0, 10) : todayStr(),
		transactionId: initialData?.transactionId || "",
		note: initialData?.notes || "",
	};
}

const listFromResponse = (response: any) => {
	if (Array.isArray(response?.data)) return response.data;
	if (Array.isArray(response)) return response;
	return [];
};

export default function PaymentFormDialog({
	open,
	onOpenChange,
	mode,
	initialData,
	onSuccess,
}: Props) {
	const isEdit = mode === "edit";
	const [form, setForm] = useState<PaymentFormState>(() => buildDefaults(initialData));
	const [isSubmitting, setIsSubmitting] = useState(false);

	// The dialog instance is reused across every row's edit click (and for a
	// fresh "add payment"), so its state must reset whenever the target
	// record or open state changes — otherwise it would keep showing
	// whatever was last edited.
	useEffect(() => {
		if (!open) return;
		setForm(buildDefaults(initialData));
	}, [open, initialData]);

	const needsBillingPeriod = PURPOSES_REQUIRING_BILLING_PERIOD.has(form.purpose);

	// Plain <select>s here, not the shared SessionSelect or the portalled
	// Select from ui/select: those render Radix's portalled popover, which
	// reads a click on its own content as a click "outside" this Dialog and
	// closes the whole dialog instead of just the select — see
	// agent-os/standards/javascript/components.md ("Dialog & Sheet Selection
	// Rule"). Session/class/section aren't asked for here at all — the
	// selected student already has that on file, the backend derives it.
	const { data: methodsRes } = useSWR("/settings/payment-methods/active-options");
	const paymentMethods = listFromResponse(methodsRes);

	const handleStudentChange = (value: string, option?: StudentPaymentOption) => {
		setForm((current) => ({
			...current,
			studentId: value,
			studentLabel: option?.label || "",
		}));
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!form.studentId) {
			toast.error("Select a student");
			return;
		}
		if (!form.purpose) {
			toast.error("Select a purpose");
			return;
		}
		if (needsBillingPeriod && !form.billingPeriod) {
			toast.error("Billing period is required for this purpose");
			return;
		}
		if (!form.paymentMethod) {
			toast.error("Select a payment method");
			return;
		}
		if (!Number(form.amount) || Number(form.amount) < 1) {
			toast.error("Amount must be at least 1");
			return;
		}

		setIsSubmitting(true);
		try {
			if (isEdit && initialData) {
				// PATCH only accepts these fields (not studentId — a payment
				// can't be reassigned to a different student).
				const payload: UpdateStudentPaymentPayload = {
					purpose: form.purpose,
					billingPeriod: needsBillingPeriod ? form.billingPeriod : undefined,
					paymentMethod: form.paymentMethod,
					amount: Number(form.amount),
					requiredAmount: form.requiredAmount ? Number(form.requiredAmount) : undefined,
					paidAt: form.paidAt || undefined,
					transactionId: form.transactionId || undefined,
					notes: form.note || undefined,
				};
				await updateStudentPayment(initialData.id, payload);
				toast.success("Payment updated successfully.");
			} else {
				const payload: CreateStudentPaymentPayload = {
					studentId: form.studentId,
					purpose: form.purpose,
					billingPeriod: needsBillingPeriod ? form.billingPeriod : undefined,
					paymentMethod: form.paymentMethod,
					amount: Number(form.amount),
					requiredAmount: form.requiredAmount ? Number(form.requiredAmount) : undefined,
					paidAt: form.paidAt || undefined,
					transactionId: form.transactionId || undefined,
					notes: form.note || undefined,
				};
				await createStudentPayment(payload);
				toast.success("Payment recorded successfully.");
			}
			onSuccess?.();
			onOpenChange(false);
		} finally {
			// On failure we deliberately do not catch/toast here — the global
			// axios interceptor (@/shared/lib/axios) already shows a toast for
			// every error response, so we just let it throw and reset the
			// submitting flag.
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[85vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
				<DialogHeader className="shrink-0 border-b px-6 py-5">
					<DialogTitle>{isEdit ? "Edit Payment" : "Add Payment"}</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Update this manually recorded student payment."
							: "Record a cash-on-hand or other manual student payment."}
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
					<div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
							<div className="flex flex-col gap-2 sm:col-span-2">
								<Label className="text-muted-foreground text-sm font-medium">
									Student <span className="text-destructive">*</span>
								</Label>
								<StudentPaymentCombobox
									value={form.studentId}
									onChange={handleStudentChange}
									disabled={isEdit}
									selectedLabel={form.studentLabel}
									placeholder="Search and select a student"
								/>
							</div>

							<div className="flex flex-col gap-2">
								<Label className="text-muted-foreground text-sm font-medium">
									Purpose <span className="text-destructive">*</span>
								</Label>
								<NativeSelect
									value={form.purpose}
									onChange={(event) =>
										setForm((current) => ({
											...current,
											purpose: event.target.value,
											billingPeriod: PURPOSES_REQUIRING_BILLING_PERIOD.has(event.target.value)
												? current.billingPeriod
												: "",
										}))
									}
								>
									<NativeSelectOption value="">Select purpose</NativeSelectOption>
									{PAYMENT_PURPOSE_OPTIONS.map((option) => (
										<NativeSelectOption key={option.value} value={option.value}>
											{option.label}
										</NativeSelectOption>
									))}
								</NativeSelect>
							</div>

							{needsBillingPeriod && (
								<div className="flex flex-col gap-2">
									<Label className="text-muted-foreground text-sm font-medium">
										Billing Period <span className="text-destructive">*</span>
									</Label>
									<Input
										type="month"
										required
										value={form.billingPeriod}
										onChange={(event) =>
											setForm((current) => ({ ...current, billingPeriod: event.target.value }))
										}
										className="h-10 w-full"
									/>
								</div>
							)}

							<div className="flex flex-col gap-2">
								<Label className="text-muted-foreground text-sm font-medium">
									Payment Method <span className="text-destructive">*</span>
								</Label>
								<NativeSelect
									value={form.paymentMethod}
									onChange={(event) =>
										setForm((current) => ({ ...current, paymentMethod: event.target.value }))
									}
								>
									<NativeSelectOption value="">Select payment method</NativeSelectOption>
									{paymentMethods.map((method: any) => (
										<NativeSelectOption key={method.value} value={method.value}>
											{method.label}
										</NativeSelectOption>
									))}
								</NativeSelect>
							</div>

							<div className="flex flex-col gap-2">
								<Label className="text-muted-foreground text-sm font-medium">
									Amount <span className="text-destructive">*</span>
								</Label>
								<Input
									type="number"
									min={1}
									required
									value={form.amount}
									onChange={(event) =>
										setForm((current) => ({ ...current, amount: event.target.value }))
									}
									placeholder="Enter amount"
									className="h-10 w-full"
								/>
							</div>

							<div className="flex flex-col gap-2">
								<Label className="text-muted-foreground text-sm font-medium">
									Required Amount
								</Label>
								<Input
									type="number"
									min={0}
									value={form.requiredAmount}
									onChange={(event) =>
										setForm((current) => ({ ...current, requiredAmount: event.target.value }))
									}
									placeholder="Defaults to Amount if left blank"
									className="h-10 w-full"
								/>
							</div>

							<div className="flex flex-col gap-2">
								<Label className="text-muted-foreground text-sm font-medium">Paid At</Label>
								<Input
									type="date"
									value={form.paidAt}
									onChange={(event) =>
										setForm((current) => ({ ...current, paidAt: event.target.value }))
									}
									className="h-10 w-full"
								/>
							</div>

							<div className="flex flex-col gap-2">
								<Label className="text-muted-foreground text-sm font-medium">
									Transaction ID
								</Label>
								<Input
									value={form.transactionId}
									onChange={(event) =>
										setForm((current) => ({ ...current, transactionId: event.target.value }))
									}
									placeholder="Enter transaction ID"
									className="h-10 w-full"
								/>
							</div>

							<div className="flex flex-col gap-2 sm:col-span-2">
								<Label className="text-muted-foreground text-sm font-medium">Note</Label>
								<Input
									value={form.note}
									onChange={(event) =>
										setForm((current) => ({ ...current, note: event.target.value }))
									}
									placeholder="Optional payment note"
									className="h-10 w-full"
								/>
							</div>
						</div>
					</div>

					<DialogFooter className="shrink-0 border-t px-6 py-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? (isEdit ? "Updating..." : "Saving...") : isEdit ? "Update" : "Save"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
