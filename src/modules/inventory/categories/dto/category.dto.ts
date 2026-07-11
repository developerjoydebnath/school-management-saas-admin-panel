import { z } from "zod";

export const categorySchema = z.object({
	name: z.string().min(1, "Category name is required"),
	nameBn: z.string().optional(),
	slug: z.string().optional(),
	description: z.string().optional(),
	iconName: z.string().optional(),
	colorCode: z.string().optional(),
	isActive: z.boolean().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
