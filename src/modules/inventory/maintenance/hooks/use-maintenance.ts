import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";

export function useMaintenances(params?: Record<string, unknown>) {
	return useTableData("/inventory/maintenance", params);
}

export function useMaintenance(id?: string | null) {
	return useSWR(id ? `/inventory/maintenance/${id}` : null);
}
