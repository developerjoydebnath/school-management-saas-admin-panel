import { z } from "zod";

export const shiftSchema = z.object({
	name: z.string().min(1, { message: "Shift name is required" }),
	startTime: z.string().min(1, { message: "Start time is required" }),
	endTime: z.string().min(1, { message: "End time is required" }),
	status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type ShiftFormValues = z.infer<typeof shiftSchema>;
