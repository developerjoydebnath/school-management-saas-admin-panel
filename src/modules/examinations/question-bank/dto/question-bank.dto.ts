import { z } from "zod";

export enum QuestionTypeEnum {
	MCQ = "MCQ",
	MCQ_MULTIPLE_COMPLETION = "MCQ_MULTIPLE_COMPLETION",
	CREATIVE = "CREATIVE",
	SHORT_ANSWER = "SHORT_ANSWER",
	DESCRIPTIVE = "DESCRIPTIVE",
	FILL_IN_THE_BLANKS = "FILL_IN_THE_BLANKS",
	TRUE_FALSE = "TRUE_FALSE",
	MATCHING = "MATCHING",
	ONE_WORD = "ONE_WORD",
}

export enum QuestionDifficultyEnum {
	EASY = "EASY",
	MEDIUM = "MEDIUM",
	HARD = "HARD",
}

export enum QuestionStatusEnum {
	DRAFT = "DRAFT",
	PUBLISHED = "PUBLISHED",
	ARCHIVED = "ARCHIVED",
}

/**
 * The Bangla option letters a printed paper uses. Stored as stable ASCII keys
 * so the data does not depend on the display language, and rendered as
 * ক/খ/গ/ঘ wherever a paper is shown.
 */
export const OPTION_KEYS = ["ka", "kha", "ga", "gha"] as const;
export const OPTION_LABELS: Record<string, string> = {
	ka: "ক",
	kha: "খ",
	ga: "গ",
	gha: "ঘ",
};

/** i / ii / iii for the বহুপদী সমাপ্তিসূচক form. */
export const STATEMENT_LABELS = ["i", "ii", "iii"] as const;

/**
 * The সৃজনশীল ladder, fixed by the board.
 *
 * ক জ্ঞান 1 · খ অনুধাবন 2 · গ প্রয়োগ 3 · ঘ উচ্চতর দক্ষতা 4 — always ten marks in
 * total, which is why the form ships this shape rather than asking for it.
 */
export const CREATIVE_LADDER = [
	{ label: "ka", marks: 1, level: "knowledge" },
	{ label: "kha", marks: 2, level: "comprehension" },
	{ label: "ga", marks: 3, level: "application" },
	{ label: "gha", marks: 4, level: "higherAbility" },
] as const;

export type QuestionOption = { key: string; text: string; isCorrect?: boolean };
export type QuestionStatement = { label: string; text: string };
export type QuestionSubQuestion = {
	label: string;
	text: string;
	marks: number;
	answer?: string;
};
export type QuestionPair = { left: string; right: string };

export type QuestionBankItem = {
	id: string;
	sessionId?: string | null;
	classId: string;
	subjectId: string;
	chapter?: string | null;
	section?: string | null;
	type: QuestionTypeEnum;
	difficulty: QuestionDifficultyEnum;
	status: QuestionStatusEnum;
	stimulus?: string | null;
	body: string;
	answer?: string | null;
	notes?: string | null;
	options: QuestionOption[];
	statements: QuestionStatement[];
	subQuestions: QuestionSubQuestion[];
	pairs: QuestionPair[];
	/** Derived server-side from the question's own structure. */
	marks: number;
	source?: string | null;
	boardYear?: number | null;
	tags: string[];
	usageCount: number;
	lastUsedAt?: string | null;
	createdAt: string;
	updatedAt: string;
	class?: { id: string; enName: string; bnName?: string | null } | null;
	subject?: {
		id: string;
		enName: string;
		bnName?: string | null;
		code?: string | null;
	} | null;
};

const emptyToUndefined = (value: unknown) =>
	typeof value === "string" && value.trim() === "" ? undefined : value;

/**
 * Structural rules are enforced here as well as on the server so the editor can
 * point at the offending field instead of surfacing a toast with no target.
 */
export const questionBankSchema = z
	.object({
		sessionId: z.preprocess(emptyToUndefined, z.string().optional()),
		classId: z.string().min(1, "Class is required"),
		subjectId: z.string().min(1, "Subject is required"),
		chapter: z.string().max(255).optional(),
		section: z.string().max(120).optional(),
		type: z.nativeEnum(QuestionTypeEnum),
		difficulty: z.nativeEnum(QuestionDifficultyEnum),
		status: z.nativeEnum(QuestionStatusEnum),
		stimulus: z.string().optional(),
		body: z.string().min(1, "Question text is required"),
		answer: z.string().optional(),
		notes: z.string().optional(),
		options: z
			.array(
				z.object({
					key: z.string(),
					text: z.string().optional().default(""),
					isCorrect: z.boolean().optional().default(false),
				})
			)
			.optional(),
		statements: z
			.array(z.object({ label: z.string(), text: z.string().optional().default("") }))
			.optional(),
		subQuestions: z
			.array(
				z.object({
					label: z.string(),
					text: z.string().optional().default(""),
					marks: z.coerce.number().min(1).max(20),
					answer: z.string().optional(),
				})
			)
			.optional(),
		pairs: z
			.array(
				z.object({
					left: z.string().optional().default(""),
					right: z.string().optional().default(""),
				})
			)
			.optional(),
		marks: z.coerce.number().min(1).max(200).optional(),
		source: z.string().max(255).optional(),
		boardYear: z.preprocess(
			(value) =>
				value === "" || value === null || value === undefined ? undefined : Number(value),
			z.number().min(1900).max(2200).optional()
		),
		tags: z.array(z.string()).optional(),
	})
	.superRefine((data, ctx) => {
		const isMcq =
			data.type === QuestionTypeEnum.MCQ ||
			data.type === QuestionTypeEnum.MCQ_MULTIPLE_COMPLETION;

		if (isMcq) {
			const filled = (data.options || []).filter((option) => option.text?.trim());
			if (filled.length < 2) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Write at least two options",
					path: ["options"],
				});
			}
			if (filled.length >= 2 && !filled.some((option) => option.isCorrect)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Mark the correct option",
					path: ["options"],
				});
			}
		}

		if (data.type === QuestionTypeEnum.MCQ_MULTIPLE_COMPLETION) {
			const filled = (data.statements || []).filter((item) => item.text?.trim());
			if (filled.length < 2) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Write at least two i/ii/iii statements",
					path: ["statements"],
				});
			}
		}

		if (data.type === QuestionTypeEnum.CREATIVE) {
			const filled = (data.subQuestions || []).filter((sub) => sub.text?.trim());
			if (filled.length < 2) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Write at least two of the ক/খ/গ/ঘ parts",
					path: ["subQuestions"],
				});
			}
		}

		if (data.type === QuestionTypeEnum.MATCHING) {
			const filled = (data.pairs || []).filter(
				(pair) => pair.left?.trim() && pair.right?.trim()
			);
			if (filled.length < 2) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Add at least two complete pairs",
					path: ["pairs"],
				});
			}
		}
	});

