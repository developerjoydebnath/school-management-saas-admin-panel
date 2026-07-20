import axios from "@/shared/lib/axios";
import useSWR from "swr";

const fetcher = (url: string) => axios.get(url).then((response) => response.data?.data || response.data);

export function useSection(id?: string) {
	const { data, error, isLoading, mutate } = useSWR(id ? `/sections/${id}` : null, fetcher);
	return { data, isLoading, isError: error, mutate };
}
