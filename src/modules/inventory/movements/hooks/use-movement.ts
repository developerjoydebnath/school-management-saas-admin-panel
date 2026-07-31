import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";

export function useMovements(params?: Record<string, unknown> | null) {
	return useTableData(params ? "/inventory/movements" : null, params || undefined);
}

export function useMovement(id?: string | null) {
	return useSWR(id ? `/inventory/movements/${id}` : null);
}
