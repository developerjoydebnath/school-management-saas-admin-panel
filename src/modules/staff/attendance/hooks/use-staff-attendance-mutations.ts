import axios from "@/shared/lib/axios";
import { downloadPdf } from "@/shared/utils/downloadPdf";
import { mutate } from "swr";
import {
	AttendanceStatus,
	DutyReason,
	EmployeeType,
} from "../dto/staff-attendance.dto";

const BASE = "/staff/attendance";

/**
 * Scoped to /staff/attendance deliberately — a looser "attendance" match would
 * also blow away the student attendance dashboards' cache on every submit.
 */
export const refreshStaffAttendanceCaches = () =>
	mutate((key: unknown) => typeof key === "string" && key.startsWith(BASE));

export type SubmitRecord = {
	employeeType: EmployeeType;
	employeeId: string;
	status: AttendanceStatus;
	remarks?: string;
};

export const submitRegister = async (date: string, records: SubmitRecord[]) => {
	const response = await axios.post(`${BASE}/submit`, { date, records });
	await refreshStaffAttendanceCaches();
	return response.data;
};

export const markOnBehalf = async (payload: {
	employeeType: EmployeeType;
	employeeId: string;
	action: "in" | "out";
	at?: string;
	remarks?: string;
}) => {
	const response = await axios.post(`${BASE}/mark-on-behalf`, payload);
	await refreshStaffAttendanceCaches();
	return response.data;
};

export const updateAttendanceRecord = async (
	id: string,
	payload: { status?: AttendanceStatus; remarks?: string }
) => {
	const response = await axios.patch(`${BASE}/${id}`, payload);
	await refreshStaffAttendanceCaches();
	return response.data;
};

export const approveAttendance = async (id: string) => {
	const response = await axios.post(`${BASE}/${id}/approve`, {});
	await refreshStaffAttendanceCaches();
	return response.data;
};

export const rejectAttendance = async (id: string, rejectionReason: string) => {
	const response = await axios.post(`${BASE}/${id}/reject`, { rejectionReason });
	await refreshStaffAttendanceCaches();
	return response.data;
};

export const updateAttendanceSettings = async (payload: Record<string, unknown>) => {
	const response = await axios.patch(`${BASE}/settings`, payload);
	await refreshStaffAttendanceCaches();
	return response.data;
};

export const fetchSchoolLocation = async () => {
	const response = await axios.get(`${BASE}/settings/school-location`);
	return response.data?.data as
		| { schoolName: string; center: { lat: number; lng: number }; radiusMeters: number }
		| null;
};

export const upsertAttendanceProfile = async (
	employeeType: EmployeeType,
	employeeId: string,
	payload: Record<string, unknown>
) => {
	const response = await axios.put(
		`${BASE}/employees/${employeeType}/${employeeId}/profile`,
		payload
	);
	await refreshStaffAttendanceCaches();
	return response.data;
};

export type PunchPayload = {
	lat: number;
	lng: number;
	accuracyMeters: number;
	capturedAt?: string;
	dutyReason?: DutyReason;
	dutyNote?: string;
	deviceInfo?: Record<string, unknown>;
};

export const selfCheckIn = async (payload: PunchPayload) => {
	const response = await axios.post(`${BASE}/me/check-in`, payload);
	await refreshStaffAttendanceCaches();
	return response.data;
};

export const selfCheckOut = async (payload: PunchPayload) => {
	const response = await axios.post(`${BASE}/me/check-out`, payload);
	await refreshStaffAttendanceCaches();
	return response.data;
};

export const downloadDailyRegisterPdf = (date: string) =>
	downloadPdf(
		`${BASE}/overview/print?date=${encodeURIComponent(date)}`,
		`staff-attendance-${date}.pdf`
	);

export const downloadMonthlyStatementPdf = (month: string) =>
	downloadPdf(
		`${BASE}/summary/monthly/print?month=${encodeURIComponent(month)}`,
		`staff-attendance-${month}.pdf`
	);
