import { z } from "zod";

export interface Homework {
	id: string;
	title: string;
	subjectId: string;
	subjectName: string;
	classId: string;
	className: string;
	assignedDate: string;
	dueDate: string;
	status: "Active" | "Completed" | "Past Due";
	description: string;
}

export const homeworkSchema = z.object({
	title: z.string().min(1, "Title is required"),
	subjectId: z.string().min(1, "Subject is required"),
	classId: z.string().min(1, "Class is required"),
	assignedDate: z.string().min(1, "Assigned Date is required"),
	dueDate: z.string().min(1, "Due Date is required"),
	status: z.enum(["Active", "Completed", "Past Due"]),
	description: z.string().optional(),
});

export type HomeworkFormValues = z.infer<typeof homeworkSchema>;
