import { useTableData } from "@/shared/hooks/use-table-data";
import { VoucherModel } from "../models/voucher.model";

type UseVouchersParams = {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
	discountType?: string;
};

export function useVouchers(params?: UseVouchersParams) {
	const { data, meta, isLoading, isError, mutate } = useTableData("/vouchers", params);

	const vouchers = data?.map((item: any) => new VoucherModel(item)) || [];

	return {
		data: vouchers,
		meta,
		isLoading,
		isError,
		mutate,
	};
}
