import { useTableData } from "@/shared/hooks/use-table-data";
import { SubscriptionPlanModel } from "../models/subscription-plan.model";

type UseSubscriptionPlansParams = {
	page?: number;
	limit?: number;
	search?: string;
	isActive?: string[];
	isPublic?: string[];
	billingCycle?: string[];
};

export function useSubscriptionPlans(params?: UseSubscriptionPlansParams) {
	// Flatten multi-select arrays to single values for backend (backend supports single values)
	// We pass the last selected value if multiple are selected (or undefined if none)
	const apiParams: Record<string, any> = {
		page: params?.page,
		limit: params?.limit,
		search: params?.search || undefined,
	};

	// Map isActive filter — if exactly one value selected, send it; otherwise omit (backend filters by specific true/false)
	if (params?.isActive && params.isActive.length === 1) {
		apiParams.isActive = params.isActive[0];
	}
	if (params?.isPublic && params.isPublic.length === 1) {
		apiParams.isPublic = params.isPublic[0];
	}
	// billingCycle can be multi-value (future backend support) — for now send first selected
	if (params?.billingCycle && params.billingCycle.length > 0) {
		apiParams.billingCycle = params.billingCycle[0];
	}

	const { data, meta, isLoading, isError, mutate } = useTableData(
		"/superadmin/subscription-plans",
		apiParams,
	);

	const plans = data?.map((item: any) => new SubscriptionPlanModel(item)) || [];

	return {
		data: plans,
		meta,
		isLoading,
		isError,
		mutate,
	};
}
