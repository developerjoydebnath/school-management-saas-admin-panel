import { useSWR } from "@/shared/hooks/use-swr";
import {
	AvailableStudent,
	RoomCanvasData,
	RoomListRow,
	SeatPlanOverview,
	SeatPlanSummaryRow,
} from "../dto/seat-planning.dto";

export function useSeatPlanOverview(examId?: string) {
	const { data, isLoading, isError, mutate } = useSWR(
		examId ? `/exam-seat-planning/exams/${examId}` : null
	);
	return {
		data: (data?.data as SeatPlanOverview) || null,
		isLoading,
		isError,
		mutate,
	};
}

export function useRooms(examId?: string) {
	const { data, isLoading, isError, mutate } = useSWR(
		examId ? `/exam-seat-planning/exams/${examId}/rooms` : null
	);
	return {
		data: (data?.data as RoomListRow[]) || [],
		isLoading,
		isError,
		mutate,
	};
}

export function useRoomCanvas(examId?: string, classRoomId?: string) {
	const { data, isLoading, isError, mutate } = useSWR(
		examId && classRoomId ? `/exam-seat-planning/exams/${examId}/rooms/${classRoomId}` : null
	);
	return {
		data: (data?.data as RoomCanvasData) || null,
		isLoading,
		isError,
		mutate,
	};
}

export function useAvailableStudents(
	examId?: string,
	params?: { sessionId?: string; classId?: string; sectionId?: string; search?: string }
) {
	const { data, isLoading, isError, mutate } = useSWR(
		examId ? `/exam-seat-planning/exams/${examId}/available-students` : null,
		params
	);
	return {
		data: (data?.data as AvailableStudent[]) || [],
		isLoading,
		isError,
		mutate,
	};
}

export function useSeatPlanSummary(examId?: string) {
	const { data, isLoading, isError, mutate } = useSWR(
		examId ? `/exam-seat-planning/exams/${examId}/summary` : null
	);
	return {
		data: (data?.data as SeatPlanSummaryRow[]) || [],
		isLoading,
		isError,
		mutate,
	};
}
