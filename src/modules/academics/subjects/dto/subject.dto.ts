import { StatusEnum, SubjectMarkDivisionEnum, SubjectTypeEnum } from "@/shared/types/enums";
import { z } from "zod";

const optionalText = z.string().optional();
const optionalNumber = z.coerce.number().int().min(0).optional();

export const subjectSchema = z.object({
	enName: z.string().min(1, { message: "English subject name is required" }),
	bnName: optionalText,
	code: optionalText,
	boardCode: optionalText,
	type: z.enum(SubjectTypeEnum),
	group: optionalText,
	paperCount: z.coerce.number().int().min(1, { message: "Paper count is required" }),
	fullMarks: z.coerce.number().int().min(1, { message: "Full marks is required" }),
	passMarks: z.coerce.number().int().min(0, { message: "Pass marks is required" }),
	markDivision: z.enum(SubjectMarkDivisionEnum),
	writtenMarks: optionalNumber,
	writtenPassMarks: optionalNumber,
	mcqMarks: optionalNumber,
	mcqPassMarks: optionalNumber,
	practicalMarks: optionalNumber,
	practicalPassMarks: optionalNumber,
	theoryMarks: optionalNumber,
	sortOrder: optionalNumber,
	classIds: z.array(z.string()).default([]),
	status: z.enum(StatusEnum),
	description: optionalText,
}).superRefine((data, ctx) => {
	const hasMcq =
		data.markDivision === SubjectMarkDivisionEnum.WRITTEN_MCQ ||
		data.markDivision === SubjectMarkDivisionEnum.WRITTEN_MCQ_PRACTICAL;
	const hasPractical = data.markDivision === SubjectMarkDivisionEnum.WRITTEN_MCQ_PRACTICAL;
	const writtenMarks = data.writtenMarks || 0;
	const writtenPassMarks = data.writtenPassMarks || 0;
	const mcqMarks = hasMcq ? data.mcqMarks || 0 : 0;
	const mcqPassMarks = hasMcq ? data.mcqPassMarks || 0 : 0;
	const practicalMarks = hasPractical ? data.practicalMarks || 0 : 0;
	const practicalPassMarks = hasPractical ? data.practicalPassMarks || 0 : 0;

	if (writtenMarks <= 0) {
		ctx.addIssue({ code: "custom", path: ["writtenMarks"], message: "Written marks is required" });
	}
	if (writtenPassMarks > writtenMarks) {
		ctx.addIssue({ code: "custom", path: ["writtenPassMarks"], message: "Written pass marks cannot exceed written marks" });
	}
	if (hasMcq && mcqMarks <= 0) {
		ctx.addIssue({ code: "custom", path: ["mcqMarks"], message: "MCQ marks is required" });
	}
	if (mcqPassMarks > mcqMarks) {
		ctx.addIssue({ code: "custom", path: ["mcqPassMarks"], message: "MCQ pass marks cannot exceed MCQ marks" });
	}
	if (hasPractical && practicalMarks <= 0) {
		ctx.addIssue({ code: "custom", path: ["practicalMarks"], message: "Practical marks is required" });
	}
	if (practicalPassMarks > practicalMarks) {
		ctx.addIssue({ code: "custom", path: ["practicalPassMarks"], message: "Practical pass marks cannot exceed practical marks" });
	}
	if (writtenMarks + mcqMarks + practicalMarks !== data.fullMarks) {
		ctx.addIssue({ code: "custom", path: ["fullMarks"], message: "Part marks must equal full marks" });
	}
	if (writtenPassMarks + mcqPassMarks + practicalPassMarks !== data.passMarks) {
		ctx.addIssue({ code: "custom", path: ["passMarks"], message: "Part pass marks must equal total pass marks" });
	}
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;
