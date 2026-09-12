import { useSWR } from "@/shared/hooks/use-swr";
import { ExpenseModel } from "../models/expense.model";

export function useExpense(id?: string) {
	const { data, isLoading, isError, mutate } = useSWR(id ? `/finance/expenses/${id}` : null);

	return {
		expense: data?.data as ExpenseModel | undefined,
		isLoading,
		isError,
		mutate,
	};
}
