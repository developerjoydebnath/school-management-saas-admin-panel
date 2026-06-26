import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { SubjectFormValues } from "../dto/subject.dto";

export const refreshSubjectCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/subjects"));

export const createSubject = async (data: SubjectFormValues) => {
	const response = await axios.post("/subjects", data);
	await refreshSubjectCaches();
	return response.data;
};

export const updateSubject = async (id: string, data: Partial<SubjectFormValues>) => {
	const response = await axios.patch(`/subjects/${id}`, data);
	await refreshSubjectCaches();
	return response.data;
};

export const deleteSubject = async (id: string) => {
	const response = await axios.delete(`/subjects/${id}`);
	await refreshSubjectCaches();
	return response.data;
};
