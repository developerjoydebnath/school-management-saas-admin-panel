import { useTableData } from "@/shared/hooks/use-table-data";

export function useClassRoomAssignedInventory(id?: string | null) {
	return useTableData(id ? `/class-rooms/${id}/assigned-inventory` : null, {
		page: 1,
		limit: 100,
	});
}
