import { useTableData } from "@/shared/hooks/use-table-data";
import { ShiftModel } from "@/shared/models/shift.model";

type UseShiftsParams = {
	page?: number;
	limit?: number;
	search?: string;
};

export function useShifts(params?: UseShiftsParams) {
	const { data, meta, isLoading, isError, mutate } = useTableData("/shifts", params);

	const shifts = data?.map((item: any) => new ShiftModel(item)) || [];

	return {
		data: shifts,
		meta,
		isLoading,
		isError,
		mutate,
	};
}
