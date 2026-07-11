import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";

export function useLocations(params?: Record<string, unknown>) {
	return useTableData("/inventory/locations", params);
}

export function useLocation(id?: string | null) {
	return useSWR(id ? `/inventory/locations/${id}` : null);
}
