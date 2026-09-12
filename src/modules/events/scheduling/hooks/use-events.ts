import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import { SchoolEvent } from "../dto/event.dto";

export function useEvents(query: Record<string, unknown>) {
	const { data, meta, isLoading, isError, mutate } = useTableData("/events", query);
	return { data: (data as SchoolEvent[]) || [], meta, isLoading, isError, mutate };
}

export function useEvent(id?: string) {
	const { data, isLoading, isError, mutate } = useSWR(id ? `/events/${id}` : null);
	return { data: (data?.data as SchoolEvent) || null, isLoading, isError, mutate };
}
