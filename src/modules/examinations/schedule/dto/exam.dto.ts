import { z } from "zod";

export enum ExamTypeEnum {
	UNIT_TEST = "UNIT_TEST",
	CLASS_TEST = "CLASS_TEST",
	FIRST_TERM = "FIRST_TERM",
	HALF_YEARLY = "HALF_YEARLY",
	ANNUAL = "ANNUAL",
	FINAL = "FINAL",
	MODEL_TEST = "MODEL_TEST",
	MOCK_TEST = "MOCK_TEST",
	PRE_TEST = "PRE_TEST",
	CUSTOM = "CUSTOM",
}

export enum ExamStatusEnum {
	DRAFT = "DRAFT",
	SCHEDULED = "SCHEDULED",
	ONGOING = "ONGOING",
	COMPLETED = "COMPLETED",
	CANCELLED = "CANCELLED",
	ARCHIVED = "ARCHIVED",
}

export const examSchema = z
	.object({
		sessionId: z.string().min(1, "Session is required"),
		name: z.string().min(1, "Exam name is required"),
		nameBn: z.string().optional(),
		type: z.nativeEnum(ExamTypeEnum),
		startDate: z.string().min(1, "Start date is required"),
		endDate: z.string().min(1, "End date is required"),
		status: z.nativeEnum(ExamStatusEnum),
		classIds: z.array(z.string()).min(1, "Select at least one class"),
		instructions: z.string().optional(),
		instructionsBn: z.string().optional(),
		gradingScale: z.string().optional(),
		defaultTotalMarks: z.coerce.number().int().min(1).optional(),
		defaultPassMarks: z.coerce.number().int().min(0).optional(),
		notes: z.string().optional(),
	})
	.refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
		message: "End date must be after start date",
		path: ["endDate"],
	});

export type ExamFormValues = z.infer<typeof examSchema>;
