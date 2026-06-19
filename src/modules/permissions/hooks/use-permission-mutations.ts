import axios from "@/shared/lib/axios";
import { PermissionFormValues } from "../dto/permission.dto";

export const createPermission = async (data: PermissionFormValues) => {
	const response = await axios.post("/permissions", data);
	return response.data;
};

export const updatePermission = async (id: number, data: Partial<PermissionFormValues>) => {
	const response = await axios.patch(`/permissions/${id}`, data);
	return response.data;
};

export const deletePermission = async (id: number) => {
	const response = await axios.delete(`/permissions/${id}`);
	return response.data;
};
