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
import { BookMarked } from "lucide-react";

const assignments = [
	{ title: "Mathematics Problem Set 8", subject: "Math", dueDate: "May 18, 2026", status: "Pending", marks: "—" },
	{ title: "Essay: Climate Change", subject: "English", dueDate: "May 15, 2026", status: "Submitted", marks: "—" },
	{ title: "Science Lab Report", subject: "Science", dueDate: "May 10, 2026", status: "Graded", marks: "18/20" },
	{ title: "History Research Paper", subject: "Social Science", dueDate: "May 05, 2026", status: "Graded", marks: "15/20" },
	{ title: "Bangla Poem Analysis", subject: "Bangla", dueDate: "Apr 28, 2026", status: "Graded", marks: "19/20" },
	{ title: "ICT Project: Website", subject: "ICT", dueDate: "Apr 20, 2026", status: "Graded", marks: "17/20" },
];

interface AssignmentTrackerProps {
	submitted: number;
	pending: number;
}

export function AssignmentTracker({ submitted, pending }: AssignmentTrackerProps) {
	return (
		<Card className="border-none shadow-sm">
			<CardHeader className="border-b pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-base font-semibold">
						<BookMarked className="h-4 w-4 text-muted-foreground" />
						Assignment Tracker
					</CardTitle>
					<div className="flex gap-2 text-xs">
						<Badge variant="secondary">{submitted} Submitted</Badge>
						<Badge variant="outline">{pending} Pending</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="font-semibold">Assignment</TableHead>
							<TableHead className="font-semibold">Subject</TableHead>
							<TableHead className="font-semibold">Due Date</TableHead>
							<TableHead className="text-center font-semibold">Status</TableHead>
							<TableHead className="text-center font-semibold">Marks</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{assignments.map((a, i) => (
							<TableRow key={i}>
								<TableCell className="font-medium">{a.title}</TableCell>
								<TableCell>
									<Badge variant="outline" className="text-xs">{a.subject}</Badge>
								</TableCell>
								<TableCell className="text-muted-foreground">{a.dueDate}</TableCell>
								<TableCell className="text-center">
									<Badge
										variant={a.status === "Graded" ? "default" : a.status === "Submitted" ? "secondary" : "outline"}
										className="text-xs"
									>
										{a.status}
									</Badge>
								</TableCell>
								<TableCell className="text-center font-mono text-sm">
									{a.marks}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
