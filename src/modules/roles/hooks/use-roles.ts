import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import { RoleModel } from "@/shared/models/role.model";

export function useRoles(params?: Record<string, any>) {
	const { data: rawData, meta, isLoading, isError, mutate } = useTableData("/roles", params);

	// useTableData usually returns an array or rawData, but since we had a custom response:
	const items = Array.isArray(rawData) ? rawData : [];
	const roles = items.map((item: any) => new RoleModel(item));

	return {
		data: roles,
		meta,
		isLoading,
		isError,
		mutate,
	};
}

export function useRole(id: string | null) {
	const url = id ? `/roles/${id}` : null;
	const { data, isLoading, isError, mutate } = useSWR(url);

	const role = data?.data ? new RoleModel(data.data) : null;

	return {
		data: role,
		isLoading,
		isError,
		mutate,
	};
}
