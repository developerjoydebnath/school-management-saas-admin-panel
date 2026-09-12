import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import { Holiday } from "../dto/holiday.dto";

export function useHolidays(query: Record<string, unknown>) {
	const { data, meta, isLoading, isError, mutate } = useTableData("/holidays", query);
	return { data: (data as Holiday[]) || [], meta, isLoading, isError, mutate };
}

export function useHoliday(id?: string) {
	const { data, isLoading, isError, mutate } = useSWR(id ? `/holidays/${id}` : null);
	return { data: (data?.data as Holiday) || null, isLoading, isError, mutate };
}
