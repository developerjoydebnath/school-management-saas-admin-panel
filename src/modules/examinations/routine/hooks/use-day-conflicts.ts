import { useSWR } from "@/shared/hooks/use-swr";
import { useMemo } from "react";

export type ConflictHoliday = {
	id: string;
	title: string;
	titleBn?: string | null;
	category: string;
	startDate: string;
	endDate: string;
	isClosed: boolean;
	description?: string | null;
};

export type ConflictEvent = {
	id: string;
	title: string;
	titleBn?: string | null;
	category: string;
	status: string;
	startDate: string;
	endDate: string;
	startTime?: string | null;
	endTime?: string | null;
	venue?: string | null;
};

export type DayConflicts = {
	holidays: ConflictHoliday[];
	events: ConflictEvent[];
};

const toKey = (value: string) => value.slice(0, 10);

/** Every date a start..end range covers, inclusive. */
function eachDateKey(start: string, end: string): string[] {
	const keys: string[] = [];
	const cursor = new Date(`${toKey(start)}T00:00:00.000Z`);
	const last = new Date(`${toKey(end)}T00:00:00.000Z`);
	// Guard against a malformed range spinning forever; an exam period is never
	// longer than a few months.
	let guard = 0;
	while (cursor <= last && guard < 400) {
		keys.push(cursor.toISOString().slice(0, 10));
		cursor.setUTCDate(cursor.getUTCDate() + 1);
		guard += 1;
	}
	return keys;
}

/**
 * Parses the app's two stored time shapes — "10:00 AM" and "14:00" — into
 * minutes past midnight. Events and exam rows are both written by hand, so both
 * shapes turn up.
 */
export function parseClockMinutes(value?: string | null): number | null {
	const match = /^\s*(\d{1,2}):(\d{2})\s*(AM|PM)?\s*$/i.exec(value || "");
	if (!match) return null;

	let hours = Number(match[1]);
	const minutes = Number(match[2]);
	if (!Number.isFinite(hours) || !Number.isFinite(minutes) || minutes > 59) return null;

	const meridiem = match[3]?.toUpperCase();
	if (meridiem) {
		if (hours < 1 || hours > 12) return null;
		hours = hours % 12;
		if (meridiem === "PM") hours += 12;
	} else if (hours > 23) {
		return null;
	}
	return hours * 60 + minutes;
}

/**
 * Does the exam sitting actually overlap the event's hours?
 *
 * Returns null when it cannot be decided — an all-day event, or a paper with no
 * start time yet. That is deliberately different from `false`: "we don't know"
 * must not be shown as "no clash".
 */
export function overlapsEventTime(
	examStartTime: string | null | undefined,
	examDurationMins: number | undefined,
	event: ConflictEvent
): boolean | null {
	const eventStart = parseClockMinutes(event.startTime);
	const eventEnd = parseClockMinutes(event.endTime);
	const examStart = parseClockMinutes(examStartTime);
	if (eventStart === null || examStart === null) return null;

	const examEnd = examStart + (examDurationMins || 0);
	// An event with a start but no end is treated as a moment, not a whole day.
	const eventFinish = eventEnd ?? eventStart;
	return examStart < eventFinish && eventStart < examEnd;
}

/**
 * Holidays and events for each day of the exam period, keyed by date.
 *
 * Served by `/exam-routines/day-conflicts` rather than the holiday and event
 * list endpoints, because a routine editor may not hold those modules' view
 * permissions and the warnings would quietly vanish for them.
 */
export function useDayConflicts(params: {
	dateFrom?: string;
	dateTo?: string;
	sessionId?: string;
}) {
	const ready = !!params.dateFrom && !!params.dateTo;

	const { data, isLoading } = useSWR(ready ? "/exam-routines/day-conflicts" : null, {
		dateFrom: params.dateFrom,
		dateTo: params.dateTo,
		sessionId: params.sessionId || undefined,
	});

	const payload = data?.data as DayConflicts | undefined;

	// Ranges are expanded into per-day buckets once, here, so every row lookup
	// is a map hit rather than a scan over every holiday and event.
	const byDate = useMemo(() => {
		const map = new Map<string, DayConflicts>();
		const bucket = (key: string) => {
			const entry = map.get(key) || { holidays: [], events: [] };
			map.set(key, entry);
			return entry;
		};

		(payload?.holidays || []).forEach((holiday) => {
			eachDateKey(holiday.startDate, holiday.endDate).forEach((key) => {
				bucket(key).holidays.push(holiday);
			});
		});
		(payload?.events || []).forEach((event) => {
			eachDateKey(event.startDate, event.endDate).forEach((key) => {
				bucket(key).events.push(event);
			});
		});

		return map;
	}, [payload]);

	return {
		byDate,
		holidays: payload?.holidays || [],
		events: payload?.events || [],
		isLoading: ready && isLoading,
	};
}
