import { useSWR } from "@/shared/hooks/use-swr";
import { ExpenseCategoryOption } from "../models/expense-category.model";

/**
 * Categories a person may actually pick when typing an expense.
 *
 * The endpoint already excludes INVENTORY and PAYROLL sources — those rows are
 * written by their own subsystem, so offering them here would let someone
 * double-count a purchase that Inventory has already booked.
 */
export function useActiveExpenseCategories() {
	const { data, isLoading, isError } = useSWR("/finance/expense-categories/active-list");

	const categories: ExpenseCategoryOption[] = Array.isArray(data?.data) ? data.data : [];

	return { categories, isLoading, isError };
}
