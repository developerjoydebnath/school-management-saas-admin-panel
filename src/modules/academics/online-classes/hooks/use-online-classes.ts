import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import { OnlineClass, OnlineClassRosterRow } from "../dto/online-class.dto";

export function useOnlineClasses(query: Record<string, unknown>) {
	const { data, meta, isLoading, isError, mutate } = useTableData("/online-classes", query);
	return { data: (data as OnlineClass[]) || [], meta, isLoading, isError, mutate };
}

export function useOnlineClass(id?: string) {
	const { data, isLoading, isError, mutate } = useSWR(id ? `/online-classes/${id}` : null);
	return { data: (data?.data as OnlineClass) || null, isLoading, isError, mutate };
}

export function useOnlineClassRoster(id?: string) {
	const { data, isLoading, isError, mutate } = useSWR(id ? `/online-classes/${id}/roster` : null);
	const payload = data?.data;
	return {
		roster: (payload?.roster as OnlineClassRosterRow[]) || [],
		editable: !!payload?.editable,
		isLoading,
		isError,
		mutate,
	};
}
