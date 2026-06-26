import { useTableData } from "@/shared/hooks/use-table-data";
import { useSWR } from "@/shared/hooks/use-swr";
import { SchoolSubscriptionModel } from "../models/school-subscription.model";

type UseSchoolSubscriptionsParams = {
	page?: number;
	limit?: number;
	search?: string;
	status?: string | string[];
	schoolId?: string;
	planId?: string;
	createdFrom?: string;
	createdTo?: string;
};

export function useSchoolSubscriptions(params?: UseSchoolSubscriptionsParams) {
	const apiParams = {
		...params,
		status: Array.isArray(params?.status) ? params.status.join(",") : params?.status,
	};

	const { data, meta, isLoading, isError, mutate } = useTableData(
		"/superadmin/school-subscriptions",
		apiParams
	);

	const subscriptions = data?.map((item: any) => new SchoolSubscriptionModel(item)) || [];

	return {
		data: subscriptions,
		meta,
		isLoading,
		isError,
		mutate,
	};
}

export function useSchoolSubscription(id: string | null) {
	const { data, error, isLoading, mutate } = useSWR(
		id ? `/superadmin/school-subscriptions/${id}` : null
	);

	return {
		data: data?.data ? new SchoolSubscriptionModel(data.data) : undefined,
		isLoading,
		error,
		mutate,
	};
}
