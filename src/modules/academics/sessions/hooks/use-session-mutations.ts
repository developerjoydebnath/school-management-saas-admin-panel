import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { SessionFormValues } from "../dto/session.dto";

export const refreshSessionCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/sessions"));

export const createSession = async (data: SessionFormValues) => {
	const response = await axios.post("/sessions", data);
	await refreshSessionCaches();
	return response.data;
};

export const updateSession = async (id: string, data: Partial<SessionFormValues>) => {
	const response = await axios.patch(`/sessions/${id}`, data);
	await refreshSessionCaches();
	return response.data;
};

export const deleteSession = async (id: string) => {
	const response = await axios.delete(`/sessions/${id}`);
	await refreshSessionCaches();
	return response.data;
};
