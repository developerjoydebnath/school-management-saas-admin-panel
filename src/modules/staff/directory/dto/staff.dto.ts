import { StatusEnum } from "@/shared/types/enums";
import { z } from "zod";

export const staffSchema = z.object({
	name: z.object({
		en: z.string().min(1, { message: "English name is required" }),
		bn: z.string().min(1, { message: "Bangla name is required" }),
	}),
	staffId: z.string().min(1, { message: "Staff ID is required" }),
	department: z.string().min(1, { message: "Department is required" }),
	role: z.string().min(1, { message: "Role is required" }),
	status: z.enum(StatusEnum),
});

export type StaffFormValues = z.infer<typeof staffSchema>;
