import { useSWR } from "@/shared/hooks/use-swr";

export function useExam(id?: string) {
	const { data, isLoading, isError, mutate } = useSWR(id ? `/exams/${id}` : null);

	return {
		data: data?.data || null,
		isLoading,
		isError,
		mutate,
	};
}
