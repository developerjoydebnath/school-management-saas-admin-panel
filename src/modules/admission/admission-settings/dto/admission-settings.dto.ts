import { z } from "zod";

export const customFieldSchema = z.object({
	label: z.string().min(1, "Label is required"),
	category: z.enum([
		"student_info",
		"parent_info",
		"guardian_info",
		"address",
		"academic_info",
		"documents",
		"health_info",
		"payment",
		"additional_info",
	]),
	type: z.enum(["text", "number", "date", "select", "textarea", "checkbox", "phone", "file"]),
	isStep1: z.boolean(),
});

export type CustomFieldFormValues = z.infer<typeof customFieldSchema>;

export const feeHeadSchema = z.object({
	name: z.string().min(1, "Fee head name is required"),
	nameBn: z.string().optional(),
	type: z.enum(["one_time", "monthly", "yearly"]),
	amount: z.coerce.number().min(0, "Amount must be 0 or greater"),
	isRequired: z.boolean(),
});

export type FeeHeadFormValues = z.infer<typeof feeHeadSchema>;
