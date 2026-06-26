import { z } from "zod";

export enum billingCycleEnum {
	MONTHLY = "monthly",
	QUARTERLY = "quarterly",
	SEMI_ANNUAL = "semi_annual",
	ANNUAL = "annual",
	LIFETIME = "lifetime",
	CUSTOM = "custom",
}

export const subscriptionPlanSchema = z.object({
	name: z.string().min(1, "Plan name is required"),
	tagline: z.string().optional(),
	description: z.string().optional(),
	priceBdt: z.coerce.number().min(0, "Price must be 0 or more"),
	billingCycle: z.enum(billingCycleEnum),
	setupFeeBdt: z.coerce.number().min(0),
	trialDays: z.coerce.number().int().min(0),
	gracePeriodDays: z.coerce.number().int().min(0),
	maxStudents: z.coerce.number().int().min(0).optional(),
	maxTeachers: z.coerce.number().int().min(0).optional(),
	maxStaff: z.coerce.number().int().min(0).optional(),
	maxClasses: z.coerce.number().int().min(0).optional(),
	maxSubjects: z.coerce.number().int().min(0).optional(),
	maxBranches: z.coerce.number().int().min(0).optional(),
	storageGb: z.coerce.number().int().min(0).optional(),
	freeStudentLimit: z.coerce.number().int().min(0),
	hasSmsNotifications: z.boolean(),
	hasEmailNotifications: z.boolean(),
	hasParentPortal: z.boolean(),
	hasOnlineAdmission: z.boolean(),
	hasOnlineFeePayment: z.boolean(),
	hasResultPublishing: z.boolean(),
	hasCustomDomain: z.boolean(),
	hasApiAccess: z.boolean(),
	hasAdvancedReports: z.boolean(),
	hasPrioritySupport: z.boolean(),
	hasDedicatedAccountManager: z.boolean(),
	isPublic: z.boolean(),
	isActive: z.boolean(),
	sortOrder: z.coerce.number().int().min(0),
	notes: z.string().optional(),
});

export type SubscriptionPlanFormValues = z.infer<typeof subscriptionPlanSchema>;
