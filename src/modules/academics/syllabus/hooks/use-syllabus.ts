import { useSWR } from "@/shared/hooks/use-swr";

export function useSyllabus(id?: string) {
	const { data, isLoading, isError, mutate } = useSWR(id ? `/syllabuses/${id}` : null);

	return {
		data: data?.data || null,
		isLoading,
		isError,
		mutate,
	};
}

export function useSyllabusHistory(id?: string, params?: any) {
	const { data, isLoading, isError, mutate } = useSWR(
		id ? `/syllabuses/${id}/history` : null,
		params
	);

	return {
		data: data?.data?.items || [],
		meta: data?.data?.meta,
		isLoading,
		isError,
		mutate,
	};
}
