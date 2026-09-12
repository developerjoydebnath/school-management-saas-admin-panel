import { z } from "zod";

export enum SyllabusStatusEnum {
	DRAFT = "DRAFT",
	PUBLISHED = "PUBLISHED",
	ARCHIVED = "ARCHIVED",
}

export enum SyllabusModeEnum {
	/** Subjects → chapters → topics, with weighted progress tracking. */
	STRUCTURED = "STRUCTURED",
	/** A single rich-text document, the way most schools publish a syllabus. */
	MANUAL = "MANUAL",
}

/** A TipTap editor that was never typed into still serialises to `<p></p>`. */
export const isRichTextEmpty = (value?: string) =>
	!String(value || "")
		.replace(/<[^>]*>/g, "")
		.replace(/&nbsp;/g, " ")
		.trim();

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

export type SyllabusSubjectValues = z.infer<typeof syllabusSubjectSchema>;

/** The strict subject-plan rules, applied only to a STRUCTURED syllabus. */
const structuredSubjectsSchema = z
	.array(syllabusSubjectSchema)
	.min(1, "Add at least one subject");

export const syllabusSchema = z
	.object({
		sessionId: z.string().min(1, "Session is required"),
		classId: z.string().min(1, "Class is required"),
		examId: z.string().min(1, "Exam is required"),
		sectionIds: z.array(z.string()).default([]),
		title: z.string().optional(),
		status: z.nativeEnum(SyllabusStatusEnum),
		mode: z.nativeEnum(SyllabusModeEnum).default(SyllabusModeEnum.STRUCTURED),
		content: z.string().optional(),
		// The form keeps a subject scaffold in state for both modes so switching
		// back and forth does not discard a plan the user already built. It is
		// therefore declared permissively here (typed, but unchecked) and the
		// real rules run in superRefine for STRUCTURED only — otherwise a manual
		// syllabus would fail on the blank scaffold's "Subject is required",
		// with nothing on screen to fix because the subject UI is not rendered.
		subjects: z.array(z.custom<SyllabusSubjectValues>()).default([]),
	})
	.superRefine((data, ctx) => {
		if (data.mode === SyllabusModeEnum.MANUAL) {
			if (isRichTextEmpty(data.content)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Syllabus content is required",
					path: ["content"],
				});
			}
			return;
		}

		const result = structuredSubjectsSchema.safeParse(data.subjects);
		if (result.success) return;

		// Re-anchor every issue under `subjects` so field-level messages still
		// land on the exact input (e.g. subjects.0.chapters.1.title).
		for (const issue of result.error.issues) {
			ctx.addIssue({
				...issue,
				path: ["subjects", ...issue.path],
			} as z.IssueData);
		}
	});

export type SyllabusFormValues = z.infer<typeof syllabusSchema>;
