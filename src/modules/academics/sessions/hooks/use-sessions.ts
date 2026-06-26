import { useTableData } from "@/shared/hooks/use-table-data";
import { SessionModel } from "@/shared/models/session.model";

type UseSessionsParams = {
	page?: number;
	limit?: number;
	search?: string;
};

export function useSessions(params?: UseSessionsParams) {
	const { data, meta, isLoading, isError, mutate } = useTableData("/sessions", params);

	const sessions = data?.map((item: any) => new SessionModel(item)) || [];

	return {
		data: sessions,
		meta,
		isLoading,
		isError,
		mutate,
	};
}
