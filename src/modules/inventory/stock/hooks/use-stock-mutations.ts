import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { StockFormValues } from "../dto/stock.dto";

const invalidateStock = () => {
	mutate((key) => typeof key === "string" && key.startsWith("/inventory/stock-batches"));
};

export const createStockBatch = async (data: StockFormValues) => {
	const response = await axios.post("/inventory/stock-batches", data);
	invalidateStock();
	return response.data;
};

export const updateStockBatch = async (id: string, data: Partial<StockFormValues>) => {
	const response = await axios.patch(`/inventory/stock-batches/${id}`, data);
	invalidateStock();
	return response.data;
};

export const deleteStockBatch = async (id: string) => {
	const response = await axios.delete(`/inventory/stock-batches/${id}`);
	invalidateStock();
	return response.data;
};
