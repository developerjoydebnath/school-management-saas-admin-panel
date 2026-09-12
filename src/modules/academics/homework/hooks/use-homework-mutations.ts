import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import {
	HomeworkFormValues,
	HomeworkStatusEnum,
	HomeworkSubmissionStatusEnum,
} from "../dto/homework.dto";

export const refreshHomeworkCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/homeworks"));

const normalize = (data: HomeworkFormValues) => ({
	...data,
	// The API treats absent optional ids as "not provided"; empty strings from
	// selects would fail UUID validation.
	sectionId: data.sectionId || undefined,
	teacherId: data.teacherId || undefined,
	lessonPlanId: data.lessonPlanId || undefined,
	titleBn: data.titleBn?.trim() || undefined,
	instructions: data.instructions?.trim() || undefined,
	totalMarks: data.totalMarks ?? undefined,
});

export const createHomework = async (data: HomeworkFormValues) => {
	const response = await axios.post("/homeworks", normalize(data));
	await refreshHomeworkCaches();
	return response.data;
};

export const updateHomework = async (id: string, data: HomeworkFormValues) => {
	const response = await axios.put(`/homeworks/${id}`, normalize(data));
	await refreshHomeworkCaches();
	return response.data;
};

export const updateHomeworkStatus = async (id: string, status: HomeworkStatusEnum) => {
	const response = await axios.patch(`/homeworks/${id}/status`, { status });
	await refreshHomeworkCaches();
	return response.data;
};

export const deleteHomework = async (id: string) => {
	const response = await axios.delete(`/homeworks/${id}`);
	await refreshHomeworkCaches();
	return response.data;
};

export const saveHomeworkSubmissions = async (
	id: string,
	submissions: {
		studentId: string;
		status: HomeworkSubmissionStatusEnum;
		obtainedMarks?: number;
		remarks?: string;
	}[]
) => {
	const response = await axios.post(`/homeworks/${id}/submissions`, { submissions });
	await refreshHomeworkCaches();
	return response.data;
};
