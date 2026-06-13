export interface SyllabusOverview {
	id: string;
	classId: string;
	className: string;
	medium: string;
	nextExam: string;
	progress: number;
	totalSubjects: number;
}

export interface SyllabusDetail {
	id: string;
	classId: string;
	subject: string;
	term: string;
	topics: string;
	completionDate: string;
	status: "In Progress" | "Completed" | "Pending";
}
