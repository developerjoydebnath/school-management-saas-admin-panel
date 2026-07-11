import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { CategoryFormValues } from "../dto/category.dto";

const invalidateCategories = () => {
	mutate((key) => typeof key === "string" && key.startsWith("/inventory/categories"));
};

export const createCategory = async (data: CategoryFormValues) => {
	const response = await axios.post("/inventory/categories", data);
	invalidateCategories();
	return response.data;
};

export const updateCategory = async (id: string, data: Partial<CategoryFormValues>) => {
	const response = await axios.patch(`/inventory/categories/${id}`, data);
	invalidateCategories();
	return response.data;
};

export const deleteCategory = async (id: string) => {
	const response = await axios.delete(`/inventory/categories/${id}`);
	invalidateCategories();
	return response.data;
};
