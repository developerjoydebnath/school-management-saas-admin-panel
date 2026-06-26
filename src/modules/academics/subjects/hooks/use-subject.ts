import { useSWR } from "@/shared/hooks/use-swr";
import { Subject } from "@/shared/models/subject.model";

export function useSubject(id?: string) {
	const { data, isLoading, isError, mutate } = useSWR(id ? `/subjects/${id}` : null);

	return {
		data: data?.data ? new Subject(data.data) : null,
		isLoading,
		isError,
		mutate,
	};
}
