import axios from "@/shared/lib/axios";
import { mutate } from "swr";

export type SessionClassSetupPayload = {
	sessionId: string;
	classId: string;
	hasSections: boolean;
	classLevel?: {
		capacity?: number | null;
		shiftId?: string | null;
		roomId?: string | null;
		status?: string;
	};
	sections?: Array<{
		sectionId: string;
		capacity?: number | null;
		shiftId?: string | null;
		roomId?: string | null;
		status?: string;
	}>;
};

export async function saveSessionClassSetup(payload: SessionClassSetupPayload) {
	const response = await axios.put("/session-class-sections/setup", payload);
	await mutate((key: unknown) => typeof key === "string" && key.startsWith("/session-class-sections"));
	await mutate((key: unknown) => typeof key === "string" && key.startsWith("/classes/sections"));
	return response.data;
}
