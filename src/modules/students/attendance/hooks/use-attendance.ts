import { useSWR } from "@/shared/hooks/use-swr";
import {
	AttendanceCalendarDay,
	AttendanceDayTotal,
	AttendanceOverview,
	AttendanceRoster,
	AttendanceTrendPoint,
} from "../dto/attendance.dto";

export function useAttendanceOverview(date?: string) {
	const { data, isLoading, isError, mutate } = useSWR(
		"/students/attendance/overview",
		date ? { date } : undefined
	);
	return { data: (data?.data as AttendanceOverview) || null, isLoading, isError, mutate };
}

export function useAttendanceWeeklySummary(days = 7) {
	const { data, isLoading, isError } = useSWR("/students/attendance/weekly-summary", { days });
	return { data: (data?.data as AttendanceDayTotal[]) || [], isLoading, isError };
}

export function useAttendanceRoster(
	classId?: string,
	params?: { date?: string; sectionId?: string }
) {
	const { data, isLoading, isError, mutate } = useSWR(
		classId ? `/students/attendance/${classId}/roster` : null,
		params
	);
	return { data: (data?.data as AttendanceRoster) || null, isLoading, isError, mutate };
}

export function useAttendanceTrend(
	classId?: string,
	params?: { days?: number; sectionId?: string }
) {
	const { data, isLoading } = useSWR(
		classId ? `/students/attendance/${classId}/trend` : null,
		params
	);
	return { data: (data?.data as AttendanceTrendPoint[]) || [], isLoading };
}

export function useAttendanceCalendar(
	classId?: string,
	params?: { month?: string; sectionId?: string }
) {
	const { data, isLoading } = useSWR(
		classId ? `/students/attendance/${classId}/calendar` : null,
		params
	);
	const payload = data?.data as { month: string; days: AttendanceCalendarDay[] } | undefined;
	return { days: payload?.days || [], isLoading };
}
