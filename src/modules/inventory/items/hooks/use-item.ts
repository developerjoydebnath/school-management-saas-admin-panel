import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";

export function useItems(params?: Record<string, unknown>) {
	return useTableData("/inventory/items", params);
}

export function useItem(id?: string | null) {
	return useSWR(id ? `/inventory/items/${id}` : null);
}
