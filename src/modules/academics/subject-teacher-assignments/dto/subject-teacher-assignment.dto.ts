export type SubjectTeacherAssignmentRow = {
	id: string;
	subjectId: string;
	teacherId: string;
	subject?: { id: string; enName: string; bnName?: string; code?: string };
	teacher?: { id: string; fullName: string };
};

export type SubjectTeacherSetup = {
	sessionId: string;
	classId: string;
	sectionId: string | null;
	assignments: SubjectTeacherAssignmentRow[];
};

export type SubjectTeacherSetupPayload = {
	sessionId: string;
	classId: string;
	sectionId?: string;
	assignments: { subjectId: string; teacherId?: string }[];
};
