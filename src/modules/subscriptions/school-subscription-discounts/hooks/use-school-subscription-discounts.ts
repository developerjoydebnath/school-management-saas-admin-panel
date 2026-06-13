import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import { SchoolSubscriptionDiscount } from "../models/SchoolSubscriptionDiscount";

export function useSchoolSubscriptionDiscounts(params?: Record<string, any>) {
    const { data, meta, isLoading, isError, mutate } = useTableData("/school-subscription-discounts", params);

    const discounts = data ? data.map((item: any) => new SchoolSubscriptionDiscount(item)) : [];

    return {
        data: discounts,
        meta,
        isLoading,
        isError,
        mutate,
    };
}

export function useSchoolSubscriptionDiscount(id: string | null) {
    const url = id ? `/school-subscription-discounts/${id}` : null;
    const { data, isLoading, isError, mutate } = useSWR(url);

    const discount = data ? new SchoolSubscriptionDiscount(data) : null;

    return {
        data: discount,
        isLoading,
        isError,
        mutate,
    };
}
