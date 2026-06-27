import { useTableData } from "@/shared/hooks/use-table-data";

export function useDepartments(params?: Record<string, any>) {
	const apiParams = {
		...params,
	};
	if (params?.search) {
		apiParams.search = params.search;
	}
	if (params?.isActive !== undefined) {
		apiParams.isActive = params.isActive;
	}

	const { data, meta, isLoading, isError, mutate } = useTableData("/departments", apiParams);

	return {
		departments: data,
		meta,
		isLoading,
		isError,
		mutate,
	};
}
