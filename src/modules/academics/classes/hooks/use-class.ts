import { useSWR } from "@/shared/hooks/use-swr";
import { ClassModel } from "@/shared/models/class.model";
import { useSessionStore } from "@/shared/stores/session-store";

export function useClass(id?: string) {
	const selectedSessionId = useSessionStore((state) => state.selectedSessionId);
	const query = selectedSessionId ? `?sessionId=${selectedSessionId}` : "";
	const { data, isLoading, isError, mutate } = useSWR(id ? `/classes/${id}${query}` : null);

	return {
		data: data?.data ? new ClassModel(data.data) : null,
		isLoading,
		isError,
		mutate,
	};
}
