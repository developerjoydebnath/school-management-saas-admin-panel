import { useSWR } from "@/shared/hooks/use-swr";
import axios from "@/shared/lib/axios";
import { mutate } from "swr";
import {
	AwardFormValues,
	CompetitionFormValues,
	EntryFormValues,
	EventAward,
	EventCompetition,
} from "../dto/competition.dto";

const refresh = () =>
	mutate(
		(key: unknown) =>
			typeof key === "string" &&
			(key.startsWith("/events/competitions") || key.startsWith("/events/awards"))
	);

export function useCompetitions(eventId?: string) {
	const { data, isLoading, isError, mutate } = useSWR(
		eventId ? "/events/competitions" : null,
		{ eventId }
	);
	return {
		data: (data?.data as EventCompetition[]) || [],
		isLoading,
		isError,
		mutate,
	};
}

export function useCompetition(id?: string) {
	const { data, isLoading, isError, mutate } = useSWR(
		id ? `/events/competitions/${id}` : null
	);
	return { data: (data?.data as EventCompetition) || null, isLoading, isError, mutate };
}

export function useAwards(eventId?: string) {
	const { data, isLoading, isError, mutate } = useSWR(
		eventId ? "/events/awards" : null,
		{ eventId }
	);
	return { data: (data?.data as EventAward[]) || [], isLoading, isError, mutate };
}

export const createCompetition = async (values: CompetitionFormValues) => {
	const response = await axios.post("/events/competitions", values);
	await refresh();
	return response.data;
};

export const updateCompetition = async (id: string, values: CompetitionFormValues) => {
	const response = await axios.put(`/events/competitions/${id}`, values);
	await refresh();
	return response.data;
};

export const deleteCompetition = async (id: string) => {
	const response = await axios.delete(`/events/competitions/${id}`);
	await refresh();
	return response.data;
};

export const createEntry = async (competitionId: string, values: EntryFormValues) => {
	const response = await axios.post(`/events/competitions/entries/${competitionId}`, values);
	await refresh();
	return response.data;
};

export const updateEntry = async (id: string, values: EntryFormValues) => {
	const response = await axios.put(`/events/competitions/entries/${id}`, values);
	await refresh();
	return response.data;
};

export const deleteEntry = async (id: string) => {
	const response = await axios.delete(`/events/competitions/entries/${id}`);
	await refresh();
	return response.data;
};

export const createAward = async (values: AwardFormValues) => {
	const response = await axios.post("/events/awards", values);
	await refresh();
	return response.data;
};

export const updateAward = async (id: string, values: AwardFormValues) => {
	const response = await axios.put(`/events/awards/${id}`, values);
	await refresh();
	return response.data;
};

export const deleteAward = async (id: string) => {
	const response = await axios.delete(`/events/awards/${id}`);
	await refresh();
	return response.data;
};
