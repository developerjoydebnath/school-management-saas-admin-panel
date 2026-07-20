import { StatusEnum } from "@/shared/types/enums";
import { z } from "zod";

export const classSchema = z.object({
	enName: z.string().min(1, { message: "English class name is required" }),
	bnName: z.string().optional(),
	status: z.nativeEnum(StatusEnum),
});

export type ClassFormValues = z.infer<typeof classSchema>;
