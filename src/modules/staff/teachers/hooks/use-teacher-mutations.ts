import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { TeacherFormValues } from "../dto/teacher.dto";

export const createTeacher = async (data: TeacherFormValues) => {
	const response = await axios.post("/staff/teachers", data);
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/staff/teachers"));
	return response.data;
};

export const updateTeacher = async (id: string, data: Partial<TeacherFormValues>) => {
	const response = await axios.patch(`/staff/teachers/${id}`, data);
	mutate(`/staff/teachers/${id}`);
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/staff/teachers"));
	return response.data;
};

export const updateTeacherEmploymentStatus = async (id: string, status: string) => {
	const response = await axios.patch(`/staff/teachers/${id}/employment-status`, { status });
	mutate(`/staff/teachers/${id}`);
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/staff/teachers"));
	return response.data;
};

export const deleteTeacherDocument = async (teacherId: string, documentId: string) => {
	const response = await axios.delete(`/staff/teachers/${teacherId}/documents/${documentId}`);
	mutate(`/staff/teachers/${teacherId}`);
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/staff/teachers"));
	return response.data;
};

export const deleteTeacher = async (id: string) => {
	const response = await axios.delete(`/staff/teachers/${id}`);
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/staff/teachers"));
	return response.data;
};