export type QuestionBankFormValues = z.infer<typeof questionBankSchema>;

/** Types whose marks the server derives; the form hides the marks field. */
export const FIXED_MARK_TYPES = new Set<QuestionTypeEnum>([
	QuestionTypeEnum.MCQ,
	QuestionTypeEnum.MCQ_MULTIPLE_COMPLETION,
	QuestionTypeEnum.CREATIVE,
]);

export const questionTypeOptions = [
	{ label: "MCQ", value: QuestionTypeEnum.MCQ },
	{ label: "Multiple Completion", value: QuestionTypeEnum.MCQ_MULTIPLE_COMPLETION },
	{ label: "Creative (CQ)", value: QuestionTypeEnum.CREATIVE },
	{ label: "Short Answer", value: QuestionTypeEnum.SHORT_ANSWER },
	{ label: "Descriptive", value: QuestionTypeEnum.DESCRIPTIVE },
	{ label: "Fill in the Blanks", value: QuestionTypeEnum.FILL_IN_THE_BLANKS },
	{ label: "True / False", value: QuestionTypeEnum.TRUE_FALSE },
	{ label: "Matching", value: QuestionTypeEnum.MATCHING },
	{ label: "One Word", value: QuestionTypeEnum.ONE_WORD },
];

export const difficultyOptions = [
	{ label: "Easy", value: QuestionDifficultyEnum.EASY },
	{ label: "Medium", value: QuestionDifficultyEnum.MEDIUM },
	{ label: "Hard", value: QuestionDifficultyEnum.HARD },
];

export const statusOptions = [
	{ label: "Draft", value: QuestionStatusEnum.DRAFT },
	{ label: "Published", value: QuestionStatusEnum.PUBLISHED },
	{ label: "Archived", value: QuestionStatusEnum.ARCHIVED },
];

/** The বিভাগ a Bangla/English paper groups its questions under. */
export const sectionOptions = [
	{ label: "গদ্য (Prose)", value: "গদ্য" },
	{ label: "কবিতা (Poetry)", value: "কবিতা" },
	{ label: "ব্যাকরণ (Grammar)", value: "ব্যাকরণ" },
	{ label: "নির্মিতি (Composition)", value: "নির্মিতি" },
	{ label: "সাধারণ (General)", value: "সাধারণ" },
];

export const questionTypeColors: Record<string, { bg: string; text: string }> = {
	MCQ: { bg: "bg-sky-500/15", text: "text-sky-700 dark:text-sky-400" },
	MCQ_MULTIPLE_COMPLETION: {
		bg: "bg-cyan-500/15",
		text: "text-cyan-700 dark:text-cyan-400",
	},
	CREATIVE: { bg: "bg-violet-500/15", text: "text-violet-700 dark:text-violet-400" },
	SHORT_ANSWER: { bg: "bg-teal-500/15", text: "text-teal-700 dark:text-teal-400" },
	DESCRIPTIVE: { bg: "bg-indigo-500/15", text: "text-indigo-700 dark:text-indigo-400" },
	FILL_IN_THE_BLANKS: { bg: "bg-amber-500/15", text: "text-amber-700 dark:text-amber-400" },
	TRUE_FALSE: { bg: "bg-lime-500/15", text: "text-lime-700 dark:text-lime-400" },
	MATCHING: { bg: "bg-orange-500/15", text: "text-orange-700 dark:text-orange-400" },
	ONE_WORD: { bg: "bg-slate-500/15", text: "text-slate-700 dark:text-slate-400" },
};

export const difficultyColors: Record<string, { bg: string; text: string }> = {
	EASY: { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-400" },
	MEDIUM: { bg: "bg-amber-500/15", text: "text-amber-700 dark:text-amber-400" },
	HARD: { bg: "bg-rose-500/15", text: "text-rose-700 dark:text-rose-400" },
};

export const statusColors: Record<string, { bg: string; text: string }> = {
	DRAFT: { bg: "bg-slate-500/15", text: "text-slate-700 dark:text-slate-400" },
	PUBLISHED: { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-400" },
	ARCHIVED: { bg: "bg-muted", text: "text-muted-foreground" },
};
