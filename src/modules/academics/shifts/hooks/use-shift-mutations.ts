import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { ShiftFormValues } from "../dto/shift.dto";

export const refreshShiftCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/shifts"));

export const createShift = async (data: ShiftFormValues) => {
	const response = await axios.post("/shifts", data);
	await refreshShiftCaches();
	return response.data;
};

export const updateShift = async (id: string, data: Partial<ShiftFormValues>) => {
	const response = await axios.patch(`/shifts/${id}`, data);
	await refreshShiftCaches();
	return response.data;
};

export const deleteShift = async (id: string) => {
	const response = await axios.delete(`/shifts/${id}`);
	await refreshShiftCaches();
	return response.data;
};
