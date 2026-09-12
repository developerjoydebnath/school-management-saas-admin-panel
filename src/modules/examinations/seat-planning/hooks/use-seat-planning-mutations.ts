import axios from "@/shared/lib/axios";
import { toast } from "sonner";
import { mutate } from "swr";
import { SeatTokenTemplate } from "../dto/seat-planning.dto";

export const refreshSeatPlanningCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/exam-seat-planning"));

export async function createSeatAssignment(
	examId: string,
	classRoomId: string,
	data: { studentId: string; classId: string; benchItemId: string; seatIndex: number }
) {
	const response = await axios.post(
		`/exam-seat-planning/exams/${examId}/rooms/${classRoomId}/assignments`,
		data
	);
	await refreshSeatPlanningCaches();
	return response.data;
}

export async function deleteSeatAssignment(examId: string, assignmentId: string) {
	const response = await axios.delete(
		`/exam-seat-planning/exams/${examId}/assignments/${assignmentId}`
	);
	await refreshSeatPlanningCaches();
	return response.data;
}

export async function downloadSeatPlanPdf(payload: {
	examId: string;
	classRoomId?: string;
	locale?: string;
	fileName?: string;
}) {
	const params = new URLSearchParams({ locale: payload.locale || "en" });
	const path = payload.classRoomId
		? `/exam-seat-planning/exams/${payload.examId}/rooms/${payload.classRoomId}/print`
		: `/exam-seat-planning/exams/${payload.examId}/print`;

	const response = await fetch(`/api/proxy${path}?${params.toString()}`, {
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
			toast.error(parsed?.message || "Unable to download seat plan.");
		} catch {
			toast.error("Unable to download seat plan.");
		}
		return;
	}

	const blob = await response.blob();
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = payload.fileName || "seat-plan.pdf";
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.URL.revokeObjectURL(url);
}

export async function fetchSeatTokensPdfBlob(payload: {
	examId: string;
	classRoomId?: string;
	template: SeatTokenTemplate;
	locale?: string;
}): Promise<Blob> {
	const params = new URLSearchParams({
		locale: payload.locale || "en",
		template: payload.template,
	});
	if (payload.classRoomId) params.set("classRoomId", payload.classRoomId);

	const response = await fetch(
		`/api/proxy/exam-seat-planning/exams/${payload.examId}/tokens/print?${params.toString()}`,
		{
			method: "GET",
			credentials: "include",
			headers: {
				"Accept-Language": payload.locale || "en",
			},
		}
	);

	if (!response.ok) {
		const text = await response.text();
		try {
			const parsed = JSON.parse(text);
			toast.error(parsed?.message || "Unable to generate seat tokens.");
		} catch {
			toast.error("Unable to generate seat tokens.");
		}
		throw new Error("Unable to generate seat tokens.");
	}

	return response.blob();
}

export function downloadBlob(blob: Blob, fileName: string) {
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = fileName;
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.URL.revokeObjectURL(url);
}
