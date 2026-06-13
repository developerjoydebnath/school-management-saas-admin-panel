import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { SchoolBankAccount } from "../models/SchoolBankAccount";

const BASE_URL = "/school-bank-accounts";

export async function createSchoolBankAccount(payload: any): Promise<SchoolBankAccount> {
    const response = await axios.post(BASE_URL, payload);
    mutate(BASE_URL);
    return new SchoolBankAccount(response.data);
}

export async function updateSchoolBankAccount(id: string, payload: any): Promise<SchoolBankAccount> {
    const response = await axios.patch(`${BASE_URL}/${id}`, payload);
    mutate(BASE_URL);
    mutate(`${BASE_URL}/${id}`);
    return new SchoolBankAccount(response.data);
}

export async function deleteSchoolBankAccount(id: string): Promise<void> {
    await axios.delete(`${BASE_URL}/${id}`);
    mutate(BASE_URL);
    mutate(`${BASE_URL}/${id}`);
}

export async function updateSchoolBankAccountIsActive(id: string, isActive: boolean): Promise<SchoolBankAccount> {
    const response = await axios.patch(`${BASE_URL}/${id}/is-active`, { isActive });
    mutate(BASE_URL);
    mutate(`${BASE_URL}/${id}`);
    return new SchoolBankAccount(response.data);
}

export async function updateSchoolBankAccountIsPrimary(id: string, isPrimary: boolean): Promise<SchoolBankAccount> {
    const response = await axios.patch(`${BASE_URL}/${id}/is-primary`, { isPrimary });
    mutate(BASE_URL);
    mutate(`${BASE_URL}/${id}`);
    return new SchoolBankAccount(response.data);
}
