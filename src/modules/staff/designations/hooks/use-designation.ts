import { useSWR } from "@/shared/hooks/use-swr";
import { Designation } from "../dto/designation.dto";

export function useDesignation(id?: string) {
	const { data, isLoading, isError, mutate } = useSWR(id ? `/designations/${id}` : null);

	return {
		designation: data?.data as Designation,
		isLoading,
		isError,
		mutate,
	};
}
