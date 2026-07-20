import { StatusEnum } from "@/shared/types/enums";
import { z } from "zod";

export const sectionSchema = z.object({
	name: z.string().min(1, { message: "Section name is required" }),
	bnName: z.string().optional(),
	code: z.string().optional(),
	sortOrder: z.coerce.number().int().min(0).optional(),
	status: z.nativeEnum(StatusEnum),
});

export type SectionFormValues = z.infer<typeof sectionSchema>;
