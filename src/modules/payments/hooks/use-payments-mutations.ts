import axios from "@/shared/lib/axios";

export const verifyVoucher = async (data: { schoolId: string; planId: string; voucherCode: string }) => {
	const response = await axios.post("/superadmin/payments/verify-voucher", data);
	return response.data;
};

export const purchasePlan = async (data: {
	schoolId: string;
	planId: string;
	voucherCode?: string;
	transactionId?: string;
	method: string;
}) => {
	const response = await axios.post("/superadmin/payments/purchase-plan", data);
	return response.data;
};
