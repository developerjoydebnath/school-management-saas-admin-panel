import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";

export function useStockBatches(params?: Record<string, unknown>) {
	return useTableData("/inventory/stock-batches", params);
}

export function useStockBatch(id?: string | null) {
	return useSWR(id ? `/inventory/stock-batches/${id}` : null);
}
