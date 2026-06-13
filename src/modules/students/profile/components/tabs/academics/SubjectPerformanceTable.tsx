"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { TrendingDown, TrendingUp } from "lucide-react";

const subjectPerformance = [
	{ subject: "Bangla", marks: 90, total: 100, grade: "A+", gpa: 5.0, trend: "up", position: 3 },
	{ subject: "English", marks: 85, total: 100, grade: "A", gpa: 4.0, trend: "up", position: 8 },
	{ subject: "Mathematics", marks: 92, total: 100, grade: "A+", gpa: 5.0, trend: "up", position: 1 },
	{ subject: "Science", marks: 91, total: 100, grade: "A+", gpa: 5.0, trend: "down", position: 4 },
	{ subject: "Social Science", marks: 84, total: 100, grade: "A", gpa: 4.0, trend: "up", position: 6 },
	{ subject: "Religion", marks: 92, total: 100, grade: "A+", gpa: 5.0, trend: "up", position: 2 },
	{ subject: "ICT", marks: 86, total: 100, grade: "A", gpa: 4.0, trend: "up", position: 10 },
];

export function SubjectPerformanceTable() {
	return (
		<Card className="border-none shadow-sm">
			<CardHeader className="border-b pb-3">
				<CardTitle className="text-base font-semibold">Subject Performance Detail (Final Exam)</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="font-semibold">Subject</TableHead>
							<TableHead className="text-center font-semibold">Marks</TableHead>
							<TableHead className="text-center font-semibold">Grade</TableHead>
							<TableHead className="text-center font-semibold">GPA</TableHead>
							<TableHead className="text-center font-semibold">Position</TableHead>
							<TableHead className="text-center font-semibold">Progress</TableHead>
							<TableHead className="text-center font-semibold">Trend</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{subjectPerformance.map((sub) => (
							<TableRow key={sub.subject}>
								<TableCell className="font-medium">{sub.subject}</TableCell>
								<TableCell className="text-center">
									<span className="font-mono font-semibold">{sub.marks}</span>
									<span className="text-muted-foreground">/{sub.total}</span>
								</TableCell>
								<TableCell className="text-center">
									<Badge variant={sub.grade === "A+" ? "default" : "secondary"} className="text-xs">{sub.grade}</Badge>
								</TableCell>
								<TableCell className="text-center font-mono font-semibold">{sub.gpa.toFixed(1)}</TableCell>
								<TableCell className="text-center">
									<Badge variant="outline" className="text-xs">{sub.position}{sub.position === 1 ? "st" : sub.position === 2 ? "nd" : sub.position === 3 ? "rd" : "th"}</Badge>
								</TableCell>
								<TableCell className="text-center">
									<div className="mx-auto w-20">
										<Progress value={sub.marks} className="h-1.5" />
									</div>
								</TableCell>
								<TableCell className="text-center">
									{sub.trend === "up" ? <TrendingUp className="mx-auto h-4 w-4 text-green-600" /> : <TrendingDown className="mx-auto h-4 w-4 text-red-500" />}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
