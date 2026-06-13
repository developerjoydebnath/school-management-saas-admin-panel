import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import { SubscriptionPlan } from "../models/SubscriptionPlan";

export function useSubscriptionPlans(params?: Record<string, any>) {
    const { data, meta, isLoading, isError, mutate } = useTableData("/subscription-plan", params);

    const plans = data ? data.map((item: any) => new SubscriptionPlan(item)) : [];

    return {
        data: plans,
        meta,
        isLoading,
        isError,
        mutate,
    };
}

export function useSubscriptionPlan(id: string | null) {
    const url = id ? `/subscription-plan/${id}` : null;
    const { data, isLoading, isError, mutate } = useSWR(url);

    const plan = data ? new SubscriptionPlan(data) : null;

    return {
        data: plan,
        isLoading,
        isError,
        mutate,
    };
}
