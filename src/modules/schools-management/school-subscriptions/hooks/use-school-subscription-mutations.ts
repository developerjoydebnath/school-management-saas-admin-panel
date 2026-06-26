import axios from "@/shared/lib/axios";
import { SchoolSubscriptionFormValues } from "../dto/school-subscription.dto";

const cleanPayload = (data: Partial<SchoolSubscriptionFormValues>) =>
	Object.fromEntries(
		Object.entries(data).filter(([, value]) => value !== "" && value !== null && value !== undefined)
	);

export const createSchoolSubscription = async (data: SchoolSubscriptionFormValues) => {
	const response = await axios.post("/superadmin/school-subscriptions", cleanPayload(data));
	return response.data;
};

export const updateSchoolSubscription = async (
	id: string,
	data: Partial<SchoolSubscriptionFormValues>
) => {
	const payload = { ...data };
	delete payload.schoolId;
	const response = await axios.patch(
		`/superadmin/school-subscriptions/${id}`,
		cleanPayload(payload)
	);
	return response.data;
};

export const deleteSchoolSubscription = async (id: string) => {
	const response = await axios.delete(`/superadmin/school-subscriptions/${id}`);
	return response.data;
};
