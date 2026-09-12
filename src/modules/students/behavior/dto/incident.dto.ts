import { z } from "zod";

export const INCIDENT_TYPE_OPTIONS = [
	{ value: "positive", label: "Positive" },
	{ value: "negative", label: "Negative" },
	{ value: "neutral", label: "Neutral" },
];

export const INCIDENT_CATEGORY_OPTIONS = [
	{ value: "uniform", label: "Uniform Violation" },
	{ value: "tardiness", label: "Tardiness / Bunking" },
	{ value: "contraband", label: "Contraband (Mobile, etc.)" },
	{ value: "homework", label: "Homework Incomplete" },
	{ value: "disruption", label: "Class Disruption" },
	{ value: "excellence", label: "Extracurricular Excellence" },
	{ value: "helpfulness", label: "Assisting Peers/Teachers" },
	{ value: "other", label: "Other" },
];

export const INCIDENT_ACTION_OPTIONS = [
	{ value: "warning", label: "Verbal Warning" },
	{ value: "writtenWarning", label: "Written Warning" },
	{ value: "parentsCalled", label: "Guardian Called" },
	{ value: "parentsMeeting", label: "Parent-Teacher Meeting" },
	{ value: "suspension", label: "Suspension" },
	{ value: "appreciation", label: "Appreciation Letter" },
	{ value: "none", label: "No Action" },
];

export const INCIDENT_STATUS_OPTIONS = [
	{ value: "pending", label: "Pending Action" },
	{ value: "resolved", label: "Resolved" },
];

export const incidentSchema = z.object({
	studentId: z.string().min(1, { message: "Student is required" }),
	studentLabel: z.string().optional(),
	type: z.string().min(1, { message: "Type is required" }),
	category: z.string().min(1, { message: "Category is required" }),
	actionTaken: z.string().min(1, { message: "Action taken is required" }),
	date: z.string().min(1, { message: "Date is required" }),
	remarks: z.string().optional(),
	guardianCallRequired: z.boolean().optional(),
	status: z.string().optional(),
});

export type IncidentFormValues = z.infer<typeof incidentSchema>;

export type IncidentListItem = {
	id: string;
	studentId: string;
	studentName: string;
	studentCode?: string | null;
	classId?: string | null;
	className?: string | null;
	sectionId?: string | null;
	sectionName?: string | null;
	type: string;
	category: string;
	actionTaken: string;
	date: string;
	remarks?: string | null;
	guardianCallRequired: boolean;
	status: string;
	mailedAt?: string | null;
	createdAt: string;
};

export type IncidentDetails = IncidentListItem;

export type CreateIncidentPayload = {
	studentId: string;
	type: string;
	category: string;
	actionTaken: string;
	date: string;
	remarks?: string;
	guardianCallRequired?: boolean;
	status?: string;
};

export type UpdateIncidentPayload = Partial<Omit<CreateIncidentPayload, "studentId">>;
