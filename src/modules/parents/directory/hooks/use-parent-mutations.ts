import axios from "@/shared/lib/axios";
import type { ParentProfileFormValues } from "../dto/parent.dto";

export async function updateParentProfile(
	id: string,
	data: ParentProfileFormValues
) {
	const response = await axios.patch(`/parents/${id}`, data);
	return response.data;
}
