import {
	CREATIVE_LADDER,
	OPTION_KEYS,
	QuestionBankFormValues,
	QuestionDifficultyEnum,
	QuestionTypeEnum,
	STATEMENT_LABELS,
} from "./question-bank.dto";

/**
 * Ready-made question shapes, drawn from how a Bangladeshi board paper is
 * actually written.
 *
 * The point is not the placeholder text — it is the STRUCTURE. A সৃজনশীল
 * question always carries a উদ্দীপক and the ক/খ/গ/ঘ ladder at 1/2/3/4 marks; an
 * objective paper's items are always one mark with four options. Picking a
 * template drops that scaffolding in so a teacher types content, not layout.
 *
 * Every template returns a PARTIAL form value: it never touches class, subject
 * or chapter, because those are the teacher's context and must survive
 * switching template.
 */
export type QuestionTemplate = {
	id: string;
	/** i18n key under `QuestionBank.templates`. */
	nameKey: string;
	descriptionKey: string;
	type: QuestionTypeEnum;
	/** Shown on the card so the shape is legible before it is applied. */
	previewKey: string;
	build: () => Partial<QuestionBankFormValues>;
};

const blankOptions = (correctIndex = 0) =>
	OPTION_KEYS.map((key, index) => ({
		key,
		text: "",
		isCorrect: index === correctIndex,
	}));

/** The four canned answers every বহুপদী সমাপ্তিসূচক item uses. */
const completionOptions = () => [
	{ key: "ka", text: "i ও ii", isCorrect: true },
	{ key: "kha", text: "i ও iii", isCorrect: false },
	{ key: "ga", text: "ii ও iii", isCorrect: false },
	{ key: "gha", text: "i, ii ও iii", isCorrect: false },
];

const blankStatements = () =>
	STATEMENT_LABELS.map((label) => ({ label, text: "" }));

const creativeLadder = () =>
	CREATIVE_LADDER.map((rung) => ({
		label: rung.label,
		text: "",
		marks: rung.marks,
		answer: "",
	}));

