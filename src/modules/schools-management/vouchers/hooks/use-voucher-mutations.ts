import axios from "@/shared/lib/axios";
import { VoucherFormValues } from "../dto/voucher.dto";

export const createVoucher = async (data: VoucherFormValues) => {
	const response = await axios.post("/superadmin/vouchers", data);
	return response.data;
};

export const updateVoucher = async (id: string, data: Partial<VoucherFormValues>) => {
	const response = await axios.patch(`/superadmin/vouchers/${id}`, data);
	return response.data;
};

export const deleteVoucher = async (id: string) => {
	const response = await axios.delete(`/superadmin/vouchers/${id}`);
	return response.data;
};

export const updateVoucherStatus = async (id: string, isActive: boolean) => {
	const response = await axios.patch(`/superadmin/vouchers/${id}/is-active`, { isActive });
	return response.data;
};
