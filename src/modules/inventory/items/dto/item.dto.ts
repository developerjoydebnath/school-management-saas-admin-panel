import { z } from "zod";

export enum inventoryTrackingTypeEnum {
	QUANTITY = "QUANTITY",
	INDIVIDUAL = "INDIVIDUAL",
}

export const itemSchema = z.object({
	categoryId: z.string().min(1, "Category is required"),
	name: z.string().min(1, "Item name is required"),
	nameBn: z.string().optional(),
	code: z.string().optional(),
	brand: z.string().optional(),
	model: z.string().optional(),
	description: z.string().optional(),
	trackingType: z.enum([inventoryTrackingTypeEnum.QUANTITY, inventoryTrackingTypeEnum.INDIVIDUAL]).optional(),
	unit: z.string().optional(),
	material: z.string().optional(),
	length: z.coerce.number().optional(),
	width: z.coerce.number().optional(),
	height: z.coerce.number().optional(),
	depth: z.coerce.number().optional(),
	dimensionUnit: z.string().optional(),
	weight: z.coerce.number().optional(),
	weightUnit: z.string().optional(),
	seatingCapacity: z.coerce.number().optional(),
	isSeatingItem: z.boolean().optional(),
	isDepreciable: z.boolean().optional(),
	depreciationRate: z.coerce.number().optional(),
	usefulLifeYears: z.coerce.number().optional(),
	minimumStock: z.coerce.number().optional(),
	isActive: z.boolean().optional(),
});

export type ItemFormValues = z.infer<typeof itemSchema>;
