import { z } from "zod";

export interface OnlineClass {
	id: string;
	title: string;
	classId: string;
	className: string;
	subjectId: string;
	subjectName: string;
	teacherId: string;
	teacherName: string;
	date: string;
	startTime: string;
	endTime: string;
	platform: "Zoom" | "Google Meet" | "Teams";
	meetingLink: string;
	status: "Scheduled" | "Ongoing" | "Completed" | "Cancelled";
}

export const onlineClassSchema = z.object({
	title: z.string().min(1, "Title is required"),
	classId: z.string().min(1, "Class is required"),
	subjectId: z.string().min(1, "Subject is required"),
	teacherId: z.string().min(1, "Teacher is required"),
	date: z.string().min(1, "Date is required"),
	startTime: z.string().min(1, "Start time is required"),
	endTime: z.string().min(1, "End time is required"),
	platform: z.enum(["Zoom", "Google Meet", "Teams"]).default("Zoom"),
	meetingLink: z.string().url("Valid meeting link is required"),
	status: z.enum(["Scheduled", "Ongoing", "Completed", "Cancelled"]).default("Scheduled"),
});

export type OnlineClassFormValues = z.infer<typeof onlineClassSchema>;
