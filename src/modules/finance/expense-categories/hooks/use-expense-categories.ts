import { useTableData } from "@/shared/hooks/use-table-data";

export function useExpenseCategories(params?: Record<string, any>) {
	const apiParams: Record<string, any> = { ...params };

	if (params?.recurrence) {
		apiParams.recurrence = Array.isArray(params.recurrence)
			? params.recurrence.join(",")
			: params.recurrence;
	}
	if (params?.source) {
		apiParams.source = Array.isArray(params.source) ? params.source.join(",") : params.source;
	}

	const { data, meta, isLoading, isError, mutate } = useTableData(
		"/finance/expense-categories",
		apiParams
	);

	return { categories: data, meta, isLoading, isError, mutate };
}
