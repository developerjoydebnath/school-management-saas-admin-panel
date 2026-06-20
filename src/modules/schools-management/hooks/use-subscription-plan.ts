import { useSWR } from "@/shared/hooks/use-swr";
import { SubscriptionPlanModel } from "../models/subscription-plan.model";

export function useSubscriptionPlan(id: string | null) {
	const { data, error, isLoading, mutate } = useSWR(
		id ? `/superadmin/subscription-plans/${id}` : null
	);

	return {
		data: data?.data ? new SubscriptionPlanModel(data.data) : undefined,
		isLoading,
		error,
		mutate,
	};
}
