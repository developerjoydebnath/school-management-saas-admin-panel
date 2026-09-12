export type RoomLayoutItem = {
	id: string;
	type: "bench" | "chair" | "table" | "board" | "projector" | "fan" | "light" | "generic";
	label: string;
	x: number;
	y: number;
	rotation: number;
	seats?: number;
	physicalWidth: number;
	physicalHeight: number;
};

export type ExamClassOption = {
	examClassId: string;
	classId: string;
	className?: string;
	classNameBn?: string;
};

export type SeatPlanOverview = {
	exam: { id: string; name: string; nameBn?: string; sessionId: string };
	classes: ExamClassOption[];
};

export type RoomListRow = {
	id: string;
	name: string;
	roomNo: string;
	capacity: number;
	seatedCount: number;
};

export type SeatAssignment = {
	id: string;
	benchItemId: string;
	seatIndex: number;
	isOverflow: boolean;
	studentId: string;
	examClassId: string;
	classId: string;
	student: { id: string; fullName: string; studentId: string; roll: string | null };
};

export type RoomCanvasData = {
	room: {
		id: string;
		name: string;
		roomNo: string;
		capacity: number;
		layoutConfig: { items: RoomLayoutItem[] } | null;
		dimensionUnit: "feet" | "meter";
		roomLength: number | null;
		roomWidth: number | null;
	};
	examClasses: ExamClassOption[];
	assignments: SeatAssignment[];
};

export type AvailableStudent = {
	id: string;
	studentId: string;
	fullName: string;
	roll: string | null;
	classId: string;
	className?: string;
	sectionId: string | null;
	sectionName?: string;
};

export type SeatPlanSummaryClassRow = {
	classId: string;
	className?: string;
	rollMin: number | null;
	rollMax: number | null;
	seatedCount: number;
};

export type SeatPlanSummaryRow = {
	classRoomId: string;
	roomName?: string;
	roomNo?: string;
	capacity?: number;
	seatedCount: number;
	byClass: SeatPlanSummaryClassRow[];
};

export type SeatTokenTemplate = "classic" | "emerald" | "crimson";
