import { z } from "zod";

export const MOVEMENT_TYPES = [
	"PURCHASE",
	"TRANSFER",
	"ISSUE",
	"RETURN",
	"ADJUSTMENT",
	"DAMAGE",
	"REPAIR_OUT",
	"REPAIR_IN",
	"DISPOSE",
	"LOST",
] as const;

export type MovementType = (typeof MOVEMENT_TYPES)[number];

export const movementSchema = z.object({
	itemId: z.string().uuid("Item is required"),
	assetId: z.string().uuid().optional().or(z.literal("")),
	stockBatchId: z.string().uuid().optional().or(z.literal("")),
	fromLocationId: z.string().uuid().optional().or(z.literal("")),
	toLocationId: z.string().uuid().optional().or(z.literal("")),
	movementType: z.enum(MOVEMENT_TYPES),
	quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
	referenceNo: z.string().optional(),
	notes: z.string().optional(),
});

export type MovementFormValues = z.infer<typeof movementSchema>;
