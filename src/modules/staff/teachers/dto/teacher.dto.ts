import { StatusEnum } from "@/shared/types/enums";
import { z } from "zod";

export const teacherSchema = z.object({
	name: z.object({
		en: z.string().min(1, { message: "English name is required" }),
		bn: z.string().min(1, { message: "Bangla name is required" }),
	}),
	mobile: z.string().min(1, { message: "Mobile number is required" }),
	email: z.email({ message: "Invalid email address" }),
	address: z.string().min(1, { message: "Address is required" }),
	subjects: z.array(z.string()).min(1, { message: "At least one subject must be selected" }),
	status: z.enum(StatusEnum),
});

export type TeacherFormValues = z.infer<typeof teacherSchema>;
