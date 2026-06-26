import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
	value === "" || value === null ? undefined : value;
const optionalString = z.preprocess(emptyToUndefined, z.string().optional());

export enum paymentStatusEnum {
	PENDING = "pending",
	COMPLETED = "completed",
	FAILED = "failed",
	REFUNDED = "refunded",
}

export enum paymentMethodEnum {
	CASH = "cash",
	BANK_TRANSFER = "bank_transfer",
	CREDIT_CARD = "credit_card",
	MOBILE_BANKING = "mobile_banking",
	OTHER = "other",
}

export const paymentSchema = z.object({
	schoolId: z.string().min(1, "School is required").optional(),
	subscriptionId: z.string().min(1, "Subscription is required"),
	voucherCode: optionalString,
	billingCycles: z.coerce
		.number()
		.int("Months must be a whole number")
		.min(1, "Months must be at least 1")
		.max(60, "Months must be 60 or less")
		.default(1),
	transactionId: optionalString,
	invoiceId: optionalString,
	amount: z.coerce.number().min(0, "Amount must be 0 or more"),
	currency: z.string().min(1).max(3).default("BDT"),
	status: z.enum(paymentStatusEnum).default(paymentStatusEnum.COMPLETED),
	method: z.enum(paymentMethodEnum),
	paidAt: optionalString,
	notes: optionalString,
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
