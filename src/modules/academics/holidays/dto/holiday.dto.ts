import { z } from "zod";

export enum HolidayCategoryEnum {
	NATIONAL = "NATIONAL",
	RELIGIOUS = "RELIGIOUS",
	VACATION = "VACATION",
	SCHOOL_EVENT = "SCHOOL_EVENT",
	OTHER = "OTHER",
}

export type Holiday = {
	id: string;
	sessionId: string;
	title: string;
	titleBn?: string | null;
	category: HolidayCategoryEnum;
	startDate: string;
	endDate: string;
	isClosed: boolean;
	isPublic: boolean;
	description?: string | null;
};

export const holidaySchema = z
	.object({
		sessionId: z.string().min(1, "Session is required"),
		title: z.string().min(1, "Title is required").max(255),
		titleBn: z.string().optional(),
		category: z.nativeEnum(HolidayCategoryEnum),
		startDate: z.string().min(1, "Start date is required"),
		endDate: z.string().min(1, "End date is required"),
		isClosed: z.boolean(),
		isPublic: z.boolean(),
		description: z.string().optional(),
		notifyGuardiansAndStaff: z.boolean().optional(),
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

export type HolidayFormValues = z.infer<typeof holidaySchema>;

export const holidayCategoryOptions = [
	{ label: "National", value: HolidayCategoryEnum.NATIONAL },
	{ label: "Religious", value: HolidayCategoryEnum.RELIGIOUS },
	{ label: "Vacation", value: HolidayCategoryEnum.VACATION },
	{ label: "School Event", value: HolidayCategoryEnum.SCHOOL_EVENT },
	{ label: "Other", value: HolidayCategoryEnum.OTHER },
];

// One fixed color per category so admins can scan the calendar at a glance —
// closed-vs-open stays a separate signal (a left-border accent), layered on
// top of these rather than replacing them.
export const holidayCategoryColors: Record<
	HolidayCategoryEnum,
	{ bg: string; text: string; dot: string; border: string }
> = {
	[HolidayCategoryEnum.NATIONAL]: {
		bg: "bg-emerald-500/15",
		text: "text-emerald-700 dark:text-emerald-400",
		dot: "bg-emerald-500",
		border: "border-emerald-500",
	},
	[HolidayCategoryEnum.RELIGIOUS]: {
		bg: "bg-purple-500/15",
		text: "text-purple-700 dark:text-purple-400",
		dot: "bg-purple-500",
		border: "border-purple-500",
	},
	[HolidayCategoryEnum.VACATION]: {
		bg: "bg-amber-500/15",
		text: "text-amber-700 dark:text-amber-400",
		dot: "bg-amber-500",
		border: "border-amber-500",
	},
	[HolidayCategoryEnum.SCHOOL_EVENT]: {
		bg: "bg-blue-500/15",
		text: "text-blue-700 dark:text-blue-400",
		dot: "bg-blue-500",
		border: "border-blue-500",
	},
	[HolidayCategoryEnum.OTHER]: {
		bg: "bg-slate-500/15",
		text: "text-slate-700 dark:text-slate-400",
		dot: "bg-slate-500",
		border: "border-slate-500",
	},
};
