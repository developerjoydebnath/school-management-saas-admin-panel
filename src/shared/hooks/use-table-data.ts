import { useSWR } from "@/shared/hooks/use-swr";
import { SWRConfiguration } from "swr";

type Meta = {
	page: number;
	limit: number;
	totalPages: number;
	total: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
};

export const useTableData = (
	url: string | null,
	query?: Record<string, any>,
	options?: SWRConfiguration
) => {
	const { data, ...rest } = useSWR(url, query, options);

	// Get meta info from the last page
	const meta: Meta = data?.data?.meta || {
		page: 1,
		limit: 10,
		total: 0,
		totalPages: 0,
		hasNextPage: false,
		hasPreviousPage: false,
	};

	return {
		data: Array.isArray(data) ? data : data?.data?.items || [],
		meta,
		...rest,
	};
};
