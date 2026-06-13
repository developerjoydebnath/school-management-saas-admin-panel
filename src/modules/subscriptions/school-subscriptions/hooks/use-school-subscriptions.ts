import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import { SchoolSubscription } from "../models/SchoolSubscription";

export function useSchoolSubscriptions(params?: Record<string, any>) {
    const { data, meta, isLoading, isError, mutate } = useTableData("/school-subscriptions", params);

    const subscriptions = data ? data.map((item: any) => new SchoolSubscription(item)) : [];

    return {
        data: subscriptions,
        meta,
        isLoading,
        isError,
        mutate,
    };
}

export function useSchoolSubscription(id: string | null) {
    const url = id ? `/school-subscriptions/${id}` : null;
    const { data, isLoading, isError, mutate } = useSWR(url);

    const subscription = data ? new SchoolSubscription(data) : null;

    return {
        data: subscription,
        isLoading,
        isError,
        mutate,
    };
}
