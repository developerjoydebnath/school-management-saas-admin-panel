import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";

export type InventoryResource =
	| "categories"
	| "items"
	| "locations"
	| "stock-batches"
	| "assets"
	| "movements"
	| "maintenance"
	| "audit-logs";

export function useInventoryList(resource: InventoryResource, params?: Record<string, unknown>) {
	return useTableData(`/inventory/${resource}`, params);
}

export function useInventoryDetails(
	resource: Exclude<InventoryResource, "audit-logs">,
	id?: string | null
) {
	return useSWR(id ? `/inventory/${resource}/${id}` : null);
}

export function useInventoryOverview() {
	return useSWR("/inventory/overview");
}
