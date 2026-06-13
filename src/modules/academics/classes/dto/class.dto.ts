import { StatusEnum } from "@/shared/types/enums";
import { z } from "zod";

export const sectionSchema = z.object({
	name: z.string().min(1, { message: "Section name is required" }),
	capacity: z.number().min(1, { message: "Capacity is required" }),
	roomNumber: z.string().min(1, { message: "Room number is required" }),
	shift: z.string().min(1, { message: "Shift is required" }),
});

export const classSchema = z.object({
	name: z.object({
		en: z.string().min(1, { message: "English class name is required" }),
		bn: z.string().min(1, { message: "Bangla class name is required" }),
	}),
	sections: z.array(sectionSchema),
	capacity: z.number().optional(),
	roomNumber: z.string().optional(),
	shift: z.string().optional(),
	status: z.nativeEnum(StatusEnum),
});

export type ClassFormValues = z.infer<typeof classSchema>;
