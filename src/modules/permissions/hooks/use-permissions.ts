import { useTableData } from "@/shared/hooks/use-table-data";
import { useSWR } from "@/shared/hooks/use-swr";
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

export function usePermission(id: number | string | null) {
	const url = id ? `/permissions/${id}` : null;
	const { data, isLoading, isError, mutate } = useSWR(url);

	const permission = data?.data ? new PermissionModel(data.data) : null;

	return {
		data: permission,
		isLoading,
		isError,
		mutate,
	};
}
