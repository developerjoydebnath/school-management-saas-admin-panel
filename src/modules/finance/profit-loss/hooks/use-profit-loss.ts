import { useSWR } from "@/shared/hooks/use-swr";
import { ProfitLossStatement } from "../models/profit-loss.model";

/**
 * The whole statement comes from one call. The cards, chart, breakdowns and
 * month table are different views of the same numbers, so fetching them apart
 * would let them disagree while one request is still in flight.
 */
export function useProfitLoss(params: { from?: string; to?: string; sessionId?: string }) {
	const { data, isLoading, isValidating, isError } = useSWR("/finance/profit-loss", {
		from: params.from || undefined,
		to: params.to || undefined,
		sessionId: params.sessionId || undefined,
	});

	return {
		statement: data?.data as ProfitLossStatement | undefined,
		isLoading: isLoading || isValidating || data === undefined,
		isError,
	};
}
