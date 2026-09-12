import { useSWR } from "@/shared/hooks/use-swr";
import { ExpenseModel } from "../models/expense.model";

const joinList = (value: unknown) =>
	Array.isArray(value) ? (value.length ? value.join(",") : undefined) : value || undefined;

/**
 * The list endpoint returns the sum of everything the filters match, not just
 * this page — an accountant filtering to "electricity, this year" wants that
 * figure, so it is surfaced alongside the rows rather than recomputed here.
 */
export function useExpenses(params?: Record<string, any>) {
	const apiParams: Record<string, any> = {
		page: params?.page,
		limit: params?.limit,
		search: params?.search || undefined,
		categoryId: joinList(params?.categoryId),
		status: joinList(params?.status),
		source: joinList(params?.source),
		paymentMethod: joinList(params?.paymentMethod),
		dateFrom: params?.dateFrom || undefined,
		dateTo: params?.dateTo || undefined,
		month: params?.month || undefined,
	};

	const { data, isLoading, isError, mutate } = useSWR("/finance/expenses", apiParams);

	const payload = data?.data;

	return {
		expenses: (payload?.items || []) as ExpenseModel[],
		filteredTotal: Number(payload?.filteredTotal || 0),
		meta: payload?.meta || {
			page: 1,
			limit: 10,
			total: 0,
			totalPages: 0,
			hasNextPage: false,
			hasPreviousPage: false,
		},
		isLoading,
		isError,
		mutate,
	};
}
