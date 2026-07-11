import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { LocationFormValues } from "../dto/location.dto";

const invalidateLocations = () => {
	mutate((key) => typeof key === "string" && key.startsWith("/inventory/locations"));
};

export const createLocation = async (data: LocationFormValues) => {
	const response = await axios.post("/inventory/locations", data);
	invalidateLocations();
	return response.data;
};

export const updateLocation = async (id: string, data: Partial<LocationFormValues>) => {
	const response = await axios.patch(`/inventory/locations/${id}`, data);
	invalidateLocations();
	return response.data;
};

export const deleteLocation = async (id: string) => {
	const response = await axios.delete(`/inventory/locations/${id}`);
	invalidateLocations();
	return response.data;
};
