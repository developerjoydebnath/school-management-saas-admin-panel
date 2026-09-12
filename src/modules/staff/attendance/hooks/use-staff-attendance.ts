import { useSWR } from "@/shared/hooks/use-swr";
import {
	ApprovalItem,
	AttendanceOverview,
	AttendanceRoster,
	AttendanceSettings,
	EmployeeMonth,
	MonthlySummary,
	PunchCard,
	RosterEntry,
} from "../dto/staff-attendance.dto";

const BASE = "/staff/attendance";

export function useAttendanceOverview(params?: Record<string, unknown>) {
	const { data, isLoading, isError, mutate } = useSWR(`${BASE}/overview`, params);
	return { overview: data?.data as AttendanceOverview | undefined, isLoading, isError, mutate };
}

export function useAttendanceRoster(params?: Record<string, unknown>) {
	const { data, isLoading, isError, mutate } = useSWR(`${BASE}/roster`, params);
	return { roster: data?.data as AttendanceRoster | undefined, isLoading, isError, mutate };
}

export function useAttendanceEmployees(params?: Record<string, unknown>) {
	const { data, isLoading, isError } = useSWR(`${BASE}/employees`, params);
	return { employees: (data?.data || []) as RosterEntry[], isLoading, isError };
}

export function useAttendanceSettings() {
	const { data, isLoading, isError, mutate } = useSWR(`${BASE}/settings`);
	return { settings: data?.data as AttendanceSettings | undefined, isLoading, isError, mutate };
}

export function useAttendanceApprovals(params?: Record<string, unknown>) {
	const { data, isLoading, isError, mutate } = useSWR(`${BASE}/approvals`, params);
	return { approvals: (data?.data || []) as ApprovalItem[], isLoading, isError, mutate };
}

export function useMonthlySummary(params?: Record<string, unknown>) {
	const { data, isLoading, isError, mutate } = useSWR(`${BASE}/summary/monthly`, params);
	return { summary: data?.data as MonthlySummary | undefined, isLoading, isError, mutate };
}

export function useMyPunchCard() {
	const { data, isLoading, isError, mutate } = useSWR(`${BASE}/me/today`);
	return { card: data?.data as PunchCard | undefined, isLoading, isError, mutate };
}

export function useMyAttendanceHistory(params?: Record<string, unknown>) {
	const { data, isLoading, isError } = useSWR(`${BASE}/me/history`, params);
	return { history: (data?.data || []) as PunchCard["attendance"][], isLoading, isError };
}

export function useEmployeeMonth(
	employeeType?: string,
	employeeId?: string,
	params?: Record<string, unknown>
) {
	const { data, isLoading, isError, mutate } = useSWR(
		employeeType && employeeId
			? `${BASE}/employees/${employeeType}/${employeeId}/detail`
			: null,
		params
	);
	return { detail: data?.data as EmployeeMonth | undefined, isLoading, isError, mutate };
}
