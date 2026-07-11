import { useTableData } from "@/shared/hooks/use-table-data";
import { useSWR } from "@/shared/hooks/use-swr";

export function useAuditLogsList(params?: Record<string, any>) {
	return useTableData("/inventory/audit-logs", params);
}

export function useAuditLog(id?: string | null) {
	return useSWR(id ? `/inventory/audit-logs/${id}` : null);
}
