import axios from "@/shared/lib/axios";
import { toast } from "sonner";
import { mutate } from "swr";
import { DAYS, TimetableCells, TimetableColumn } from "../types";

export type SaveTimetablePayload = {
	sessionId: string;
	classId: string;
	sectionIds?: string[];
	days?: string[];
	columns: TimetableColumn[];
	cells: TimetableCells;
};

export async function saveTimetable(payload: SaveTimetablePayload) {
	const response = await axios.post("/timetables/save", {
		...payload,
		days: payload.days || DAYS,
	});
	await mutate((key: unknown) => typeof key === "string" && key.startsWith("/timetables"));
	return response.data;
}

export type DownloadTimetablePdfPayload = {
	sessionId: string;
	classId: string;
	sectionIds?: string[];
	locale?: string;
	fileName?: string;
};

export async function downloadTimetablePdf(payload: DownloadTimetablePdfPayload) {
	const params = new URLSearchParams({
		sessionId: payload.sessionId,
		classId: payload.classId,
		locale: payload.locale || "en",
	});

	if (payload.sectionIds?.length) {
		params.set("sectionIds", payload.sectionIds.join(","));
	}

	const response = await fetch(`/api/proxy/timetables/print?${params.toString()}`, {
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
			toast.error(parsed?.message || "Unable to download timetable.");
		} catch {
			toast.error("Unable to download timetable.");
		}
		return;
	}

	const blob = await response.blob();
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = payload.fileName || "class-timetable.pdf";
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.URL.revokeObjectURL(url);
}
