import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { ClassFormValues } from "../dto/class.dto";

export const refreshClassCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/classes"));

export const createClass = async (data: ClassFormValues) => {
	const response = await axios.post("/classes", data);
	await refreshClassCaches();
	return response.data;
};

export const updateClass = async (id: string, data: Partial<ClassFormValues>) => {
	const response = await axios.patch(`/classes/${id}`, data);
	await refreshClassCaches();
	return response.data;
};

export const deleteClass = async (id: string) => {
	const response = await axios.delete(`/classes/${id}`);
	await refreshClassCaches();
	return response.data;
};
