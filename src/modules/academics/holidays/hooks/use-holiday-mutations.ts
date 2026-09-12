import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { HolidayFormValues } from "../dto/holiday.dto";

export const refreshHolidayCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/holidays"));

const normalize = (data: HolidayFormValues) => ({
	...data,
	titleBn: data.titleBn?.trim() || undefined,
	description: data.description?.trim() || undefined,
});

export const createHoliday = async (data: HolidayFormValues) => {
	const response = await axios.post("/holidays", normalize(data));
	await refreshHolidayCaches();
	return response.data;
};

export const updateHoliday = async (id: string, data: HolidayFormValues) => {
	const response = await axios.put(`/holidays/${id}`, normalize(data));
	await refreshHolidayCaches();
	return response.data;
};

/**
 * Closed/open change only, from a list row or the calendar rail.
 *
 * A dedicated endpoint rather than the full PUT: that one rebuilds the holiday
 * from its payload, so a toggle would have to resend every field.
 */
export const updateHolidayStatus = async (id: string, isClosed: boolean) => {
	const response = await axios.patch(`/holidays/${id}/status`, { isClosed });
	await refreshHolidayCaches();
	return response.data;
};

export const deleteHoliday = async (id: string) => {
	const response = await axios.delete(`/holidays/${id}`);
	await refreshHolidayCaches();
	return response.data;
};

export const updateAcademicCalendarSettings = async (weeklyOffDays: number[]) => {
	const response = await axios.patch("/holidays/settings", { weeklyOffDays });
	await mutate("/holidays/settings");
	return response.data;
};

export const copyHolidaysFromSession = async (
	sourceSessionId: string,
	targetSessionId: string,
) => {
	const response = await axios.post("/holidays/copy-from-session", {
		sourceSessionId,
		targetSessionId,
	});
	await refreshHolidayCaches();
	return response.data;
};

export const seedDefaultHolidays = async (sessionId: string) => {
	const response = await axios.post("/holidays/seed-defaults", { sessionId });
	await refreshHolidayCaches();
	return response.data;
};
