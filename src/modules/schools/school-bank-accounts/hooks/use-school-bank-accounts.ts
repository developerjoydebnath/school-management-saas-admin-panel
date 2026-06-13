import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import { SchoolBankAccount } from "../models/SchoolBankAccount";

export function useSchoolBankAccounts(params?: Record<string, any>) {
    const { data, meta, isLoading, isError, mutate } = useTableData("/school-bank-accounts", params);

    const accounts = data ? data.map((item: any) => new SchoolBankAccount(item)) : [];

    return {
        data: accounts,
        meta,
        isLoading,
        isError,
        mutate,
    };
}

export function useSchoolBankAccount(id: string | null) {
    const url = id ? `/school-bank-accounts/${id}` : null;
    const { data, isLoading, isError, mutate } = useSWR(url);

    const account = data ? new SchoolBankAccount(data) : null;

    return {
        data: account,
        isLoading,
        isError,
        mutate,
    };
}
