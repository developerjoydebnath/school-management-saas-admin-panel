import { z } from "zod";

export const designationSchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	nameBn: z.string().max(100).optional().nullable(),
	category: z.string().min(1, "Category is required").max(50),
	applicableTo: z.array(z.string()).min(1, "At least one applicable group is required"),
	level: z.coerce.number().min(0).optional().default(0),
	isHeadRole: z.boolean().optional().default(false),
	isSystem: z.boolean().optional().default(true),
	isActive: z.union([z.boolean(), z.string()]).transform((val) => val === true || val === "true").optional().default(true),
});

export type DesignationFormValues = z.infer<typeof designationSchema>;

export type Designation = DesignationFormValues & {
	id: string;
	createdAt: string;
	updatedAt: string;
};
