import { z } from "zod";

export enum inventoryTrackingTypeEnum {
	QUANTITY = "QUANTITY",
	INDIVIDUAL = "INDIVIDUAL",
}

export enum inventoryLocationTypeEnum {
	CLASSROOM = "CLASSROOM",
	LAB = "LAB",
	LIBRARY = "LIBRARY",
	OFFICE = "OFFICE",
	STAFFROOM = "STAFFROOM",
	SPORTS_ROOM = "SPORTS_ROOM",
	MOSQUE_ROOM = "MOSQUE_ROOM",
	STORE = "STORE",
	CANTEEN = "CANTEEN",
	COMMON_AREA = "COMMON_AREA",
	OTHER = "OTHER",
}

export enum inventoryConditionEnum {
	GOOD = "GOOD",
	FAIR = "FAIR",
	POOR = "POOR",
	DAMAGED = "DAMAGED",
	UNDER_REPAIR = "UNDER_REPAIR",
	DISPOSED = "DISPOSED",
}

export enum inventoryAssetStatusEnum {
	IN_USE = "IN_USE",
	IN_STORE = "IN_STORE",
	UNDER_REPAIR = "UNDER_REPAIR",
	DISPOSED = "DISPOSED",
	LOST = "LOST",
	STOLEN = "STOLEN",
}

export enum inventoryMovementTypeEnum {
	PURCHASE = "PURCHASE",
	TRANSFER = "TRANSFER",
	ISSUE = "ISSUE",
	RETURN = "RETURN",
	ADJUSTMENT = "ADJUSTMENT",
	DAMAGE = "DAMAGE",
	REPAIR_OUT = "REPAIR_OUT",
	REPAIR_IN = "REPAIR_IN",
	DISPOSE = "DISPOSE",
	LOST = "LOST",
}

export enum inventoryMaintenanceStatusEnum {
	OPEN = "OPEN",
	IN_PROGRESS = "IN_PROGRESS",
	RESOLVED = "RESOLVED",
	CANCELLED = "CANCELLED",
}

export enum inventoryMaintenancePriorityEnum {
	LOW = "LOW",
	MEDIUM = "MEDIUM",
	HIGH = "HIGH",
	URGENT = "URGENT",
}

export const inventorySchema = z.object({
	categoryId: z.string().optional(),
	locationId: z.string().optional(),
	itemId: z.string().optional(),
	assetId: z.string().optional(),
	stockBatchId: z.string().optional(),
	fromLocationId: z.string().optional(),
	toLocationId: z.string().optional(),
	classRoomId: z.string().optional(),
	name: z.string().optional(),
	nameBn: z.string().optional(),
	slug: z.string().optional(),
	code: z.string().optional(),
	brand: z.string().optional(),
	model: z.string().optional(),
	description: z.string().optional(),
	iconName: z.string().optional(),
	colorCode: z.string().optional(),
	trackingType: z.enum(inventoryTrackingTypeEnum).optional(),
	locationType: z.enum(inventoryLocationTypeEnum).optional(),
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
	building: z.string().optional(),
	floor: z.string().optional(),
	roomNo: z.string().optional(),
	status: z.string().optional(),
	quantityTotal: z.coerce.number().optional(),
	quantityGood: z.coerce.number().optional(),
	quantityDamaged: z.coerce.number().optional(),
	quantityDisposed: z.coerce.number().optional(),
	purchaseDate: z.string().optional(),
	purchasePrice: z.coerce.number().optional(),
	supplier: z.string().optional(),
	invoiceNo: z.string().optional(),
	invoiceImageUrl: z.any().optional(),
	invoicePlaceholder: z.string().optional(),
	hasWarranty: z.boolean().optional(),
	warrantyPeriod: z.coerce.number().optional(),
	warrantyPeriodUnit: z.string().optional(),
	warrantyNotes: z.string().optional(),
	assetTag: z.string().optional(),
	serialNo: z.string().optional(),
	macAddress: z.string().optional(),
	condition: z.enum(inventoryConditionEnum).optional(),
	assignedTo: z.string().optional(),
	movementType: z.enum(inventoryMovementTypeEnum).optional(),
	quantity: z.coerce.number().optional(),
	referenceNo: z.string().optional(),
	issueTitle: z.string().optional(),
	issueDescription: z.string().optional(),
	priority: z.enum(inventoryMaintenancePriorityEnum).optional(),
	serviceProvider: z.string().optional(),
	cost: z.coerce.number().optional(),
	notes: z.string().optional(),
});

export type InventoryFormValues = z.infer<typeof inventorySchema>;
