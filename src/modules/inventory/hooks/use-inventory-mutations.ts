import axios from "@/shared/lib/axios";
import { InventoryResource } from "./use-inventory";

export const createInventoryRecord = async (
	resource: InventoryResource,
	data: Record<string, unknown>
) => {
	const response = await axios.post(`/inventory/${resource}`, data);
	return response.data;
};

export const updateInventoryRecord = async (
	resource: Exclude<InventoryResource, "movements">,
	id: string,
	data: Record<string, unknown>
) => {
	const response = await axios.patch(`/inventory/${resource}/${id}`, data);
	return response.data;
};

export const deleteInventoryRecord = async (
	resource: Exclude<InventoryResource, "movements">,
	id: string
) => {
	const response = await axios.delete(`/inventory/${resource}/${id}`);
	return response.data;
};

export const seedInventoryDefaults = async () => {
	const response = await axios.post("/inventory/seed");
	return response.data;
};
