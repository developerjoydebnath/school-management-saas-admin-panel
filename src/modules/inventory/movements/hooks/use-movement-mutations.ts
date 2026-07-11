import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { MovementFormValues } from "../dto/movement.dto";

const invalidateMovements = () => {
	mutate((key) => typeof key === "string" && key.startsWith("/inventory/movements"));
};

export const createMovement = async (data: MovementFormValues) => {
	const payload = Object.fromEntries(
		Object.entries(data).filter(([, v]) => v !== undefined && v !== ""),
	);
	const response = await axios.post("/inventory/movements", payload);
	invalidateMovements();
	return response.data;
};
