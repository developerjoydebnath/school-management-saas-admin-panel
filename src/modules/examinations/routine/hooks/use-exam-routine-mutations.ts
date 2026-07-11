import axios from "@/shared/lib/axios";
import { toast } from "sonner";
import { mutate } from "swr";
import { SaveExamRoutinePayload } from "../dto/exam-routine.dto";

export const refreshExamRoutineCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/exam-routines"));

export async function saveExamRoutine(payload: SaveExamRoutinePayload) {
	const response = await axios.post("/exam-routines/save", payload);
	await refreshExamRoutineCaches();
	return response.data;
}

export async function downloadExamRoutinePdf(payload: {
	examId: string;
	classId?: string;
	locale?: string;
	fileName?: string;
}) {
	const params = new URLSearchParams({
		examId: payload.examId,
		locale: payload.locale || "en",
	});

	if (payload.classId) params.set("classId", payload.classId);

	const response = await fetch(`/api/proxy/exam-routines/print?${params.toString()}`, {
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
			toast.error(parsed?.message || "Unable to download exam routine.");
		} catch {
			toast.error("Unable to download exam routine.");
		}
		return;
	}

	const blob = await response.blob();
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = payload.fileName || "exam-routine.pdf";
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.URL.revokeObjectURL(url);
}
