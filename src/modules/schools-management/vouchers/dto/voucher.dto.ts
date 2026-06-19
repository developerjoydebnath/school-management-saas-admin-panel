import { z } from "zod";

export const voucherSchema = z.object({
	code: z.string().min(1, "Voucher code is required").max(50),
	name: z.string().min(1, "Name is required").max(100),
	description: z.string().optional().nullable(),
	discountType: z.enum(["percentage", "fixed_amount"]),
	discountValue: z.coerce.number().min(0, "Must be positive"),
	maxDiscountBdt: z.coerce.number().min(0).optional().nullable(),
	maxRedemptions: z.coerce.number().int().min(1).optional().nullable(),
	onePerSchool: z.boolean().default(true),
	durationCycles: z.coerce.number().int().min(1).optional().nullable(),
	applicablePlanIds: z.array(z.string()).default([]),
	minimumBillBdt: z.coerce.number().min(0).optional().nullable(),
	validFrom: z.string().optional(),
	expiresAt: z.string().optional().nullable(),
	isActive: z.boolean().default(true),
	notes: z.string().optional().nullable(),
});

export type VoucherFormValues = z.infer<typeof voucherSchema>;
