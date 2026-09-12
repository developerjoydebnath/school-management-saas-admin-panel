import axios from "@/shared/lib/axios";
import { toast } from "sonner";
import { mutate } from "swr";
import { StudentAttendanceStatus } from "../dto/attendance.dto";

export const refreshAttendanceCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith("/students/attendance"));

export const submitAttendance = async (
	classId: string,
	data: {
		date: string;
		sectionId?: string;
		records: { studentId: string; status: StudentAttendanceStatus }[];
	}
) => {
	const response = await axios.post(`/students/attendance/${classId}/submit`, data);
	await refreshAttendanceCaches();
	return response.data;
};

export async function downloadAttendanceRegisterPdf(payload: { date: string; locale?: string }) {
	const params = new URLSearchParams({
		date: payload.date,
		locale: payload.locale || "en",
	});

	const response = await fetch(`/api/proxy/students/attendance/overview/print?${params.toString()}`, {
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
			toast.error(parsed?.message || "Unable to download attendance register.");
		} catch {
			toast.error("Unable to download attendance register.");
		}
		return;
	}

	const blob = await response.blob();
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `attendance-register-${payload.date}.pdf`;
	document.body.appendChild(link);
	link.click();
	link.remove();
	window.URL.revokeObjectURL(url);
}
