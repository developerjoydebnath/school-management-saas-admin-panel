import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { DesignationFormValues } from "../dto/designation.dto";

export const createDesignation = async (data: DesignationFormValues) => {
	const response = await axios.post("/designations", data);
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/designations"));
	return response.data;
};

export const updateDesignation = async (id: string, data: Partial<DesignationFormValues>) => {
	const response = await axios.patch(`/designations/${id}`, data);
	mutate(`/designations/${id}`);
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/designations"));
	return response.data;
};

export const deleteDesignation = async (id: string) => {
	const response = await axios.delete(`/designations/${id}`);
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/designations"));
	return response.data;
};
