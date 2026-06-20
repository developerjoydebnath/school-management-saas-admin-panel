import { useTableData } from "@/shared/hooks/use-table-data";
import { VoucherModel } from "../../models/voucher.model";

export function useVouchers(filters?: Record<string, any>) {
	const { data, meta, error, isLoading, isValidating } = useTableData(
		"/vouchers",
		filters
	);

	const vouchers = data?.map((item: any) => new VoucherModel(item)) || [];

	return {
		data: vouchers,
		meta,
		isLoading,
		error,
		isValidating,
	};
}
