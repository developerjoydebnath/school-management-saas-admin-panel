import axios from "@/shared/lib/axios";
import { toast } from "sonner";
import { mutate } from "swr";
import { SyllabusFormValues } from "../dto/syllabus.dto";

export const refreshSyllabusCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/syllabuses"));

export const createSyllabus = async (data: SyllabusFormValues) => {
	const response = await axios.post("/syllabuses", data);
	await refreshSyllabusCaches();
	return response.data;
};

export const updateSyllabus = async (id: string, data: Partial<SyllabusFormValues>) => {
	const response = await axios.patch(`/syllabuses/${id}`, data);
	await refreshSyllabusCaches();
	return response.data;
};

export const updateSyllabusStatus = async (id: string, status: string) => {
	const response = await axios.patch(`/syllabuses/${id}/status`, { status });
	await refreshSyllabusCaches();
	return response.data;
};

export const deleteSyllabus = async (id: string) => {
	const response = await axios.delete(`/syllabuses/${id}`);
	await refreshSyllabusCaches();
	return response.data;
};

export const toggleSyllabusTopic = async (
	id: string,
	topicId: string,
	payload: { isCompleted?: boolean; progressPercent?: number }
) => {
	const response = await axios.patch(`/syllabuses/${id}/topics/${topicId}`, payload);
	await refreshSyllabusCaches();
	return response.data;
};

export async function downloadSyllabusPdf(payload: {
	id: string;
	locale?: string;
	fileName?: string;
}) {
	const params = new URLSearchParams({ locale: payload.locale || "en" });

	const response = await fetch(`/api/proxy/syllabuses/${payload.id}/print?${params.toString()}`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Accept-Language": payload.locale || "en",
		},
	});

	if (!response.ok) {
		const text = await response.text();
		try {
			const parsed = JSON.parse(text);
			toast.error(parsed?.message || "Unable to download syllabus.");
		} catch {
			toast.error("Unable to download syllabus.");
		}
		return;
	}

	const blob = await response.blob();
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = payload.fileName || "syllabus.pdf";
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.URL.revokeObjectURL(url);
}
