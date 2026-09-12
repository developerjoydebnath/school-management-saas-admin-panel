import { useSWR } from "@/shared/hooks/use-swr";
import { StaffModel } from "../models/staff.model";

export function useStaff(id?: string) {
	const { data, isLoading, isError, mutate } = useSWR(id ? `/staff/directory/${id}` : null);

	return {
		staff: data?.data as StaffModel,
		isLoading,
		isError,
		mutate,
	};
}
