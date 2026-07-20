import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { SectionFormValues } from "../dto/section.dto";

export const refreshSectionCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/sections"));

export const createSection = async (data: SectionFormValues) => {
	const response = await axios.post("/sections", data);
	await refreshSectionCaches();
	return response.data;
};

export const updateSection = async (id: string, data: Partial<SectionFormValues>) => {
	const response = await axios.patch(`/sections/${id}`, data);
	await refreshSectionCaches();
	return response.data;
};

export const deleteSection = async (id: string) => {
	const response = await axios.delete(`/sections/${id}`);
	await refreshSectionCaches();
	return response.data;
};
