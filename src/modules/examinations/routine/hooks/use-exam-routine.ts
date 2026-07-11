import { useSWR } from "@/shared/hooks/use-swr";

export function useExamRoutine(examId?: string, classId?: string) {
	const { data, isLoading, isError, mutate } = useSWR(
		examId ? "/exam-routines/current" : null,
		{ examId, classId }
	);

	return {
		data: data?.data || null,
		isLoading,
		isError,
		mutate,
	};
}
