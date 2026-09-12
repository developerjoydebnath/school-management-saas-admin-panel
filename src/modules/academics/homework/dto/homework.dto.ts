import { z } from "zod";

export enum HomeworkTypeEnum {
	HOMEWORK = "HOMEWORK",
	ASSIGNMENT = "ASSIGNMENT",
	CLASSWORK = "CLASSWORK",
	PROJECT = "PROJECT",
}

export enum HomeworkStatusEnum {
	DRAFT = "DRAFT",
	PUBLISHED = "PUBLISHED",
	ARCHIVED = "ARCHIVED",
}

export enum HomeworkSubmissionStatusEnum {
	PENDING = "PENDING",
	SUBMITTED = "SUBMITTED",
	LATE = "LATE",
	MISSING = "MISSING",
	GRADED = "GRADED",
}

/** Assignments and projects are graded, so they require a mark total. */
export const GRADED_TYPES: HomeworkTypeEnum[] = [
	HomeworkTypeEnum.ASSIGNMENT,
	HomeworkTypeEnum.PROJECT,
];

export type HomeworkAttachment = {
	url: string;
	name?: string;
	mediaId?: string;
};

export type HomeworkSubmissionSummary = {
	total: number;
	submitted: number;
	graded: number;
	pending: number;
};

/** Only the detail endpoint returns these; the list endpoint sends the summary. */
export type HomeworkSubmissionRecord = {
	id: string;
	studentId: string;
	status: HomeworkSubmissionStatusEnum;
	obtainedMarks: string | number | null;
	remarks: string | null;
	submittedAt: string | null;
	student?: {
		id: string;
		fullNameEn: string;
		studentIdNo: string;
		rollNumber?: string | null;
	};
};

export type LessonPlanShortListItem = {
	id: string;
	title: string;
	topic: string;
	lessonDate: string;
	status: string;
};

export type Homework = {
	id: string;
	sessionId: string;
	classId: string;
	sectionId: string | null;
	subjectId: string;
	teacherId: string | null;
	lessonPlanId?: string | null;
	title: string;
	titleBn?: string | null;
	instructions?: string | null;
	type: HomeworkTypeEnum;
	status: HomeworkStatusEnum;
	assignedDate: string;
	dueDate: string;
	totalMarks?: string | number | null;
	attachments: HomeworkAttachment[];
	publishedAt?: string | null;
	/** Derived server-side from dueDate; never stored. */
	isOverdue: boolean;
	submissionSummary: HomeworkSubmissionSummary;
	/** Rank-1 student(s) by obtained marks; null when nothing is graded yet. */
	topPerformer: { marks: number; students: string[] } | null;
	submissions?: HomeworkSubmissionRecord[];
	class?: { id: string; enName: string; bnName?: string };
	section?: { id: string; name: string } | null;
	subject?: { id: string; enName: string; bnName?: string; code?: string };
	teacher?: { id: string; fullName: string } | null;
	lessonPlan?: { id: string; title: string; topic: string } | null;
};

export type HomeworkRosterRow = {
	student: {
		id: string;
		fullNameEn: string;
		studentIdNo: string;
		rollNumber?: string | null;
		section?: { id: string; name: string } | null;
	};
	submissionId: string | null;
	status: HomeworkSubmissionStatusEnum;
	obtainedMarks: string | number | null;
	remarks: string | null;
	submittedAt: string | null;
};

export const homeworkSchema = z
	.object({
		sessionId: z.string().min(1, "Session is required"),
		classId: z.string().min(1, "Class is required"),
		// Empty means the whole class rather than one section.
		sectionId: z.string().optional(),
		subjectId: z.string().min(1, "Subject is required"),
		teacherId: z.string().optional(),
		// Optional link back to the lesson this work was assigned from.
		lessonPlanId: z.string().optional(),
		title: z.string().min(1, "Title is required").max(255),
		titleBn: z.string().optional(),
		instructions: z.string().optional(),
		type: z.nativeEnum(HomeworkTypeEnum),
		status: z.nativeEnum(HomeworkStatusEnum),
		assignedDate: z.string().min(1, "Assigned date is required"),
		dueDate: z.string().min(1, "Due date is required"),
		totalMarks: z.coerce.number().min(0).max(1000).optional(),
		attachments: z
			.array(
				z.object({
					url: z.string().min(1),
					name: z.string().optional(),
					mediaId: z.string().optional(),
				})
			)
			.default([]),
	})
	.superRefine((data, ctx) => {
		if (data.dueDate && data.assignedDate && data.dueDate < data.assignedDate) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Due date cannot be before the assigned date",
				path: ["dueDate"],
			});
		}
		if (GRADED_TYPES.includes(data.type) && (data.totalMarks ?? null) === null) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Total marks is required for an assignment or project",
				path: ["totalMarks"],
			});
		}
	});

export type HomeworkFormValues = z.infer<typeof homeworkSchema>;

export const homeworkTypeOptions = [
	{ label: "Homework", value: HomeworkTypeEnum.HOMEWORK },
	{ label: "Assignment", value: HomeworkTypeEnum.ASSIGNMENT },
	{ label: "Classwork", value: HomeworkTypeEnum.CLASSWORK },
	{ label: "Project", value: HomeworkTypeEnum.PROJECT },
];

export const homeworkStatusOptions = [
	{ label: "Draft", value: HomeworkStatusEnum.DRAFT },
	{ label: "Published", value: HomeworkStatusEnum.PUBLISHED },
	{ label: "Archived", value: HomeworkStatusEnum.ARCHIVED },
];

export const submissionStatusOptions = [
	{ label: "Pending", value: HomeworkSubmissionStatusEnum.PENDING },
	{ label: "Submitted", value: HomeworkSubmissionStatusEnum.SUBMITTED },
	{ label: "Late", value: HomeworkSubmissionStatusEnum.LATE },
	{ label: "Missing", value: HomeworkSubmissionStatusEnum.MISSING },
	{ label: "Graded", value: HomeworkSubmissionStatusEnum.GRADED },
];
