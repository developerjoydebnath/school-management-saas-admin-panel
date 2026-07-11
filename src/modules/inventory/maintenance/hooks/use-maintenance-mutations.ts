import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { MaintenanceFormValues } from "../dto/maintenance.dto";

const invalidateMaintenances = () => {
	mutate((key) => typeof key === "string" && key.startsWith("/inventory/maintenance"));
};

export const createMaintenance = async (data: MaintenanceFormValues) => {
	const payload = Object.fromEntries(
		Object.entries(data).filter(([, v]) => v !== undefined && v !== ""),
	);
	const response = await axios.post("/inventory/maintenance", payload);
	invalidateMaintenances();
	return response.data;
};

export const updateMaintenance = async (
	id: string,
	data: Partial<MaintenanceFormValues>,
) => {
	const payload = Object.fromEntries(
		Object.entries(data).filter(([, v]) => v !== undefined && v !== ""),
	);
	const response = await axios.patch(`/inventory/maintenance/${id}`, payload);
	invalidateMaintenances();
	return response.data;
};

export const deleteMaintenance = async (id: string) => {
	const response = await axios.delete(`/inventory/maintenance/${id}`);
	invalidateMaintenances();
	return response.data;
};
