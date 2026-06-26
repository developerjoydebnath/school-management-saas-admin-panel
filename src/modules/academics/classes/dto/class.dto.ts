import { StatusEnum } from "@/shared/types/enums";
import { z } from "zod";

export const sectionSchema = z.object({
	name: z.string().min(1, { message: "Section name is required" }),
	classRoomId: z.string().min(1, { message: "Class room is required" }),
	shiftId: z.string().min(1, { message: "Shift is required" }),
});

export const classSchema = z
	.object({
		enName: z.string().min(1, { message: "English class name is required" }),
		bnName: z.string().optional(),
		sections: z.array(sectionSchema).default([]),
		classRoomId: z.string().optional(),
		shiftId: z.string().optional(),
		status: z.nativeEnum(StatusEnum),
	})
	.superRefine((data, ctx) => {
		if (data.sections.length > 0) return;

		if (!data.classRoomId) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Class room is required",
				path: ["classRoomId"],
			});
		}

		if (!data.shiftId) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Shift is required",
				path: ["shiftId"],
			});
		}
	});

export type ClassFormValues = z.infer<typeof classSchema>;
