export enum EventParticipantTypeEnum {
	STUDENT = "STUDENT",
	TEACHER = "TEACHER",
	STAFF = "STAFF",
	GUARDIAN = "GUARDIAN",
}

export enum EventParticipantStatusEnum {
	REGISTERED = "REGISTERED",
	APPROVED = "APPROVED",
	ATTENDED = "ATTENDED",
	ABSENT = "ABSENT",
	CANCELLED = "CANCELLED",
}

export type EventParticipant = {
	id: string;
	eventId: string;
	participantType: EventParticipantTypeEnum;
	participantId: string;
	status: EventParticipantStatusEnum;
	registeredAt: string;
	checkInAt?: string | null;
	remarks?: string | null;
	/** Hydrated server-side — the row itself is polymorphic and has no join. */
	participantName?: string | null;
	participantIdentifier?: string | null;
	event?: { id: string; title: string; startDate: string; endDate: string } | null;
};

export const participantTypeOptions = [
	{ label: "Student", value: EventParticipantTypeEnum.STUDENT },
	{ label: "Teacher", value: EventParticipantTypeEnum.TEACHER },
	{ label: "Staff", value: EventParticipantTypeEnum.STAFF },
	{ label: "Guardian", value: EventParticipantTypeEnum.GUARDIAN },
];

export const participantStatusOptions = [
	{ label: "Registered", value: EventParticipantStatusEnum.REGISTERED },
	{ label: "Approved", value: EventParticipantStatusEnum.APPROVED },
	{ label: "Attended", value: EventParticipantStatusEnum.ATTENDED },
	{ label: "Absent", value: EventParticipantStatusEnum.ABSENT },
	{ label: "Cancelled", value: EventParticipantStatusEnum.CANCELLED },
];

export const participantStatusColors: Record<
	EventParticipantStatusEnum,
	{ bg: string; text: string }
> = {
	[EventParticipantStatusEnum.REGISTERED]: {
		bg: "bg-blue-500/15",
		text: "text-blue-700 dark:text-blue-400",
	},
	[EventParticipantStatusEnum.APPROVED]: {
		bg: "bg-violet-500/15",
		text: "text-violet-700 dark:text-violet-400",
	},
	[EventParticipantStatusEnum.ATTENDED]: {
		bg: "bg-emerald-500/15",
		text: "text-emerald-700 dark:text-emerald-400",
	},
	[EventParticipantStatusEnum.ABSENT]: {
		bg: "bg-amber-500/15",
		text: "text-amber-700 dark:text-amber-400",
	},
	[EventParticipantStatusEnum.CANCELLED]: {
		bg: "bg-destructive/15",
		text: "text-destructive",
	},
};
