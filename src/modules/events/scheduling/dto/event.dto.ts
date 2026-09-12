import { z } from "zod";

export enum EventCategoryEnum {
	ACADEMIC = "ACADEMIC",
	SPORTS = "SPORTS",
	CULTURAL = "CULTURAL",
	COMPETITION = "COMPETITION",
	EXCURSION = "EXCURSION",
	CEREMONY = "CEREMONY",
	OTHER = "OTHER",
}

export enum EventStatusEnum {
	DRAFT = "DRAFT",
	SCHEDULED = "SCHEDULED",
	ONGOING = "ONGOING",
	COMPLETED = "COMPLETED",
	CANCELLED = "CANCELLED",
}

export enum EventAudienceTypeEnum {
	STUDENTS = "STUDENTS",
	TEACHERS = "TEACHERS",
	GUARDIANS = "GUARDIANS",
	STAFF = "STAFF",
	ALUMNI = "ALUMNI",
	GUESTS = "GUESTS",
	MANAGEMENT = "MANAGEMENT",
	PUBLIC = "PUBLIC",
}

export type EventGalleryItem = {
	url: string;
	name?: string;
	mediaId?: string;
};

export type EventGuest = {
	name: string;
	designation?: string;
	organization?: string;
	guestType?: string;
	phone?: string;
	email?: string;
};

/** One repeatable organiser block — a school event usually has several. */
export type EventOrganizer = {
	coordinatorId?: string;
	organizingDepartment?: string;
	contactPerson?: string;
	contactPhone?: string;
	contactEmail?: string;
};

/**
 * A targeted section, always paired with its class. `Section` is a global
 * catalogue ("A", "B", "C") offered to many classes, so a bare section id
 * cannot tell Class 9 / A from Class 10 / A.
 */
export type EventAudienceSection = {
	classId: string;
	sectionId: string;
};

export type EventScheduleItem = {
	title: string;
	startTime?: string;
	endTime?: string;
	location?: string;
	speaker?: string;
};

export type SchoolEvent = {
	id: string;
	sessionId: string;
	title: string;
	titleBn?: string | null;
	category: EventCategoryEnum;
	description?: string | null;
	venue?: string | null;
	startDate: string;
	endDate: string;
	startTime?: string | null;
	endTime?: string | null;
	classId?: string | null;
	sectionId?: string | null;
	audienceClassIds?: string[];
	audienceSections?: EventAudienceSection[];
	coordinatorId?: string | null;
	status: EventStatusEnum;
	isPublic: boolean;
	bannerUrl?: string | null;
	bannerPlaceholder?: string | null;
	gallery: EventGalleryItem[];
	guests: EventGuest[];
	scheduleItems: EventScheduleItem[];
	organizers: EventOrganizer[];
	audienceTypes: EventAudienceTypeEnum[];
	announcedAt?: string | null;
	organizingDepartment?: string | null;
	contactPerson?: string | null;
	contactPhone?: string | null;
	contactEmail?: string | null;
	venueType?: string | null;
	registrationRequired: boolean;
	registrationStart?: string | null;
	registrationEnd?: string | null;
	maxParticipants?: number | null;
	registrationFee?: number | string | null;
	approvalRequired: boolean;
	class?: { id: string; enName: string; bnName?: string | null } | null;
	section?: { id: string; name: string } | null;
	coordinator?: { id: string; fullName: string } | null;
	_count?: { participants: number; competitions: number; awards: number };
};

const emptyToUndefined = (value: unknown) =>
	typeof value === "string" && value.trim() === "" ? undefined : value;

