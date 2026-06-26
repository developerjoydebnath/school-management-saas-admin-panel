import { useSWR } from "@/shared/hooks/use-swr";
import { ClassModel } from "@/shared/models/class.model";

export function useClass(id?: string) {
	const { data, isLoading, isError, mutate } = useSWR(id ? `/classes/${id}` : null);

	return {
		data: data?.data ? new ClassModel(data.data) : null,
		isLoading,
		isError,
		mutate,
	};
}
