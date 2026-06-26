import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" || value === null ? undefined : value);
const optionalNumber = z.preprocess(
	emptyToUndefined,
	z.coerce.number().min(0, "Must be 0 or greater").optional()
);
const optionalString = z.preprocess(emptyToUndefined, z.string().optional());
const optionalDate = z.preprocess(emptyToUndefined, z.string().optional());

export enum subscriptionStatusEnum {
	TRIAL = "trial",
	ACTIVE = "active",
	CANCELED = "cancelled",
	EXPIRED = "expired",
	PAST_DUE = "past_due",
	SUSPENDED = "suspended",
}

export enum billingCycleEnum {
	MONTHLY = "monthly",
	QUARTERLY = "quarterly",
	SEMI_ANNUAL = "semi_annual",
	ANNUAL = "annual",
	LIFETIME = "lifetime",
	CUSTOM = "custom",
}

export const schoolSubscriptionSchema = z.object({
	schoolId: z.string().min(1, "School is required").optional(),
	planId: z.string().min(1, "Subscription plan is required"),
	startsAt: z.string().min(1, "Start date is required"),
	expiresAt: optionalDate,
	trialEndsAt: optionalDate,
	status: z.enum(subscriptionStatusEnum),
	gracePeriodDays: z.coerce.number().min(0, "Must be 0 or greater").default(7),
	maxStudents: optionalNumber,
	maxTeachers: optionalNumber,
	maxStaff: optionalNumber,
	maxClasses: optionalNumber,
	maxSubjects: optionalNumber,
	maxBranches: optionalNumber,
	storageGb: optionalNumber,
	freeStudentLimit: z.coerce.number().min(0, "Must be 0 or greater").default(0),
	hasSmsNotifications: z.boolean().default(false),
	hasEmailNotifications: z.boolean().default(true),
	hasParentPortal: z.boolean().default(false),
	hasOnlineAdmission: z.boolean().default(false),
	hasOnlineFeePayment: z.boolean().default(false),
	hasResultPublishing: z.boolean().default(false),
	hasCustomDomain: z.boolean().default(false),
	hasApiAccess: z.boolean().default(false),
	hasAdvancedReports: z.boolean().default(false),
	hasPrioritySupport: z.boolean().default(false),
	hasDedicatedAccountManager: z.boolean().default(false),
	priceBdt: z.coerce.number().min(0, "Must be 0 or greater").default(0),
	billingCycle: z.enum(billingCycleEnum).default(billingCycleEnum.MONTHLY),
	setupFeeBdt: z.coerce.number().min(0, "Must be 0 or greater").default(0),
	discountPct: z.coerce.number().min(0, "Must be 0 or greater").max(100).default(0),
	discountNote: optionalString,
	notes: optionalString,
});

export type SchoolSubscriptionFormValues = z.infer<typeof schoolSubscriptionSchema>;
