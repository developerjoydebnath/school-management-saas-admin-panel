"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { Clock } from "lucide-react";

const examSchedule = [
	{ subject: "Mathematics", date: "May 18, 2026", time: "10:00 AM", room: "Hall A" },
	{ subject: "English", date: "May 20, 2026", time: "10:00 AM", room: "Hall B" },
	{ subject: "Science", date: "May 22, 2026", time: "10:00 AM", room: "Lab 1" },
	{ subject: "Bangla", date: "May 24, 2026", time: "10:00 AM", room: "Hall A" },
	{ subject: "Social Science", date: "May 26, 2026", time: "10:00 AM", room: "Hall C" },
];

export function ExamSchedule() {
	return (
		<Card className="border-none shadow-sm">
			<CardHeader className="border-b pb-3">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<Clock className="h-4 w-4 text-muted-foreground" />
					Upcoming Exam Schedule
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="font-semibold">Subject</TableHead>
							<TableHead className="font-semibold">Date</TableHead>
							<TableHead className="font-semibold">Time</TableHead>
							<TableHead className="font-semibold">Room</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{examSchedule.map((exam, i) => (
							<TableRow key={i}>
								<TableCell className="font-medium">{exam.subject}</TableCell>
								<TableCell>{exam.date}</TableCell>
								<TableCell className="text-muted-foreground">{exam.time}</TableCell>
								<TableCell>
									<Badge variant="outline" className="text-xs">{exam.room}</Badge>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
