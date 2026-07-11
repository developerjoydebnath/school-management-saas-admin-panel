import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { AssetFormValues } from "../dto/asset.dto";

const invalidateAssets = () => {
	mutate((key) => typeof key === "string" && key.startsWith("/inventory/assets"));
};

export const createAsset = async (data: AssetFormValues) => {
	const response = await axios.post("/inventory/assets", data);
	invalidateAssets();
	return response.data;
};

export const updateAsset = async (id: string, data: Partial<AssetFormValues>) => {
	const response = await axios.patch(`/inventory/assets/${id}`, data);
	invalidateAssets();
	return response.data;
};

export const deleteAsset = async (id: string) => {
	const response = await axios.delete(`/inventory/assets/${id}`);
	invalidateAssets();
	return response.data;
};
