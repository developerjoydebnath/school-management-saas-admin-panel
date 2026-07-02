import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { SyllabusFormValues } from "../dto/syllabus.dto";

export const refreshSyllabusCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/syllabuses"));

export const createSyllabus = async (data: SyllabusFormValues) => {
	const response = await axios.post("/syllabuses", data);
	await refreshSyllabusCaches();
	return response.data;
};

export const updateSyllabus = async (id: string, data: Partial<SyllabusFormValues>) => {
	const response = await axios.patch(`/syllabuses/${id}`, data);
	await refreshSyllabusCaches();
	return response.data;
};

export const updateSyllabusStatus = async (id: string, status: string) => {
	const response = await axios.patch(`/syllabuses/${id}/status`, { status });
	await refreshSyllabusCaches();
	return response.data;
};

export const deleteSyllabus = async (id: string) => {
	const response = await axios.delete(`/syllabuses/${id}`);
	await refreshSyllabusCaches();
	return response.data;
};

export const toggleSyllabusTopic = async (
	id: string,
	topicId: string,
	payload: { isCompleted?: boolean; progressPercent?: number }
) => {
	const response = await axios.patch(`/syllabuses/${id}/topics/${topicId}`, payload);
	await refreshSyllabusCaches();
	return response.data;
};
