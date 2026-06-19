import { useTableData } from "@/shared/hooks/use-table-data";
import { PermissionModel } from "@/shared/models/permission.model";

export function usePermissions(params?: Record<string, any>) {
	const { data: rawData, meta, isLoading, isError, mutate } = useTableData("/permissions", params);

	const items = Array.isArray(rawData) ? rawData : [];
	const permissions = items.map((item: any) => new PermissionModel(item));

	return {
		data: permissions,
		meta,
		isLoading,
		error: isError,
		mutate,
	};
}
