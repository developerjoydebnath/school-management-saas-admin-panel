import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { RoleModel } from "@/shared/models/role.model";

const BASE_URL = "/roles";

export async function createRole(payload: any): Promise<RoleModel> {
	const response = await axios.post(BASE_URL, payload);
	mutate(BASE_URL);
	return new RoleModel(response.data);
}

export async function updateRole(id: string, payload: any): Promise<RoleModel> {
	const response = await axios.patch(`${BASE_URL}/${id}`, payload);
	mutate(BASE_URL);
	mutate(`${BASE_URL}/${id}`);
	return new RoleModel(response.data);
}

export async function deleteRole(id: string): Promise<void> {
	await axios.delete(`${BASE_URL}/${id}`);
	mutate(BASE_URL);
	mutate(`${BASE_URL}/${id}`);
}
