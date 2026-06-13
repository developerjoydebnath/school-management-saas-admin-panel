"use client";

import { Card, CardContent } from "@/shared/components/ui/card";

interface AttendanceStreakCardsProps {
	streakData: {
		currentStreak: number;
		longestStreak: number;
		totalWorkingDays: number;
		consecutiveLateCount: number;
	};
}

export function AttendanceStreakCards({ streakData }: AttendanceStreakCardsProps) {
	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
			<Card className="border-none shadow-sm">
				<CardContent className="p-4 text-center">
					<p className="text-primary text-3xl font-bold">
						{streakData.currentStreak}
					</p>
					<p className="text-muted-foreground mt-1 text-xs">Current Streak (days)</p>
				</CardContent>
			</Card>
			<Card className="border-none shadow-sm">
				<CardContent className="p-4 text-center">
					<p className="text-3xl font-bold text-green-600">
						{streakData.longestStreak}
					</p>
					<p className="text-muted-foreground mt-1 text-xs">Longest Streak</p>
				</CardContent>
			</Card>
			<Card className="border-none shadow-sm">
				<CardContent className="p-4 text-center">
					<p className="text-3xl font-bold">{streakData.totalWorkingDays}</p>
					<p className="text-muted-foreground mt-1 text-xs">Total Working Days</p>
				</CardContent>
			</Card>
			<Card className="border-none shadow-sm">
				<CardContent className="p-4 text-center">
					<p className="text-3xl font-bold text-yellow-600">
						{streakData.consecutiveLateCount}
					</p>
					<p className="text-muted-foreground mt-1 text-xs">Consecutive Late</p>
				</CardContent>
			</Card>
		</div>
	);
}
