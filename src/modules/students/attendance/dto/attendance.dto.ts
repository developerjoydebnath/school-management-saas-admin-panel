export enum StudentAttendanceStatus {
	PENDING = "PENDING",
	PRESENT = "PRESENT",
	ABSENT = "ABSENT",
	LATE = "LATE",
}

export interface AttendanceSectionSummary {
	id: string;
	name: string;
	total: number;
	present: number;
	absent: number;
	late: number;
	isTaken: boolean;
}

export interface AttendanceClassSummary {
	id: string;
	name: { en: string; bn?: string | null };
	total: number;
	present: number;
	absent: number;
	late: number;
	isTaken: boolean;
	hasSections: boolean;
	sections: AttendanceSectionSummary[];
}

export interface AttendanceOverview {
	date: string;
	classes: AttendanceClassSummary[];
	totals: { totalStudents: number; present: number; absent: number; late: number };
}

export interface AttendanceDayTotal {
	date: string;
	present: number;
	absent: number;
	late: number;
}

export interface AttendanceRosterEntry {
	student: { id: string; fullName: string; studentId: string; roll: string | null };
	status: StudentAttendanceStatus;
	markedAt: string | null;
}

export interface AttendanceRoster {
	date: string;
	class: { id: string; name: { en: string; bn?: string | null } };
	section: { id: string; name: string } | null;
	roster: AttendanceRosterEntry[];
	isTaken: boolean;
	isToday: boolean;
	isHoliday: boolean;
	editable: boolean;
}

export interface AttendanceTrendPoint {
	date: string;
	rate: number | null;
}

export interface AttendanceCalendarDay {
	date: string;
	rate: number | null;
	isHoliday: boolean;
}
