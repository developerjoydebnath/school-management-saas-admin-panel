import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { CreateIncidentPayload, UpdateIncidentPayload } from "../dto/incident.dto";

export const refreshIncidentCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/behavior-incidents"));

export const createIncident = async (data: CreateIncidentPayload) => {
	const response = await axios.post("/behavior-incidents", data);
	await refreshIncidentCaches();
	return response.data;
};

export const updateIncident = async (id: string, data: UpdateIncidentPayload) => {
	const response = await axios.patch(`/behavior-incidents/${id}`, data);
	await refreshIncidentCaches();
	return response.data;
};

export const deleteIncident = async (id: string) => {
	const response = await axios.delete(`/behavior-incidents/${id}`);
	await refreshIncidentCaches();
	return response.data;
};
