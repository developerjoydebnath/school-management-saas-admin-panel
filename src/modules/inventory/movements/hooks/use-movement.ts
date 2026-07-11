import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";

export function useMovements(params?: Record<string, unknown>) {
	return useTableData("/inventory/movements", params);
}

export function useMovement(id?: string | null) {
	return useSWR(id ? `/inventory/movements/${id}` : null);
}
