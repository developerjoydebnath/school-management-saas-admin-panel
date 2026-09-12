import axios from "@/shared/lib/axios";
import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import { mutate } from "swr";
import {
	EventParticipant,
	EventParticipantStatusEnum,
	EventParticipantTypeEnum,
} from "../dto/participant.dto";

export const refreshParticipantCaches = () =>
	mutate(
		(key: unknown) => typeof key === "string" && key.startsWith("/events/participants")
	);

/** Cross-event list — backs the standalone Participant Management page. */
export function useParticipants(query: Record<string, unknown>) {
	const { data, meta, isLoading, isError, mutate } = useTableData(
		"/events/participants",
		query
	);
	return {
		data: (data as EventParticipant[]) || [],
		meta,
		isLoading,
		isError,
		mutate,
	};
}

/** Roster for one event, plus the status tally shown in the detail header. */
export function useEventRoster(eventId?: string) {
	const { data, isLoading, isError, mutate } = useSWR(
		eventId ? `/events/participants/${eventId}/roster` : null
	);
	return {
		participants: (data?.data?.participants as EventParticipant[]) || [],
		tally: (data?.data?.tally as Record<string, number>) || {},
		total: (data?.data?.total as number) || 0,
		isLoading,
		isError,
		mutate,
	};
}

export const registerParticipants = async (
	eventId: string,
	participants: {
		participantType: EventParticipantTypeEnum;
		participantId: string;
		remarks?: string;
	}[]
) => {
	const response = await axios.post(`/events/participants/${eventId}/register`, {
		participants,
	});
	await refreshParticipantCaches();
	return response.data;
};

export const updateParticipantStatus = async (
	id: string,
	status: EventParticipantStatusEnum,
	remarks?: string
) => {
	const response = await axios.patch(`/events/participants/${id}/status`, {
		status,
		remarks,
	});
	await refreshParticipantCaches();
	return response.data;
};

export const removeParticipant = async (id: string) => {
	const response = await axios.delete(`/events/participants/${id}`);
	await refreshParticipantCaches();
	return response.data;
};
