import axios from "@/shared/lib/axios";
import useSWR from "swr";
import { VoucherModel } from "../../models/voucher.model";

const fetcher = async (url: string) => {
	const response = await axios.get(url);
	return new VoucherModel(response.data.data);
};

export function useVoucher(id: string | null) {
	const { data, error, isLoading, mutate } = useSWR<VoucherModel>(
		id ? `/superadmin/vouchers/${id}` : null,
		fetcher
	);

	return {
		data,
		isLoading,
		error,
		mutate,
	};
}
