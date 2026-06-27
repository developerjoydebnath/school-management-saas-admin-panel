import { useTableData } from "@/shared/hooks/use-table-data";

export function useDesignations(params?: Record<string, any>) {
	const apiParams = {
		...params,
	};
	if (params?.search) {
		apiParams.search = params.search;
	}
	if (params?.category) {
		apiParams.category = params.category;
	}
	if (params?.isActive) {
		apiParams.isActive = params.isActive;
	}

	const { data, meta, isLoading, isError, mutate } = useTableData("/designations", apiParams);

	return {
		designations: data,
		meta,
		isLoading,
		isError,
		mutate,
	};
}