export const QUESTION_TEMPLATES: QuestionTemplate[] = [
	{
		id: "mcq_simple",
		nameKey: "mcqSimple",
		descriptionKey: "mcqSimpleDescription",
		previewKey: "mcqSimplePreview",
		type: QuestionTypeEnum.MCQ,
		build: () => ({
			type: QuestionTypeEnum.MCQ,
			difficulty: QuestionDifficultyEnum.EASY,
			stimulus: "",
			body: "",
			options: blankOptions(),
			statements: [],
			subQuestions: [],
			pairs: [],
		}),
	},
	{
		id: "mcq_stimulus",
		nameKey: "mcqStimulus",
		descriptionKey: "mcqStimulusDescription",
		previewKey: "mcqStimulusPreview",
		type: QuestionTypeEnum.MCQ,
		build: () => ({
			type: QuestionTypeEnum.MCQ,
			difficulty: QuestionDifficultyEnum.MEDIUM,
			// Pre-seeded so the উদ্দীপক box is visibly part of this template even
			// before anything is typed into it.
			stimulus: "<p></p>",
			body: "",
			options: blankOptions(),
			statements: [],
			subQuestions: [],
			pairs: [],
		}),
	},
	{
		id: "mcq_multiple_completion",
		nameKey: "mcqCompletion",
		descriptionKey: "mcqCompletionDescription",
		previewKey: "mcqCompletionPreview",
		type: QuestionTypeEnum.MCQ_MULTIPLE_COMPLETION,
		build: () => ({
			type: QuestionTypeEnum.MCQ_MULTIPLE_COMPLETION,
			difficulty: QuestionDifficultyEnum.HARD,
			stimulus: "",
			body: "",
			statements: blankStatements(),
			// The option set is fixed by convention, so it is filled in rather
			// than left for the teacher to retype on every question.
			options: completionOptions(),
			subQuestions: [],
			pairs: [],
		}),
	},
	{
		id: "creative",
		nameKey: "creative",
		descriptionKey: "creativeDescription",
		previewKey: "creativePreview",
		type: QuestionTypeEnum.CREATIVE,
		build: () => ({
			type: QuestionTypeEnum.CREATIVE,
			difficulty: QuestionDifficultyEnum.MEDIUM,
			stimulus: "<p></p>",
			body: "",
			subQuestions: creativeLadder(),
			options: [],
			statements: [],
			pairs: [],
		}),
	},
	{
		id: "short_answer",
		nameKey: "shortAnswer",
		descriptionKey: "shortAnswerDescription",
		previewKey: "shortAnswerPreview",
		type: QuestionTypeEnum.SHORT_ANSWER,
		build: () => ({
			type: QuestionTypeEnum.SHORT_ANSWER,
			difficulty: QuestionDifficultyEnum.EASY,
			stimulus: "",
			body: "",
			marks: 2,
			options: [],
			statements: [],
			subQuestions: [],
			pairs: [],
		}),
	},
	{
		id: "descriptive",
		nameKey: "descriptive",
		descriptionKey: "descriptiveDescription",
		previewKey: "descriptivePreview",
		type: QuestionTypeEnum.DESCRIPTIVE,
		build: () => ({
			type: QuestionTypeEnum.DESCRIPTIVE,
			difficulty: QuestionDifficultyEnum.HARD,
			stimulus: "",
			body: "",
			marks: 10,
			options: [],
			statements: [],
			subQuestions: [],
			pairs: [],
		}),
	},
	{
		id: "fill_blanks",
		nameKey: "fillBlanks",
		descriptionKey: "fillBlanksDescription",
		previewKey: "fillBlanksPreview",
		type: QuestionTypeEnum.FILL_IN_THE_BLANKS,
		build: () => ({
			type: QuestionTypeEnum.FILL_IN_THE_BLANKS,
			difficulty: QuestionDifficultyEnum.EASY,
			stimulus: "",
			body: "",
			marks: 1,
			options: [],
			statements: [],
			subQuestions: [],
			pairs: [],
		}),
	},
	{
		id: "true_false",
		nameKey: "trueFalse",
		descriptionKey: "trueFalseDescription",
		previewKey: "trueFalsePreview",
		type: QuestionTypeEnum.TRUE_FALSE,
		build: () => ({
			type: QuestionTypeEnum.TRUE_FALSE,
			difficulty: QuestionDifficultyEnum.EASY,
			stimulus: "",
			body: "",
			marks: 1,
			options: [],
			statements: [],
			subQuestions: [],
			pairs: [],
		}),
	},
	{
		id: "matching",
		nameKey: "matching",
		descriptionKey: "matchingDescription",
		previewKey: "matchingPreview",
		type: QuestionTypeEnum.MATCHING,
		build: () => ({
			type: QuestionTypeEnum.MATCHING,
			difficulty: QuestionDifficultyEnum.MEDIUM,
			stimulus: "",
			body: "",
			marks: 5,
			pairs: Array.from({ length: 5 }, () => ({ left: "", right: "" })),
			options: [],
			statements: [],
			subQuestions: [],
		}),
	},
	{
		id: "one_word",
		nameKey: "oneWord",
		descriptionKey: "oneWordDescription",
		previewKey: "oneWordPreview",
		type: QuestionTypeEnum.ONE_WORD,
		build: () => ({
			type: QuestionTypeEnum.ONE_WORD,
			difficulty: QuestionDifficultyEnum.EASY,
			stimulus: "",
			body: "",
			marks: 1,
			options: [],
			statements: [],
			subQuestions: [],
			pairs: [],
		}),
	},
];

/**
 * The default scaffolding for a type picked from the dropdown rather than the
 * gallery — so changing type never leaves an editor with no structure to fill.
 */
export function scaffoldForType(
	type: QuestionTypeEnum
): Partial<QuestionBankFormValues> {
	const template =
		QUESTION_TEMPLATES.find((item) => item.type === type && item.id !== "mcq_stimulus") ||
		QUESTION_TEMPLATES.find((item) => item.type === type);
	return template ? template.build() : { type };
}
