import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { SchoolSubscriptionDiscount } from "../models/SchoolSubscriptionDiscount";

const BASE_URL = "/school-subscription-discounts";

export async function createSchoolSubscriptionDiscount(payload: any): Promise<SchoolSubscriptionDiscount> {
    const response = await axios.post(BASE_URL, payload);
    mutate(BASE_URL);
    return new SchoolSubscriptionDiscount(response.data);
}

export async function updateSchoolSubscriptionDiscount(id: string, payload: any): Promise<SchoolSubscriptionDiscount> {
    const response = await axios.patch(`${BASE_URL}/${id}`, payload);
    mutate(BASE_URL);
    mutate(`${BASE_URL}/${id}`);
    return new SchoolSubscriptionDiscount(response.data);
}

export async function deleteSchoolSubscriptionDiscount(id: string): Promise<void> {
    await axios.delete(`${BASE_URL}/${id}`);
    mutate(BASE_URL);
    mutate(`${BASE_URL}/${id}`);
}

export async function updateSchoolSubscriptionDiscountIsActive(id: string, isActive: boolean): Promise<SchoolSubscriptionDiscount> {
    const response = await axios.patch(`${BASE_URL}/${id}/is-active`, { isActive });
    mutate(BASE_URL);
    mutate(`${BASE_URL}/${id}`);
    return new SchoolSubscriptionDiscount(response.data);
}
