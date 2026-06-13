"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Award, BookOpen, CheckCircle2, Clock, GraduationCap, TrendingUp } from "lucide-react";

interface AcademicsStatsProps {
	submitted: number;
	totalAssignments: number;
	pending: number;
}

export function AcademicsStats({ submitted, totalAssignments, pending }: AcademicsStatsProps) {
	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
			<Card className="border-none bg-green-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-green-500/10 p-2 text-green-600">
						<GraduationCap className="h-4 w-4" />
					</div>
					<div>
						<p className="text-[10px] text-muted-foreground">GPA</p>
						<p className="text-lg font-bold text-green-700">3.85</p>
					</div>
				</CardContent>
			</Card>
			<Card className="border-none bg-blue-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-blue-500/10 p-2 text-blue-600">
						<Award className="h-4 w-4" />
					</div>
					<div>
						<p className="text-[10px] text-muted-foreground">Class Rank</p>
						<p className="text-lg font-bold text-blue-700">2nd</p>
					</div>
				</CardContent>
			</Card>
			<Card className="border-none bg-purple-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-purple-500/10 p-2 text-purple-600">
						<BookOpen className="h-4 w-4" />
					</div>
					<div>
						<p className="text-[10px] text-muted-foreground">Subjects</p>
						<p className="text-lg font-bold text-purple-700">7</p>
					</div>
				</CardContent>
			</Card>
			<Card className="border-none bg-orange-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-orange-500/10 p-2 text-orange-600">
						<TrendingUp className="h-4 w-4" />
					</div>
					<div>
						<p className="text-[10px] text-muted-foreground">Best Subject</p>
						<p className="text-lg font-bold text-orange-700">Math</p>
					</div>
				</CardContent>
			</Card>
			<Card className="border-none bg-pink-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-pink-500/10 p-2 text-pink-600">
						<CheckCircle2 className="h-4 w-4" />
					</div>
					<div>
						<p className="text-[10px] text-muted-foreground">Submitted</p>
						<p className="text-lg font-bold text-pink-700">{submitted}/{totalAssignments}</p>
					</div>
				</CardContent>
			</Card>
			<Card className="border-none bg-yellow-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-yellow-500/10 p-2 text-yellow-600">
						<Clock className="h-4 w-4" />
					</div>
					<div>
						<p className="text-[10px] text-muted-foreground">Pending</p>
						<p className="text-lg font-bold text-yellow-700">{pending}</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
