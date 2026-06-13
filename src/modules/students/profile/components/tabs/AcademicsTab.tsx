import { AcademicsStats } from "./academics/AcademicsStats";
import { AssignmentTracker } from "./academics/AssignmentTracker";
import { ExamSchedule } from "./academics/ExamSchedule";
import { PerformanceCharts } from "./academics/PerformanceCharts";
import { RankGradeOverview } from "./academics/RankGradeOverview";
import { SubjectPerformanceTable } from "./academics/SubjectPerformanceTable";
import { TeacherRemarks } from "./academics/TeacherRemarks";

export default function AcademicsTab() {
	const totalAssignments = 50;
	const submitted = 42;
	const pending = 8;

	return (
		<div className="space-y-6">
			{/* Top Stats */}
			<AcademicsStats
				submitted={submitted}
				totalAssignments={totalAssignments}
				pending={pending}
			/>

			{/* Charts Row 1 & 2 */}
			<PerformanceCharts />

			{/* Charts Row 3 */}
			<RankGradeOverview />

			{/* Detailed Results Table */}
			<SubjectPerformanceTable />

			{/* Assignments Tracker */}
			<AssignmentTracker submitted={submitted} pending={pending} />

			{/* Upcoming Exams */}
			<ExamSchedule />

			{/* Teacher Remarks */}
			<TeacherRemarks />
		</div>
	);
}
