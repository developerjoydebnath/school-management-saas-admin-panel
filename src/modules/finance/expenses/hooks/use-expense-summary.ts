import { useSWR } from "@/shared/hooks/use-swr";
import { ExpenseSummary } from "../models/expense.model";

/** `month` is YYYY-MM; the API falls back to the current month when omitted. */
export function useExpenseSummary(month?: string) {
	const { data, isLoading, isValidating, isError } = useSWR(
		"/finance/expenses/summary",
		month ? { month } : undefined
	);

	return {
		summary: data?.data as ExpenseSummary | undefined,
		isLoading: isLoading || isValidating || data === undefined,
		isError,
	};
}
