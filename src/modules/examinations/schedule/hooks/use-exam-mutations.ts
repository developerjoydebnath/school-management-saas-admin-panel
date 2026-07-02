import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { ExamFormValues } from "../dto/exam.dto";

export const refreshExamCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/exams"));

export const createExam = async (data: ExamFormValues) => {
	const response = await axios.post("/exams", data);
	await refreshExamCaches();
	return response.data;
};

export const updateExam = async (id: string, data: Partial<ExamFormValues>) => {
	const response = await axios.patch(`/exams/${id}`, data);
	await refreshExamCaches();
	return response.data;
};

export const updateExamStatus = async (id: string, status: string) => {
	const response = await axios.patch(`/exams/${id}/status`, { status });
	await refreshExamCaches();
	return response.data;
};

export const deleteExam = async (id: string) => {
	const response = await axios.delete(`/exams/${id}`);
	await refreshExamCaches();
	return response.data;
};
