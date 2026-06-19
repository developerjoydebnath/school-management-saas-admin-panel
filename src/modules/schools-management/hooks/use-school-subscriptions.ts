import { useTableData } from "@/shared/hooks/use-table-data";
import { SchoolSubscriptionModel } from "../models/school-subscription.model";

type UseSchoolSubscriptionsParams = {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
};

export function useSchoolSubscriptions(params?: UseSchoolSubscriptionsParams) {
	const { data, meta, isLoading, isError, mutate } = useTableData("/superadmin/school-subscriptions", params);

	const subscriptions = data?.map((item: any) => new SchoolSubscriptionModel(item)) || [];

	return {
		data: subscriptions,
		meta,
		isLoading,
		isError,
		mutate,
	};
}
