import { z } from "zod";

export const departmentSchema = z.object({
	name: z.string().min(1, "Name is required").max(100),
	nameBn: z.string().max(100).optional().nullable(),
	headTeacherId: z.string().optional().nullable(),
	description: z.string().optional().nullable(),
	isActive: z.union([z.boolean(), z.string()]).transform((val) => val === true || val === "true").optional().default(true),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;

export type Department = DepartmentFormValues & {
	id: string;
	createdAt: string;
	updatedAt: string;
	headTeacher?: {
		id: string;
		firstName: string;
		lastName?: string;
		name?: string;
	} | null;
};
