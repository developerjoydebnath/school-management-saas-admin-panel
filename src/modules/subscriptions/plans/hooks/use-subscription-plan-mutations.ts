import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import { SubscriptionPlan } from "../models/SubscriptionPlan";

const BASE_URL = "/subscription-plan";

export async function createSubscriptionPlan(payload: any): Promise<SubscriptionPlan> {
    const response = await axios.post(BASE_URL, payload);
    mutate(BASE_URL);
    return new SubscriptionPlan(response.data);
}

export async function updateSubscriptionPlan(id: string, payload: any): Promise<SubscriptionPlan> {
    const response = await axios.patch(`${BASE_URL}/${id}`, payload);
    mutate(BASE_URL);
    mutate(`${BASE_URL}/${id}`);
    return new SubscriptionPlan(response.data);
}

export async function deleteSubscriptionPlan(id: string): Promise<void> {
    await axios.delete(`${BASE_URL}/${id}`);
    mutate(BASE_URL);
    mutate(`${BASE_URL}/${id}`);
}

export async function updateSubscriptionPlanIsPublic(id: string, isPublic: boolean): Promise<SubscriptionPlan> {
    const response = await axios.patch(`${BASE_URL}/${id}/is-public`, { isPublic });
    mutate(BASE_URL);
    mutate(`${BASE_URL}/${id}`);
    return new SubscriptionPlan(response.data);
}

export async function updateSubscriptionPlanIsActive(id: string, isActive: boolean): Promise<SubscriptionPlan> {
    const response = await axios.patch(`${BASE_URL}/${id}/is-active`, { isActive });
    mutate(BASE_URL);
    mutate(`${BASE_URL}/${id}`);
    return new SubscriptionPlan(response.data);
}
