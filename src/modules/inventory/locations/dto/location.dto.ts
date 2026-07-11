import { z } from "zod";

export const LOCATION_TYPES = [
	"CLASSROOM",
	"LAB",
	"LIBRARY",
	"OFFICE",
	"STAFFROOM",
	"SPORTS_ROOM",
	"MOSQUE_ROOM",
	"STORE",
	"CANTEEN",
	"COMMON_AREA",
	"OTHER",
] as const;

export const locationSchema = z.object({
	name: z.string().min(1, "Location name is required"),
	code: z.string().optional(),
	classRoomId: z.string().optional(),
	description: z.string().optional(),
	locationType: z.enum(LOCATION_TYPES).default("STORE"),
	status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type LocationFormValues = z.infer<typeof locationSchema>;
