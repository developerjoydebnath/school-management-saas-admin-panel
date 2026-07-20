import { useTableData } from "@/shared/hooks/use-table-data";

type UseSectionsParams = {
	page?: number;
	limit?: number;
	search?: string;
	status?: string | string[];
};

export function useSections(params?: UseSectionsParams) {
	const apiParams = {
		...params,
		status: Array.isArray(params?.status) ? params.status.join(",") : params?.status,
	};

	const { data, meta, isLoading, isError, mutate } = useTableData("/sections", apiParams);

	return {
		data: data || [],
		meta,
		isLoading,
		isError,
		mutate,
	};
}
