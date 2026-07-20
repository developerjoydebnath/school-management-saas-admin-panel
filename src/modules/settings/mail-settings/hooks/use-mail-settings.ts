"use client";

import { useSWR } from "@/shared/hooks/use-swr";
import axios from "@/shared/lib/axios";
import type { MailConfigPayload } from "../dto/mail-setting.dto";

export function useSchoolMailSettings() {
	const swr = useSWR("/settings/school-mail");
	return {
		...swr,
		config: swr.data?.data || null,
	};
}

export function usePlatformMailSettings(enabled = true) {
	const swr = useSWR(enabled ? "/settings/software-mail" : null);
	return {
		...swr,
		config: swr.data?.data || null,
	};
}

export async function updateSchoolMailSettings(payload: MailConfigPayload) {
	const response = await axios.patch("/settings/school-mail", payload);
	return response.data;
}

export async function updateSchoolMailStatus(isActive: boolean) {
	const response = await axios.patch("/settings/school-mail/status", { isActive });
	return response.data;
}

export async function testSchoolMailSettings(to: string) {
	const response = await axios.post("/settings/school-mail/test", { to });
	return response.data;
}

export async function updatePlatformMailSettings(payload: MailConfigPayload) {
	const response = await axios.patch("/settings/software-mail", payload);
	return response.data;
}

export async function testPlatformMailSettings(to: string) {
	const response = await axios.post("/settings/software-mail/test", { to });
	return response.data;
}
