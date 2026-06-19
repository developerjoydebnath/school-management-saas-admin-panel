import axios from "@/shared/lib/axios";
import { SubscriptionPlanFormValues } from "../dto/subscription-plan.dto";

export const createSubscriptionPlan = async (data: SubscriptionPlanFormValues) => {
	const response = await axios.post("/superadmin/subscription-plans", data);
	return response.data;
};

export const updateSubscriptionPlan = async (id: string, data: Partial<SubscriptionPlanFormValues>) => {
	const response = await axios.patch(`/superadmin/subscription-plans/${id}`, data);
	return response.data;
};

export const deleteSubscriptionPlan = async (id: string) => {
	const response = await axios.delete(`/superadmin/subscription-plans/${id}`);
	return response.data;
};
