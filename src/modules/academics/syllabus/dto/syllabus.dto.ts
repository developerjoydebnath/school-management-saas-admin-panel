import { z } from "zod";

export enum SyllabusStatusEnum {
	DRAFT = "DRAFT",
	PUBLISHED = "PUBLISHED",
	ARCHIVED = "ARCHIVED",
}

const topicSchema = z.object({
	title: z.string().min(1, "Topic title is required"),
	titleBn: z.string().optional(),
	description: z.string().optional(),
	estimatedClasses: z.coerce.number().int().min(1).default(1),
	weightPercent: z.coerce.number().min(0).max(100).default(100),
	progressPercent: z.coerce.number().min(0).max(100).default(0),
	isCompleted: z.boolean().default(false),
});

const chapterSchema = z.object({
	chapterNo: z.coerce.number().int().min(1).default(1),
	title: z.string().min(1, "Chapter title is required"),
	titleBn: z.string().optional(),
	pageRange: z.string().optional(),
	learningOutcome: z.string().optional(),
	weightPercent: z.coerce.number().min(0).max(100).default(100),
	topics: z.array(topicSchema).min(1, "Add at least one topic"),
}).superRefine((chapter, ctx) => {
	const total = chapter.topics.reduce((sum, topic) => sum + Number(topic.weightPercent || 0), 0);
	if (Math.abs(total - 100) > 0.01) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Topic weights must total 100%",
			path: ["topics"],
		});
	}
});

const syllabusSubjectSchema = z.object({
	subjectId: z.string().min(1, "Subject is required"),
	teacherId: z.string().optional().transform((value) => value || undefined),
	chapters: z.array(chapterSchema).min(1, "Add at least one chapter"),
}).superRefine((subject, ctx) => {
	const total = subject.chapters.reduce(
		(sum, chapter) => sum + Number(chapter.weightPercent || 0),
		0
	);
	if (Math.abs(total - 100) > 0.01) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: "Chapter weights must total 100%",
			path: ["chapters"],
		});
	}
});

export const syllabusSchema = z.object({
	sessionId: z.string().min(1, "Session is required"),
	examId: z.string().min(1, "Exam is required"),
	classId: z.string().min(1, "Class is required"),
	sectionIds: z.array(z.string()).default([]),
	title: z.string().optional(),
	status: z.nativeEnum(SyllabusStatusEnum),
	subjects: z.array(syllabusSubjectSchema).min(1, "Add at least one subject"),
});

export type SyllabusFormValues = z.infer<typeof syllabusSchema>;