export const eventSchema = z
	.object({
		sessionId: z.string().min(1, "Session is required"),
		title: z.string().min(1, "Title is required").max(255),
		titleBn: z.string().optional(),
		category: z.nativeEnum(EventCategoryEnum),
		description: z.string().optional(),
		venue: z.string().optional(),
		startDate: z.string().min(1, "Start date is required"),
		endDate: z.string().min(1, "End date is required"),
		startTime: z.string().optional(),
		endTime: z.string().optional(),
		classId: z.preprocess(emptyToUndefined, z.string().optional()),
		sectionId: z.preprocess(emptyToUndefined, z.string().optional()),
		audienceClassIds: z.array(z.string()).optional(),
		audienceSections: z
			.array(z.object({ classId: z.string(), sectionId: z.string() }))
			.optional(),
		coordinatorId: z.preprocess(emptyToUndefined, z.string().optional()),
		status: z.nativeEnum(EventStatusEnum),
		isPublic: z.boolean(),
		bannerUrl: z.string().optional(),
		bannerPlaceholder: z.string().optional(),
		gallery: z
			.array(
				z.object({
					url: z.string(),
					name: z.string().optional(),
					mediaId: z.string().optional(),
				})
			)
			.optional(),
		audienceTypes: z.array(z.nativeEnum(EventAudienceTypeEnum)).optional(),
		guests: z
			.array(
				z.object({
					name: z.string().min(1, "Guest name is required"),
					designation: z.string().optional(),
					organization: z.string().optional(),
					guestType: z.string().optional(),
					phone: z.string().optional(),
					email: z.string().optional(),
				})
			)
			.optional(),
		scheduleItems: z
			.array(
				z.object({
					title: z.string().min(1, "Title is required"),
					startTime: z.string().optional(),
					endTime: z.string().optional(),
					location: z.string().optional(),
					speaker: z.string().optional(),
				})
			)
			.optional(),
		organizers: z
			.array(
				z.object({
					// Same treatment as the top-level `coordinatorId`: the "No
					// coordinator assigned" option submits "", and the API's
					// UUID check rejects an empty string rather than ignoring it.
					coordinatorId: z.preprocess(emptyToUndefined, z.string().optional()),
					organizingDepartment: z.string().optional(),
					contactPerson: z.string().optional(),
					contactPhone: z.string().optional(),
					contactEmail: z.string().optional(),
				})
			)
			.optional(),
		// Kept so an event saved before the organiser list existed still loads;
		// the service mirrors organizers[0] back into them.
		organizingDepartment: z.string().optional(),
		contactPerson: z.string().optional(),
		contactPhone: z.string().optional(),
		contactEmail: z.string().optional(),
		venueType: z.preprocess(emptyToUndefined, z.string().optional()),
		registrationRequired: z.boolean(),
		registrationStart: z.preprocess(emptyToUndefined, z.string().optional()),
		registrationEnd: z.preprocess(emptyToUndefined, z.string().optional()),
		maxParticipants: z.preprocess(
			(v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
			z.number().min(0).optional()
		),
		registrationFee: z.preprocess(
			(v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
			z.number().min(0).optional()
		),
		approvalRequired: z.boolean(),
	})
	.superRefine((data, ctx) => {
		if (data.startDate && data.endDate && data.endDate < data.startDate) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "End date cannot be before the start date",
				path: ["endDate"],
			});
		}
	});

export type EventFormValues = z.infer<typeof eventSchema>;

export const eventCategoryOptions = [
	{ label: "Academic", value: EventCategoryEnum.ACADEMIC },
	{ label: "Sports", value: EventCategoryEnum.SPORTS },
	{ label: "Cultural", value: EventCategoryEnum.CULTURAL },
	{ label: "Competition", value: EventCategoryEnum.COMPETITION },
	{ label: "Excursion", value: EventCategoryEnum.EXCURSION },
	{ label: "Ceremony", value: EventCategoryEnum.CEREMONY },
	{ label: "Other", value: EventCategoryEnum.OTHER },
];

export const eventStatusOptions = [
	{ label: "Draft", value: EventStatusEnum.DRAFT },
	{ label: "Scheduled", value: EventStatusEnum.SCHEDULED },
	{ label: "Ongoing", value: EventStatusEnum.ONGOING },
	{ label: "Completed", value: EventStatusEnum.COMPLETED },
	{ label: "Cancelled", value: EventStatusEnum.CANCELLED },
];

// One fixed color per category, same reasoning as holidayCategoryColors —
// scan-at-a-glance on the calendar grid and list table.
export const eventCategoryColors: Record<
	EventCategoryEnum,
	{ bg: string; text: string; dot: string; border: string }
