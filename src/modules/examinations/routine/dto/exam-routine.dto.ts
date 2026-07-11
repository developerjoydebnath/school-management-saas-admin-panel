export enum ExamRoutineSubjectStatusEnum {
	SCHEDULED = "SCHEDULED",
	ONGOING = "ONGOING",
	COMPLETED = "COMPLETED",
	CANCELLED = "CANCELLED",
	POSTPONED = "POSTPONED",
}

export type ExamRoutineSubjectPayload = {
	id: string;
	examDate?: string | null;
	startTime?: string | null;
	durationMins: number;
	classRoomId?: string | null;
	invigilatorId?: string | null;
	status: ExamRoutineSubjectStatusEnum;
};

export type SaveExamRoutinePayload = {
	examId: string;
	classId: string;
	subjects: ExamRoutineSubjectPayload[];
};
