import { AbsenceLogTable } from "./attendance/AbsenceLogTable";
import { AttendanceCalendarGrid } from "./attendance/AttendanceCalendarGrid";
import { AttendanceCharts } from "./attendance/AttendanceCharts";
import { AttendanceStats } from "./attendance/AttendanceStats";
import { AttendanceStreakCards } from "./attendance/AttendanceStreakCards";

export default function AttendanceTab() {
	const totalPresent = 217;
	const totalAbsent = 10;
	const totalLate = 13;
	const totalLeave = 10;
	const totalDays = 250;
	const attendancePercent = Math.round((totalPresent / totalDays) * 100);

	const streakData = {
		currentStreak: 18,
		longestStreak: 34,
		totalWorkingDays: 250,
		consecutiveLateCount: 0,
	};

	return (
		<div className="space-y-6">
			{/* Summary Stats */}
			<AttendanceStats
				totalPresent={totalPresent}
				totalAbsent={totalAbsent}
				totalLate={totalLate}
				totalLeave={totalLeave}
				attendancePercent={attendancePercent}
			/>

			{/* Streak & Quick Info */}
			<AttendanceStreakCards streakData={streakData} />

			{/* Daily Attendance Calendar */}
			<AttendanceCalendarGrid />

			{/* Charts Row */}
			<AttendanceCharts />

			{/* Recent Absences / Leave Log */}
			<AbsenceLogTable />
		</div>
	);
}
