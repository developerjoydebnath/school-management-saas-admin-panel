import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";

export function useAssets(params?: Record<string, unknown>) {
	return useTableData("/inventory/assets", params);
}

export function useAsset(id?: string | null) {
	return useSWR(id ? `/inventory/assets/${id}` : null);
}
