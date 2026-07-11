import { z } from "zod";

export const MAINTENANCE_STATUSES = [
	"OPEN",
	"IN_PROGRESS",
	"RESOLVED",
	"CANCELLED",
] as const;

export const MAINTENANCE_PRIORITIES = [
	"LOW",
	"MEDIUM",
	"HIGH",
	"URGENT",
] as const;

export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number];
export type MaintenancePriority = (typeof MAINTENANCE_PRIORITIES)[number];

export const maintenanceSchema = z.object({
	itemId: z.string().uuid("Item is required"),
	assetId: z.string().uuid().optional().or(z.literal("")),
	stockBatchId: z.string().uuid().optional().or(z.literal("")),
	locationId: z.string().uuid().optional().or(z.literal("")),
	issueTitle: z.string().min(1, "Issue title is required").max(180),
	issueDescription: z.string().optional(),
	status: z.enum(MAINTENANCE_STATUSES).optional(),
	priority: z.enum(MAINTENANCE_PRIORITIES).optional(),
	serviceProvider: z.string().optional(),
	cost: z.coerce.number().min(0).optional(),
	notes: z.string().optional(),
});

export type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;
