import { StatusEnum } from "@/shared/types/enums";
import { z } from "zod";

export const shiftSchema = z.object({
	name: z.string().min(1, { message: "Shift name is required" }),
	startTime: z.string().min(1, { message: "Start time is required" }),
	endTime: z.string().min(1, { message: "End time is required" }),
	status: z.nativeEnum(StatusEnum, { message: "Status is required" }),
});

export type ShiftFormValues = z.infer<typeof shiftSchema>;
