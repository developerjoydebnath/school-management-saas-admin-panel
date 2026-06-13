import axios from "@/shared/lib/axios";
import { buildQueryParams } from "@/shared/utils/buildQueryParams";
import useSWRInstance, { SWRConfiguration } from "swr";

// Fetcher function for SWR GET requests
const fetcher = (url: string) => axios.get(url);

// Custom SWR hook for handling URL params and data fetching
export const useSWR = (
	url: string | null,
	query?: Record<string, any>,
	options?: SWRConfiguration
) => {
	const sp = buildQueryParams(query || {});

	const { data, error, ...response } = useSWRInstance(
		url ? `${url}${sp?.toString() ? `?${sp.toString()}` : ""}` : null,
		fetcher,
		{ shouldRetryOnError: false, revalidateOnFocus: false, ...options }
	);

	return {
		data: data?.data,
		isError: error,
		error,
		...response,
	};
};
