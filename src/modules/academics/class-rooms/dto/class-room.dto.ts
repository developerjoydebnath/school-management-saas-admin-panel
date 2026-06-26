import { StatusEnum } from "@/shared/types/enums";
import { z } from "zod";

const optionalNumber = z.coerce.number().int().min(0).optional();

export const classRoomSchema = z.object({
	name: z.string().min(1, { message: "Room name is required" }),
	roomNo: z.string().min(1, { message: "Room number is required" }),
	capacity: z.coerce.number().int().min(1, { message: "Capacity is required" }),
	floor: z.string().optional(),
	building: z.string().optional(),
	highBench: optionalNumber,
	lowBench: optionalNumber,
	chair: optionalNumber,
	table: optionalNumber,
	board: optionalNumber,
	projector: optionalNumber,
	fan: optionalNumber,
	light: optionalNumber,
	hasAc: z.boolean().default(false),
	hasCctv: z.boolean().default(false),
	status: z.nativeEnum(StatusEnum),
	description: z.string().optional(),
});

export type ClassRoomFormValues = z.infer<typeof classRoomSchema>;
