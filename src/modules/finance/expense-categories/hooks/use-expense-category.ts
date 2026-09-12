import { useSWR } from "@/shared/hooks/use-swr";
import { ExpenseCategoryModel } from "../models/expense-category.model";

export function useExpenseCategory(id?: string) {
	const { data, isLoading, isError, mutate } = useSWR(
		id ? `/finance/expense-categories/${id}` : null
	);

	return {
		category: data?.data as ExpenseCategoryModel | undefined,
		isLoading,
		isError,
		mutate,
	};
}
