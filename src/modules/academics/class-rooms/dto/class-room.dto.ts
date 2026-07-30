import { StatusEnum } from "@/shared/types/enums";
import { z } from "zod";

const optionalDimension = z.preprocess(
	(value) => (value === "" || value === null || value === undefined ? undefined : Number(value)),
	z.number().min(0).optional()
);

export const classRoomSchema = z.object({
	name: z.string().min(1, { message: "Room name is required" }),
	roomNo: z.string().min(1, { message: "Room number is required" }),
	capacity: z.coerce.number().int().min(1, { message: "Capacity is required" }),
	roomLength: optionalDimension,
	roomWidth: optionalDimension,
	dimensionUnit: z.enum(["feet", "meter"]).default("feet"),
	floor: z.string().optional(),
	building: z.string().optional(),
	status: z.nativeEnum(StatusEnum),
	description: z.string().optional(),
	layoutConfig: z.any().optional(),
});

export type ClassRoomFormValues = z.infer<typeof classRoomSchema>;
