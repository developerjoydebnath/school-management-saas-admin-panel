import { useSWR } from "@/shared/hooks/use-swr";
import { VoucherModel } from "../../models/voucher.model";

export function useVoucher(id: string | null) {
	const { data, error, isLoading, mutate } = useSWR(id ? `/vouchers/${id}` : null);

	return {
		data: data?.data ? new VoucherModel(data.data) : undefined,
		isLoading,
		error,
		mutate,
	};
}
