import axios from "@/shared/lib/axios";

export const deleteSchool = async (id: string) => {
	const response = await axios.delete(`/superadmin/schools/${id}`);
	return response.data;
};

export const updateSchoolStatus = async (id: string, status: string) => {
	let url = `/superadmin/schools/${id}`;
	if (status === "active") url += "/approve";
	else if (status === "rejected") url += "/reject";
	else if (status === "suspended") url += "/suspend";
	else if (status === "reactivated") url += "/reactivate"; // Need to handle based on backend API. Backend has approve, reject, suspend, reactivate.
	
	const response = await axios.post(url);
	return response.data;
};
