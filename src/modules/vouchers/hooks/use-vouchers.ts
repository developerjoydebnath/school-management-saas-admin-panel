import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import { Voucher } from "../models/Voucher";

export function useVouchers(params?: Record<string, any>) {
    const { data, meta, isLoading, isError, mutate } = useTableData("/vouchers", params);

    const vouchers = data ? data.map((item: any) => new Voucher(item)) : [];

    return {
        data: vouchers,
        meta,
        isLoading,
        isError,
        mutate,
    };
}

export function useVoucher(id: string | null) {
    const url = id ? `/vouchers/${id}` : null;
    const { data, isLoading, isError, mutate } = useSWR(url);

    const voucher = data ? new Voucher(data) : null;

    return {
        data: voucher,
        isLoading,
        isError,
        mutate,
    };
}
