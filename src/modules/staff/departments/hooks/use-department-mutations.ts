import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { DepartmentFormValues } from "../dto/department.dto";

export const createDepartment = async (data: DepartmentFormValues) => {
	const response = await axios.post("/departments", data);
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/departments"));
	return response.data;
};

export const updateDepartment = async (id: string, data: Partial<DepartmentFormValues>) => {
	const response = await axios.patch(`/departments/${id}`, data);
	mutate(`/departments/${id}`);
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/departments"));
	return response.data;
};

export const deleteDepartment = async (id: string) => {
	const response = await axios.delete(`/departments/${id}`);
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/departments"));
	return response.data;
};