> = {
	[EventCategoryEnum.ACADEMIC]: {
		bg: "bg-blue-500/15",
		text: "text-blue-700 dark:text-blue-400",
		dot: "bg-blue-500",
		border: "border-blue-500",
	},
	[EventCategoryEnum.SPORTS]: {
		bg: "bg-orange-500/15",
		text: "text-orange-700 dark:text-orange-400",
		dot: "bg-orange-500",
		border: "border-orange-500",
	},
	[EventCategoryEnum.CULTURAL]: {
		bg: "bg-pink-500/15",
		text: "text-pink-700 dark:text-pink-400",
		dot: "bg-pink-500",
		border: "border-pink-500",
	},
	[EventCategoryEnum.COMPETITION]: {
		bg: "bg-violet-500/15",
		text: "text-violet-700 dark:text-violet-400",
		dot: "bg-violet-500",
		border: "border-violet-500",
	},
	[EventCategoryEnum.EXCURSION]: {
		bg: "bg-teal-500/15",
		text: "text-teal-700 dark:text-teal-400",
		dot: "bg-teal-500",
		border: "border-teal-500",
	},
	[EventCategoryEnum.CEREMONY]: {
		bg: "bg-amber-500/15",
		text: "text-amber-700 dark:text-amber-400",
		dot: "bg-amber-500",
		border: "border-amber-500",
	},
	[EventCategoryEnum.OTHER]: {
		bg: "bg-slate-500/15",
		text: "text-slate-700 dark:text-slate-400",
		dot: "bg-slate-500",
		border: "border-slate-500",
	},
};

export const eventAudienceOptions = [
	{ label: "Students", value: EventAudienceTypeEnum.STUDENTS },
	{ label: "Teachers", value: EventAudienceTypeEnum.TEACHERS },
	{ label: "Guardians", value: EventAudienceTypeEnum.GUARDIANS },
	{ label: "Staff", value: EventAudienceTypeEnum.STAFF },
	{ label: "Alumni", value: EventAudienceTypeEnum.ALUMNI },
	{ label: "Guests", value: EventAudienceTypeEnum.GUESTS },
	{ label: "Management", value: EventAudienceTypeEnum.MANAGEMENT },
	{ label: "Public", value: EventAudienceTypeEnum.PUBLIC },
];

export const venueTypeOptions = [
	{ label: "Not specified", value: "" },
	{ label: "School Campus", value: "school_campus" },
	{ label: "Playground", value: "playground" },
	{ label: "Auditorium", value: "auditorium" },
	{ label: "Classroom", value: "classroom" },
	{ label: "Hall", value: "hall" },
	{ label: "Online", value: "online" },
	{ label: "External Venue", value: "external" },
	{ label: "Other", value: "other" },
];

export const guestTypeOptions = [
	{ label: "Chief Guest", value: "chief_guest" },
	{ label: "Special Guest", value: "special_guest" },
	{ label: "Guest of Honor", value: "guest_of_honor" },
	{ label: "Chairperson", value: "chairperson" },
	{ label: "Keynote Speaker", value: "keynote_speaker" },
	{ label: "Speaker", value: "speaker" },
	{ label: "Judge", value: "judge" },
	{ label: "Sponsor", value: "sponsor" },
	{ label: "Other", value: "other" },
];

export const eventStatusColors: Record<EventStatusEnum, { bg: string; text: string }> = {
	[EventStatusEnum.DRAFT]: { bg: "bg-slate-500/15", text: "text-slate-700 dark:text-slate-400" },
	[EventStatusEnum.SCHEDULED]: { bg: "bg-blue-500/15", text: "text-blue-700 dark:text-blue-400" },
	[EventStatusEnum.ONGOING]: { bg: "bg-amber-500/15", text: "text-amber-700 dark:text-amber-400" },
	[EventStatusEnum.COMPLETED]: {
		bg: "bg-emerald-500/15",
		text: "text-emerald-700 dark:text-emerald-400",
	},
	[EventStatusEnum.CANCELLED]: {
		bg: "bg-destructive/15",
		text: "text-destructive",
	},
};
