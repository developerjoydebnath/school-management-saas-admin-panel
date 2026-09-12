import { Geofence } from "@/shared/utils/geo";

export type EmployeeType = "staff" | "teacher";

export type AttendanceStatus =
	| "PENDING"
	| "PRESENT"
	| "ABSENT"
	| "LATE"
	| "HALF_DAY"
	| "ON_LEAVE";

export type MarkingMode = "register" | "self_checkin" | "hybrid";

export type ApprovalStatus = "not_required" | "pending" | "approved" | "rejected";

export type DutyReason =
	| "exam_center_duty"
	| "training"
	| "education_office"
	| "field_trip"
	| "bus_duty"
	| "other";

/** Matches the backend's DUTY_REASON_LABELS so both sides read the same. */
export const DUTY_REASON_OPTIONS: { label: string; value: DutyReason }[] = [
	{ label: "Exam Centre Duty", value: "exam_center_duty" },
	{ label: "Training", value: "training" },
	{ label: "Education Office", value: "education_office" },
	{ label: "Field Trip", value: "field_trip" },
	{ label: "Bus Duty", value: "bus_duty" },
	{ label: "Other", value: "other" },
];

export const STATUS_OPTIONS: { label: string; value: AttendanceStatus }[] = [
	{ label: "Present", value: "PRESENT" },
	{ label: "Late", value: "LATE" },
	{ label: "Half Day", value: "HALF_DAY" },
	{ label: "On Leave", value: "ON_LEAVE" },
	{ label: "Absent", value: "ABSENT" },
];

export type AttendanceRecord = {
	id: string;
	shiftDate: string;
	status: AttendanceStatus;
	mode: "register" | "self_checkin";
	checkInAt: string | null;
	checkOutAt: string | null;
	checkInLat: number | null;
	checkInLng: number | null;
	checkInAccuracyM: number | null;
	checkInDistanceM: number | null;
	checkInInside: boolean | null;
	checkOutLat: number | null;
	checkOutLng: number | null;
	checkOutDistanceM: number | null;
	checkOutInside: boolean | null;
	workedMinutes: number | null;
	lateMinutes: number | null;
	earlyLeaveMinutes: number | null;
	dutyReason: DutyReason | null;
	dutyReasonLabel: string | null;
	dutyNote: string | null;
	approvalStatus: ApprovalStatus;
	approvedAt: string | null;
	rejectionReason: string | null;
	remarks: string | null;
	markedOnBehalf: boolean;
	markedAt: string | null;
};

export type RosterEntry = {
	employeeType: EmployeeType;
	employeeId: string;
	fullName: string;
	employeeCode: string;
	photoUrl: string | null;
	photoPlaceholder: string | null;
	designationId: string | null;
	designationName: string | null;
	designationLevel: number;
	status: AttendanceStatus;
	attendance: AttendanceRecord | null;
};

export type AttendanceRoster = {
	date: string;
	roster: RosterEntry[];
	counts: Record<string, number>;
	mode: MarkingMode;
	isToday: boolean;
	isHoliday: boolean;
	isWeeklyOff: boolean;
	editable: boolean;
};

export type AttendanceOverview = {
	date: string;
	mode: MarkingMode;
	isHoliday: boolean;
	isWeeklyOff: boolean;
	totals: {
		totalEmployees: number;
		present: number;
		absent: number;
		late: number;
		halfDay: number;
		onLeave: number;
		notMarked: number;
		pendingApprovals: number;
	};
	designations: {
		designation: string;
		total: number;
		present: number;
		absent: number;
		late: number;
		pending: number;
	}[];
};

export type AttendanceSettings = {
	markingMode: MarkingMode;
	timezone: string;
	workdayStart: string;
	workdayEnd: string;
	graceMinutes: number;
	halfDayMinutes: number;
	autoCheckoutAfterMinutes: number;
	allowBackdatedDays: number;
	geofenceEnabled: boolean;
	geofence: Geofence | null;
	accuracyBufferMeters: number;
	maxAccuracyMeters: number;
	allowOutsideGeofencePunch: boolean;
	requireReasonOutsideGeofence: boolean;
	selfCheckinRequiresApproval: boolean;
	notifyOnOutsidePunch: boolean;
	exemptDesignationIds: string[];
};

export type PunchCard = {
	employee: {
		employeeType: EmployeeType;
		employeeId: string;
		fullName: string;
		employeeCode: string;
		designationName: string | null;
		photoUrl: string | null;
		photoPlaceholder: string | null;
	};
	shiftDate: string;
	isHoliday: boolean;
	isWeeklyOff: boolean;
	policy: {
		markingMode: MarkingMode;
		workdayStart: string;
		workdayEnd: string;
		graceMinutes: number;
		timezone: string;
		geofenceEnabled: boolean;
		geofence: Geofence | null;
		geofenceExempt: boolean;
		accuracyBufferMeters: number;
		maxAccuracyMeters: number;
		allowOutsideGeofencePunch: boolean;
		requireReasonOutsideGeofence: boolean;
	};
	attendance: AttendanceRecord | null;
	canCheckIn: boolean;
	canCheckOut: boolean;
};

export type ApprovalItem = AttendanceRecord & {
	employee: {
		employeeType: EmployeeType;
		employeeId: string;
		fullName: string;
		employeeCode: string;
		photoUrl: string | null;
		designationName: string | null;
	} | null;
};

export type MonthlySummaryItem = {
	employeeType: EmployeeType;
	employeeId: string;
	fullName: string;
	employeeCode: string;
	designationName: string | null;
	present: number;
	absent: number;
	late: number;
	halfDay: number;
	onLeave: number;
	workedHours: number;
	workingDays: number;
	attendanceRate: number;
};

export type MonthlySummary = {
	month: string;
	workingDays: number;
	items: MonthlySummaryItem[];
};

export type EmployeeMonth = {
	month: string;
	employee: PunchCard["employee"];
	workingDays: number;
	days: {
		date: string;
		isSchoolDay: boolean;
		status: AttendanceStatus | null;
		attendance: AttendanceRecord | null;
	}[];
};
