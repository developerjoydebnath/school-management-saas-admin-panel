import { z } from "zod";

export const incidentSchema = z.object({
	studentId: z.string().min(1, { message: "Student ID is required" }),
	type: z.string().min(1, { message: "Type is required" }),
	date: z.string().min(1, { message: "Date is required" }),
	category: z.string().min(1, { message: "Category is required" }),
	actionTaken: z.string().min(1, { message: "Action taken is required" }),
	remarks: z.string().optional(),
	guardianCallRequired: z.boolean().optional(),
});

export type IncidentFormValues = z.infer<typeof incidentSchema>;
