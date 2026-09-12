import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { EventStatusEnum, EventFormValues } from "../dto/event.dto";

export const refreshEventCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/events"));

const normalize = (data: EventFormValues) => ({
	...data,
	titleBn: data.titleBn?.trim() || undefined,
	description: data.description?.trim() || undefined,
	venue: data.venue?.trim() || undefined,
	startTime: data.startTime?.trim() || undefined,
	endTime: data.endTime?.trim() || undefined,
});

export const createEvent = async (data: EventFormValues) => {
	const response = await axios.post("/events", normalize(data));
	await refreshEventCaches();
	return response.data;
};

export const updateEvent = async (id: string, data: EventFormValues) => {
	const response = await axios.put(`/events/${id}`, normalize(data));
	await refreshEventCaches();
	return response.data;
};

/**
 * Status-only change, from the list row or the calendar rail.
 *
 * A dedicated endpoint rather than the full PUT: that one rebuilds the event
 * from its payload, so a dropdown would need the whole record and would blank
 * whatever it did not resend.
 */
export const updateEventStatus = async (id: string, status: EventStatusEnum) => {
	const response = await axios.patch(`/events/${id}/status`, { status });
	await refreshEventCaches();
	return response.data;
};

export const deleteEvent = async (id: string) => {
	const response = await axios.delete(`/events/${id}`);
	await refreshEventCaches();
	return response.data;
};
