import { z } from "zod";

const emptyToUndefined = (value: unknown) => {
	if (typeof value !== "string") return value;
	const trimmed = value.trim();
	return trimmed || undefined;
};

export const parentProfileSchema = z.object({
	firstName: z.string().trim().min(1, "First name is required").max(255),
	lastName: z.preprocess(emptyToUndefined, z.string().max(255).optional()),
	phone: z
		.string()
		.trim()
		.min(1, "Mobile number is required")
		.regex(/^(?:\+?88)?01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number"),
	email: z.preprocess(
		emptyToUndefined,
		z.string().trim().email("Enter a valid email address").max(255).optional()
	),
});

export type ParentProfileFormValues = z.infer<typeof parentProfileSchema>;
