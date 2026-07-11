import { useSWR } from "@/shared/hooks/use-swr";

export function useInventoryOverview() {
	return useSWR("/inventory/overview");
}
