import { useSWR } from "@/shared/hooks/use-swr";
import { Department } from "../dto/department.dto";

export function useDepartment(id?: string) {
	const { data, isLoading, isError, mutate } = useSWR(id ? `/departments/${id}` : null);

	return {
		department: data?.data as Department,
		isLoading,
		isError,
		mutate,
	};
}
