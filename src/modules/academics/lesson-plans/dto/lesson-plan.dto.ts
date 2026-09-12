import { z } from "zod";
import { GRADED_TYPES, HomeworkTypeEnum } from "@/modules/academics/homework/dto/homework.dto";

export enum LessonPlanStatusEnum {
	DRAFT = "DRAFT",
	PUBLISHED = "PUBLISHED",
	COMPLETED = "COMPLETED",
	CANCELLED = "CANCELLED",
}

export { HomeworkTypeEnum };

const lessonWorkItemSchema = z.object({
	title: z.string().optional(),
	titleBn: z.string().optional(),
	dueDate: z.string().optional(),
	totalMarks: z.coerce.number().min(0).max(1000).optional(),
	instructions: z.string().optional(),
	attachments: z
		.array(
			z.object({
				url: z.string().min(1),
				name: z.string().optional(),
				mediaId: z.string().optional(),
			})
		)
		.default([]),
});

export type LessonWorkItemValues = z.infer<typeof lessonWorkItemSchema>;

export type LessonPlan = {
	id: string;
	sessionId: string;
	classId: string;
	sectionId: string | null;
	subjectId: string;
	teacherId: string | null;
	title: string;
	topic: string;
	lessonDate: string;
	startTime: string;
	endTime: string;
	learningOutcomes?: string | null;
	priorKnowledge?: string | null;
	teachingAids?: string | null;
	teachingMethods: string[];
	introduction?: string | null;
	mainActivity?: string | null;
	evaluation?: string | null;
	homeworkNote?: string | null;
	teacherReflection?: string | null;
	status: LessonPlanStatusEnum;
	class?: { id: string; enName: string; bnName?: string };
	section?: { id: string; name: string } | null;
	subject?: { id: string; enName: string; bnName?: string; code?: string };
	teacher?: { id: string; fullName: string } | null;
};

export const lessonPlanSchema = z
	.object({
		sessionId: z.string().min(1, "Session is required"),
		classId: z.string().min(1, "Class is required"),
		// Empty means the whole class rather than one section.
		sectionId: z.string().optional(),
		subjectId: z.string().min(1, "Subject is required"),
		teacherId: z.string().optional(),
		title: z.string().min(1, "Title is required").max(255),
		topic: z.string().min(1, "Topic / chapter is required").max(255),
		lessonDate: z.string().min(1, "Date is required"),
		startTime: z.string().min(1, "Start time is required"),
		endTime: z.string().min(1, "End time is required"),
		learningOutcomes: z.string().optional(),
		priorKnowledge: z.string().optional(),
		teachingAids: z.string().optional(),
		teachingMethods: z.array(z.string()).default([]),
		introduction: z.string().optional(),
		mainActivity: z.string().optional(),
		evaluation: z.string().optional(),
		homeworkNote: z.string().optional(),
		teacherReflection: z.string().optional(),
		status: z.nativeEnum(LessonPlanStatusEnum),
		// Which of the 4 quick-attach buttons (Homework/Assignment/Project/
		// Classwork) are active — at most one item per type.
		homeworkTypes: z.array(z.nativeEnum(HomeworkTypeEnum)).default([]),
		homeworkItems: z
			.object({
				[HomeworkTypeEnum.HOMEWORK]: lessonWorkItemSchema.optional(),
				[HomeworkTypeEnum.ASSIGNMENT]: lessonWorkItemSchema.optional(),
				[HomeworkTypeEnum.PROJECT]: lessonWorkItemSchema.optional(),
				[HomeworkTypeEnum.CLASSWORK]: lessonWorkItemSchema.optional(),
			})
			.default({}),
	})
	.superRefine((data, ctx) => {
		data.homeworkTypes.forEach((type) => {
			const item = data.homeworkItems[type];
			if (!item?.title?.trim()) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Title is required",
					path: ["homeworkItems", type, "title"],
				});
			}
			if (!item?.dueDate) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Due date is required",
					path: ["homeworkItems", type, "dueDate"],
				});
			} else if (data.lessonDate && item.dueDate < data.lessonDate) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Due date cannot be before the lesson date",
					path: ["homeworkItems", type, "dueDate"],
				});
			}
			if (GRADED_TYPES.includes(type) && (item?.totalMarks ?? null) === null) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Total marks is required for an assignment or project",
					path: ["homeworkItems", type, "totalMarks"],
				});
			}
		});
		if (data.startTime && data.endTime && data.endTime <= data.startTime) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "End time must be after the start time",
				path: ["endTime"],
			});
		}
	});

export type LessonPlanFormValues = z.infer<typeof lessonPlanSchema>;

export const lessonPlanStatusOptions = [
	{ label: "Draft", value: LessonPlanStatusEnum.DRAFT },
	{ label: "Published", value: LessonPlanStatusEnum.PUBLISHED },
	{ label: "Completed", value: LessonPlanStatusEnum.COMPLETED },
	{ label: "Cancelled", value: LessonPlanStatusEnum.CANCELLED },
];

/**
 * Mirrors the backend's ALLOWED_STATUS_TRANSITIONS
 * (lesson-plans.service.ts) so the UI only ever offers a move the API will
 * actually accept. Completed and Cancelled are terminal.
 */
export const LESSON_PLAN_STATUS_TRANSITIONS: Record<
	LessonPlanStatusEnum,
	LessonPlanStatusEnum[]
> = {
	[LessonPlanStatusEnum.DRAFT]: [
		LessonPlanStatusEnum.PUBLISHED,
		LessonPlanStatusEnum.CANCELLED,
	],
	[LessonPlanStatusEnum.PUBLISHED]: [
		LessonPlanStatusEnum.COMPLETED,
		LessonPlanStatusEnum.CANCELLED,
	],
	[LessonPlanStatusEnum.COMPLETED]: [],
	[LessonPlanStatusEnum.CANCELLED]: [],
};

/**
 * Teaching methods commonly named in Bangladeshi (NCTB-style) lesson plans —
 * offered as a fixed checklist rather than free text so the list stays
 * scannable across plans.
 */
export const teachingMethodOptions = [
	{ label: "Lecture", value: "Lecture" },
	{ label: "Question & Answer", value: "Question & Answer" },
	{ label: "Group Work", value: "Group Work" },
	{ label: "Pair Work", value: "Pair Work" },
	{ label: "Discussion", value: "Discussion" },
	{ label: "Demonstration", value: "Demonstration" },
	{ label: "Practical / Lab Work", value: "Practical / Lab Work" },
	{ label: "Multimedia", value: "Multimedia" },
	{ label: "Storytelling", value: "Storytelling" },
	{ label: "Field Work", value: "Field Work" },
];
