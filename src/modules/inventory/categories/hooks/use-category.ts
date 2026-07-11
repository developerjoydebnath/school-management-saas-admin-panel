import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";

export function useCategories(params?: Record<string, unknown>) {
	return useTableData("/inventory/categories", params);
}

export function useCategory(id?: string | null) {
	return useSWR(id ? `/inventory/categories/${id}` : null);
}

export function useCategoryOptions() {
	return useSWR("/inventory/categories/options");
}
