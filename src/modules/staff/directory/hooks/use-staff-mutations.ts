import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { StaffFormValues } from "../dto/staff.dto";

export const createStaff = async (data: StaffFormValues) => {
	const response = await axios.post("/staff/directory", data);
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/staff/directory"));
	return response.data;
};

export const updateStaff = async (id: string, data: Partial<StaffFormValues>) => {
	const response = await axios.patch(`/staff/directory/${id}`, data);
	mutate(`/staff/directory/${id}`);
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/staff/directory"));
	return response.data;
};

export const updateStaffEmploymentStatus = async (id: string, status: string) => {
	const response = await axios.patch(`/staff/directory/${id}/employment-status`, { status });
	mutate(`/staff/directory/${id}`);
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/staff/directory"));
	return response.data;
};

export const deleteStaffDocument = async (staffId: string, documentId: string) => {
	const response = await axios.delete(`/staff/directory/${staffId}/documents/${documentId}`);
	mutate(`/staff/directory/${staffId}`);
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/staff/directory"));
	return response.data;
};

export const deleteStaff = async (id: string) => {
	const response = await axios.delete(`/staff/directory/${id}`);
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/staff/directory"));
	return response.data;
};
