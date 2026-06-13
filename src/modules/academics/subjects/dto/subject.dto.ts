import { StatusEnum, SubjectTypeEnum } from "@/shared/types/enums";
import { z } from "zod";

export const subjectSchema = z.object({
	name: z.object({
		en: z.string().min(1, { message: "English subject name is required" }),
		bn: z.string().min(1, { message: "Bangla subject name is required" }),
	}),
	code: z.string().optional(),
	type: z.nativeEnum(SubjectTypeEnum),
	status: z.nativeEnum(StatusEnum),
	classes: z.array(z.string()).optional(),
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;
