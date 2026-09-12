/** One scheduled paper — an `ExamSubject` row that has a date on it. */
export type ExamPaper = {
	id: string;
	examId: string;
	classId: string;
	/** ISO date of the sitting. Undated papers are never returned. */
	examDate: string;
	/** "10:00 AM" or "10:00" — the column holds both. Null until the routine
	 * fixes a time. */
	startTime?: string | null;
	durationMins: number;
	totalMarks: number;
	status: "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED" | "POSTPONED";
	exam: {
		id: string;
		name: string;
		nameBn?: string | null;
		type: string;
		status: string;
		startDate: string;
		endDate: string;
	};
	class: { id: string; enName: string; bnName?: string | null };
	subject: { id: string; enName: string; bnName?: string | null; code?: string | null };
	classRoom?: { id: string; roomNo?: string | null; name?: string | null } | null;
};

/** An exam whose date range overlaps the visible window. */
export type ExamPeriod = {
	id: string;
	name: string;
	nameBn?: string | null;
	type: string;
	status: string;
	startDate: string;
	endDate: string;
	classes: { classId: string; class: { id: string; enName: string } }[];
	_count?: { subjects: number };
};

export type ExamCalendarData = {
	papers: ExamPaper[];
	exams: ExamPeriod[];
};

/**
 * One fixed colour per exam type, so a glance at the grid separates a class
 * test from the annual exam. Same reasoning as the holiday/event calendars.
 */
export const examTypeColors: Record<
	string,
	{ bg: string; text: string; dot: string; border: string }
> = {
	UNIT_TEST: {
		bg: "bg-sky-500/15",
		text: "text-sky-700 dark:text-sky-400",
		dot: "bg-sky-500",
		border: "border-sky-500",
	},
	CLASS_TEST: {
		bg: "bg-cyan-500/15",
		text: "text-cyan-700 dark:text-cyan-400",
		dot: "bg-cyan-500",
		border: "border-cyan-500",
	},
	FIRST_TERM: {
		bg: "bg-indigo-500/15",
		text: "text-indigo-700 dark:text-indigo-400",
		dot: "bg-indigo-500",
		border: "border-indigo-500",
	},
	HALF_YEARLY: {
		bg: "bg-violet-500/15",
		text: "text-violet-700 dark:text-violet-400",
		dot: "bg-violet-500",
		border: "border-violet-500",
	},
	ANNUAL: {
		bg: "bg-rose-500/15",
		text: "text-rose-700 dark:text-rose-400",
		dot: "bg-rose-500",
		border: "border-rose-500",
	},
	FINAL: {
		bg: "bg-red-500/15",
		text: "text-red-700 dark:text-red-400",
		dot: "bg-red-500",
		border: "border-red-500",
	},
	MODEL_TEST: {
		bg: "bg-amber-500/15",
		text: "text-amber-700 dark:text-amber-400",
		dot: "bg-amber-500",
		border: "border-amber-500",
	},
	MOCK_TEST: {
		bg: "bg-orange-500/15",
		text: "text-orange-700 dark:text-orange-400",
		dot: "bg-orange-500",
		border: "border-orange-500",
	},
	PRE_TEST: {
		bg: "bg-teal-500/15",
		text: "text-teal-700 dark:text-teal-400",
		dot: "bg-teal-500",
		border: "border-teal-500",
	},
	CUSTOM: {
		bg: "bg-slate-500/15",
		text: "text-slate-700 dark:text-slate-400",
		dot: "bg-slate-500",
		border: "border-slate-500",
	},
};

export const EXAM_TYPE_FALLBACK = examTypeColors.CUSTOM;

export const examTypeOptions = [
	{ label: "Unit Test", value: "UNIT_TEST" },
	{ label: "Class Test", value: "CLASS_TEST" },
	{ label: "First Term", value: "FIRST_TERM" },
	{ label: "Half Yearly", value: "HALF_YEARLY" },
	{ label: "Annual", value: "ANNUAL" },
	{ label: "Final", value: "FINAL" },
	{ label: "Model Test", value: "MODEL_TEST" },
	{ label: "Mock Test", value: "MOCK_TEST" },
	{ label: "Pre Test", value: "PRE_TEST" },
	{ label: "Custom", value: "CUSTOM" },
];

/** Papers carry their own status, separate from the exam's. */
export const paperStatusColors: Record<string, { bg: string; text: string }> = {
	SCHEDULED: { bg: "bg-blue-500/15", text: "text-blue-700 dark:text-blue-400" },
	ONGOING: { bg: "bg-amber-500/15", text: "text-amber-700 dark:text-amber-400" },
	COMPLETED: { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-400" },
	CANCELLED: { bg: "bg-destructive/15", text: "text-destructive" },
	POSTPONED: { bg: "bg-slate-500/15", text: "text-slate-700 dark:text-slate-400" },
};

/**
 * Parses a stored start time into minutes past midnight.
 *
 * The column holds BOTH shapes in practice — "10:00 AM" and "02:00 PM" from the
 * routine builder, plus a plain 24-hour "10:00" from older rows. Assuming one
 * of them silently drops the end time for every row in the other format, so
 * both are accepted here.
 */
function parseStartMinutes(startTime?: string | null): number | null {
	const match = /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)?\s*$/i.exec(startTime || "");
	if (!match) return null;

	let hours = Number(match[1]);
	const minutes = Number(match[2]);
	if (!Number.isFinite(hours) || !Number.isFinite(minutes) || minutes > 59) return null;

	const meridiem = match[3]?.toUpperCase();
	if (meridiem) {
		if (hours < 1 || hours > 12) return null;
		// 12 AM is midnight and 12 PM is noon — the two cases a naive
		// "add 12 for PM" gets backwards.
		hours = hours % 12;
		if (meridiem === "PM") hours += 12;
	} else if (hours > 23) {
		return null;
	}

	return hours * 60 + minutes;
}

/** Minutes past midnight -> "10:00 AM". One display format regardless of how
 * the value was stored, so a routine never mixes both on screen. */
function formatClock(totalMinutes: number): string {
	const normalized = ((totalMinutes % 1440) + 1440) % 1440;
	const hours24 = Math.floor(normalized / 60);
	const minutes = normalized % 60;
	const meridiem = hours24 < 12 ? "AM" : "PM";
	const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
	return `${hours12}:${String(minutes).padStart(2, "0")} ${meridiem}`;
}

/** "10:00 AM" + 180 mins -> "10:00 AM - 1:00 PM". Pure display; no date involved. */
export function paperTimeRange(startTime?: string | null, durationMins?: number) {
	const start = parseStartMinutes(startTime);
	// An unparseable value is shown as stored rather than hidden — a wrong-looking
	// time on screen is a bug someone can report; a blank one is invisible.
	if (start === null) return startTime || null;
	if (!durationMins) return formatClock(start);
	return `${formatClock(start)} - ${formatClock(start + durationMins)}`;
}
