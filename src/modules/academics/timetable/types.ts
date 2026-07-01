export type PeriodType = "Period" | "Break" | "Lunch" | "Assembly" | "Activity" | "Prayer";

export type TimetableColumn = {
	id: string;
	name: string;
	startTime: string;
	endTime: string;
	type: PeriodType;
};

export type TimetableAssignment = {
	subjectId: string;
	teacherId: string;
	classRoomId?: string;
	subjectName?: string | { en: string; bn?: string };
	teacherName?: string;
	roomNumber?: string;
};

export type TimetableCells = Record<string, TimetableAssignment[]>;

export type TimetableTarget = {
	sessionId: string;
	classId: string;
	sectionId?: string | null;
};

export const PERIOD_TYPES: PeriodType[] = [
	"Period",
	"Break",
	"Lunch",
	"Assembly",
	"Activity",
	"Prayer",
];

export const getPeriodTypeColor = (type: PeriodType) => {
	switch (type) {
		case "Period":
			return "bg-primary/10 border-primary/20 text-primary-foreground";
		case "Break":
			return "bg-orange-100 border-orange-200 text-orange-800";
		case "Lunch":
			return "bg-green-100 border-green-200 text-green-800";
		case "Assembly":
			return "bg-blue-100 border-blue-200 text-blue-800";
		default:
			return "bg-gray-100 border-gray-200 text-gray-800";
	}
};

export const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
