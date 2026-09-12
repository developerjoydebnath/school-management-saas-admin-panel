import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import {
	OnlineClassAttendanceStatusEnum,
	OnlineClassFormValues,
	OnlineClassStatusEnum,
} from "../dto/online-class.dto";

export const refreshOnlineClassCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/online-classes"));

const normalize = (data: OnlineClassFormValues) => ({
	...data,
	sectionId: data.sectionId || undefined,
	teacherId: data.teacherId || undefined,
	titleBn: data.titleBn?.trim() || undefined,
	description: data.description?.trim() || undefined,
	meetingId: data.meetingId?.trim() || undefined,
	passcode: data.passcode?.trim() || undefined,
});

export const createOnlineClass = async (data: OnlineClassFormValues) => {
	const response = await axios.post("/online-classes", normalize(data));
	await refreshOnlineClassCaches();
	return response.data;
};

export const updateOnlineClass = async (id: string, data: OnlineClassFormValues) => {
	const response = await axios.put(`/online-classes/${id}`, normalize(data));
	await refreshOnlineClassCaches();
	return response.data;
};

export const updateOnlineClassStatus = async (id: string, status: OnlineClassStatusEnum) => {
	const response = await axios.patch(`/online-classes/${id}/status`, { status });
	await refreshOnlineClassCaches();
	return response.data;
};

export const deleteOnlineClass = async (id: string) => {
	const response = await axios.delete(`/online-classes/${id}`);
	await refreshOnlineClassCaches();
	return response.data;
};

export const saveOnlineClassAttendance = async (
	id: string,
	records: { studentId: string; status: OnlineClassAttendanceStatusEnum }[]
) => {
	const response = await axios.post(`/online-classes/${id}/attendance`, { records });
	await refreshOnlineClassCaches();
	return response.data;
};
