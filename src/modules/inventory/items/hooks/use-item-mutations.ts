import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { ItemFormValues } from "../dto/item.dto";

const invalidateItems = () => {
	mutate((key) => typeof key === "string" && key.startsWith("/inventory/items"));
};

export const createItem = async (data: ItemFormValues) => {
	const response = await axios.post("/inventory/items", data);
	invalidateItems();
	return response.data;
};

export const updateItem = async (id: string, data: Partial<ItemFormValues>) => {
	const response = await axios.patch(`/inventory/items/${id}`, data);
	invalidateItems();
	return response.data;
};

export const deleteItem = async (id: string) => {
	const response = await axios.delete(`/inventory/items/${id}`);
	invalidateItems();
	return response.data;
};
