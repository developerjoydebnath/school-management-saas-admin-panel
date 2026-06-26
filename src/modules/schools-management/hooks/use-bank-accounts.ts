import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import { BankAccountModel } from "../models/bank-account.model";

type UseBankAccountsParams = {
	page?: number;
	limit?: number;
	search?: string;
	accountPurpose?: string | string[];
	isActive?: string;
	isPrimary?: string;
	schoolId?: string;
	createdFrom?: string;
	createdTo?: string;
};

export function useBankAccounts(params?: UseBankAccountsParams) {
	const apiParams = {
		...params,
		accountPurpose: Array.isArray(params?.accountPurpose)
			? params.accountPurpose.join(",")
			: params?.accountPurpose,
	};

	const { data, meta, isLoading, isError, mutate } = useTableData(
		"/superadmin/school-bank-accounts",
		apiParams
	);

	const accounts = data?.map((item: any) => new BankAccountModel(item)) || [];

	return {
		data: accounts,
		meta,
		isLoading,
		isError,
		mutate,
	};
}

export function useBankAccount(id: string | null) {
	const { data, error, isLoading, mutate } = useSWR(
		id ? `/superadmin/school-bank-accounts/${id}` : null
	);

	return {
		data: data?.data ? new BankAccountModel(data.data) : undefined,
		isLoading,
		error,
		mutate,
	};
}
