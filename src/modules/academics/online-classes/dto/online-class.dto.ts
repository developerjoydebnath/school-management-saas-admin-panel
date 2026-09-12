import { z } from "zod";

export enum OnlineClassPlatformEnum {
	ZOOM = "ZOOM",
	GOOGLE_MEET = "GOOGLE_MEET",
	MICROSOFT_TEAMS = "MICROSOFT_TEAMS",
	OTHER = "OTHER",
}

export enum OnlineClassStatusEnum {
	DRAFT = "DRAFT",
	SCHEDULED = "SCHEDULED",
	ONGOING = "ONGOING",
	COMPLETED = "COMPLETED",
	CANCELLED = "CANCELLED",
}

export enum OnlineClassAttendanceStatusEnum {
	PENDING = "PENDING",
	PRESENT = "PRESENT",
	ABSENT = "ABSENT",
}

export type OnlineClassRosterRow = {
	student: {
		id: string;
		fullNameEn: string;
		studentIdNo: string;
		rollNumber?: string | null;
		section?: { id: string; name: string } | null;
	};
	attendanceId: string | null;
	status: OnlineClassAttendanceStatusEnum;
	markedAt: string | null;
};

export type OnlineClass = {
	id: string;
	sessionId: string;
	classId: string;
	sectionId: string | null;
	subjectId: string;
	teacherId: string | null;
	title: string;
	titleBn?: string | null;
	description?: string | null;
	platform: OnlineClassPlatformEnum;
	meetingLink: string;
	meetingId?: string | null;
	passcode?: string | null;
	classDate: string;
	startTime: string;
	endTime: string;
	status: OnlineClassStatusEnum;
	notifiedAt?: string | null;
	/** Minutes before start time a reminder email goes out. Null/undefined disables it. */
	reminderMinutesBefore?: number | null;
	targetStudentCount?: number;
	/** True when this save just triggered a background notification send. */
	notifying?: boolean;
	/** Only students actually marked Present/Absent count toward `marked`. */
	attendanceSummary?: { present: number; absent: number; marked: number };
	class?: { id: string; enName: string; bnName?: string };
	section?: { id: string; name: string } | null;
	subject?: { id: string; enName: string; bnName?: string; code?: string };
	teacher?: { id: string; fullName: string } | null;
};

export const onlineClassSchema = z
	.object({
		sessionId: z.string().min(1, "Session is required"),
		classId: z.string().min(1, "Class is required"),
		// Empty means the whole class rather than one section.
		sectionId: z.string().optional(),
		subjectId: z.string().min(1, "Subject is required"),
		teacherId: z.string().optional(),
		title: z.string().min(1, "Title is required").max(255),
		titleBn: z.string().optional(),
		description: z.string().optional(),
		platform: z.nativeEnum(OnlineClassPlatformEnum),
		meetingLink: z.string().min(1, "Meeting link is required").url("Enter a valid URL"),
		meetingId: z.string().optional(),
		passcode: z.string().optional(),
		classDate: z.string().min(1, "Date is required"),
		startTime: z.string().min(1, "Start time is required"),
		endTime: z.string().min(1, "End time is required"),
		status: z.nativeEnum(OnlineClassStatusEnum),
		// An empty field means "no reminder" -- preprocess it to undefined
		// before coercion runs, otherwise z.coerce.number() on "" produces
		// 0 (Number("") === 0) and .optional() never gets a chance to skip it.
		reminderMinutesBefore: z.preprocess(
			(value) => (value === "" || value === undefined || value === null ? undefined : value),
			z.coerce
				.number()
				.int("Enter a whole number of minutes")
				.min(1, "Must be at least 1 minute")
				.max(1440, "Must be 24 hours (1440 minutes) or less")
				.optional()
		),
	})
	.superRefine((data, ctx) => {
		if (data.startTime && data.endTime && data.endTime <= data.startTime) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "End time must be after the start time",
				path: ["endTime"],
			});
		}
	});

export type OnlineClassFormValues = z.infer<typeof onlineClassSchema>;

export const onlineClassPlatformOptions = [
	{ label: "Zoom", value: OnlineClassPlatformEnum.ZOOM },
	{ label: "Google Meet", value: OnlineClassPlatformEnum.GOOGLE_MEET },
	{ label: "Microsoft Teams", value: OnlineClassPlatformEnum.MICROSOFT_TEAMS },
	{ label: "Other", value: OnlineClassPlatformEnum.OTHER },
];

export const attendanceStatusOptions = [
	{ label: "Pending", value: OnlineClassAttendanceStatusEnum.PENDING },
	{ label: "Present", value: OnlineClassAttendanceStatusEnum.PRESENT },
	{ label: "Absent", value: OnlineClassAttendanceStatusEnum.ABSENT },
];

export const onlineClassStatusOptions = [
	{ label: "Draft", value: OnlineClassStatusEnum.DRAFT },
	{ label: "Scheduled", value: OnlineClassStatusEnum.SCHEDULED },
	{ label: "Ongoing", value: OnlineClassStatusEnum.ONGOING },
	{ label: "Completed", value: OnlineClassStatusEnum.COMPLETED },
	{ label: "Cancelled", value: OnlineClassStatusEnum.CANCELLED },
];

/**
 * Mirrors the backend's ALLOWED_STATUS_TRANSITIONS (online-classes.service.ts)
 * so the UI only ever offers a move the API will actually accept. Completed
 * and Cancelled are terminal — no further status change is possible.
 */
export const ONLINE_CLASS_STATUS_TRANSITIONS: Record<
	OnlineClassStatusEnum,
	OnlineClassStatusEnum[]
> = {
	[OnlineClassStatusEnum.DRAFT]: [
		OnlineClassStatusEnum.SCHEDULED,
		OnlineClassStatusEnum.CANCELLED,
	],
	[OnlineClassStatusEnum.SCHEDULED]: [
		OnlineClassStatusEnum.ONGOING,
		OnlineClassStatusEnum.COMPLETED,
		OnlineClassStatusEnum.CANCELLED,
	],
	[OnlineClassStatusEnum.ONGOING]: [OnlineClassStatusEnum.COMPLETED],
	[OnlineClassStatusEnum.COMPLETED]: [],
	[OnlineClassStatusEnum.CANCELLED]: [],
};
