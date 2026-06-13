import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { SchoolSubscription } from "../models/SchoolSubscription";

const BASE_URL = "/school-subscriptions";

export async function createSchoolSubscription(payload: any): Promise<SchoolSubscription> {
    const response = await axios.post(BASE_URL, payload);
    mutate(BASE_URL);
    return new SchoolSubscription(response.data);
}

export async function updateSchoolSubscription(id: string, payload: any): Promise<SchoolSubscription> {
    const response = await axios.patch(`${BASE_URL}/${id}`, payload);
    mutate(BASE_URL);
    mutate(`${BASE_URL}/${id}`);
    return new SchoolSubscription(response.data);
}

export async function deleteSchoolSubscription(id: string): Promise<void> {
    await axios.delete(`${BASE_URL}/${id}`);
    mutate(BASE_URL);
    mutate(`${BASE_URL}/${id}`);
}

export async function updateSchoolSubscriptionStatus(id: string, status: string): Promise<SchoolSubscription> {
    const response = await axios.patch(`${BASE_URL}/${id}/status`, { status });
    mutate(BASE_URL);
    mutate(`${BASE_URL}/${id}`);
    return new SchoolSubscription(response.data);
}
