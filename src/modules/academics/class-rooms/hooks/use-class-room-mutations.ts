import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { ClassRoomFormValues } from "../dto/class-room.dto";

export const refreshClassRoomCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/class-rooms"));

export const createClassRoom = async (data: ClassRoomFormValues) => {
	const response = await axios.post("/class-rooms", data);
	await refreshClassRoomCaches();
	return response.data;
};

export const updateClassRoom = async (id: string, data: Partial<ClassRoomFormValues>) => {
	const response = await axios.patch(`/class-rooms/${id}`, data);
	await refreshClassRoomCaches();
	return response.data;
};

export const deleteClassRoom = async (id: string) => {
	const response = await axios.delete(`/class-rooms/${id}`);
	await refreshClassRoomCaches();
	return response.data;
};
