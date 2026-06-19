import { useTableData } from "@/shared/hooks/use-table-data";
import { VoucherModel } from "../../models/voucher.model";

export function useVouchers(filters?: Record<string, any>) {
	const params = new URLSearchParams();

	if (filters) {
		Object.entries(filters).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== "") {
				if (Array.isArray(value)) {
					if (value.length > 0) {
						params.append(key, value.join(","));
					}
				} else {
					params.append(key, String(value));
				}
			}
		});
	}

	const { data, meta, error, isLoading, isValidating } = useTableData<VoucherModel>(
		"/superadmin/vouchers",
		params,
		(item) => new VoucherModel(item)
	);

	return {
		data,
		meta,
		isLoading,
		error,
		isValidating,
	};
}
