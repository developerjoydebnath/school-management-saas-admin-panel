import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import { IncidentDetails, IncidentListItem } from "../dto/incident.dto";

export type UseIncidentsParams = {
	page?: number;
	limit?: number;
	search?: string;
	type?: string | string[];
	category?: string | string[];
	actionTaken?: string | string[];
	status?: string | string[];
	sessionId?: string;
	classId?: string;
	sectionId?: string;
	dateFrom?: string;
	dateTo?: string;
};

const joinIfArray = (value?: string | string[]) =>
	Array.isArray(value) ? value.join(",") : value;

export function useIncidents(params?: UseIncidentsParams) {
	const apiParams = {
		...params,
		type: joinIfArray(params?.type),
		category: joinIfArray(params?.category),
		actionTaken: joinIfArray(params?.actionTaken),
		status: joinIfArray(params?.status),
	};

	const { data, meta, isLoading, isError, mutate } = useTableData(
		"/behavior-incidents",
		apiParams
	);

	return {
		data: (data || []) as IncidentListItem[],
		meta,
		isLoading,
		isError,
		mutate,
	};
}

export function useIncident(id: string | null) {
	const { data, error, isLoading, mutate } = useSWR(id ? `/behavior-incidents/${id}` : null);

	return {
		data: data?.data as IncidentDetails | undefined,
		isLoading,
		error,
		mutate,
	};
}

export type IncidentSummary = {
	totalIncidents: number;
	pendingGuardianMeetings: number;
	recentAppreciations: number;
	trend: { date: string; label: string; count: number }[];
	byCategory: { category: string; label: string; count: number }[];
};

export function useIncidentSummary(params?: { sessionId?: string }) {
	const { data, isLoading, mutate } = useSWR("/behavior-incidents/summary", params);

	return {
		data: data?.data as IncidentSummary | undefined,
		isLoading,
		mutate,
	};
}
