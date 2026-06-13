import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { Voucher } from "../models/Voucher";

const BASE_URL = "/vouchers";

export async function createVoucher(payload: any): Promise<Voucher> {
    const response = await axios.post(BASE_URL, payload);
    mutate(BASE_URL);
    return new Voucher(response.data);
}

export async function updateVoucher(id: string, payload: any): Promise<Voucher> {
    const response = await axios.patch(`${BASE_URL}/${id}`, payload);
    mutate(BASE_URL);
    mutate(`${BASE_URL}/${id}`);
    return new Voucher(response.data);
}

export async function deleteVoucher(id: string): Promise<void> {
    await axios.delete(`${BASE_URL}/${id}`);
    mutate(BASE_URL);
    mutate(`${BASE_URL}/${id}`);
}

export async function updateVoucherIsActive(id: string, isActive: boolean): Promise<Voucher> {
    const response = await axios.patch(`${BASE_URL}/${id}/is-active`, { isActive });
    mutate(BASE_URL);
    mutate(`${BASE_URL}/${id}`);
    return new Voucher(response.data);
}
