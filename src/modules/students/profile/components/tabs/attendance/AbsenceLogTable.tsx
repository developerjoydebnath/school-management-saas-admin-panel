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
import { cn } from "@/shared/lib/utils";

const recentAbsences = [
	{ date: "Apr 22, 2026", day: "Tuesday", reason: "Fever", status: "Excused", type: "A" },
	{ date: "Mar 10, 2026", day: "Monday", reason: "Family Event", status: "Excused", type: "L" },
	{ date: "Feb 14, 2026", day: "Wednesday", reason: "No reason", status: "Unexcused", type: "A" },
	{ date: "Feb 08, 2026", day: "Thursday", reason: "Doctor Visit", status: "Excused", type: "L" },
	{ date: "Jan 20, 2026", day: "Monday", reason: "Weather", status: "Excused", type: "A" },
	{ date: "Dec 18, 2025", day: "Thursday", reason: "—", status: "Unexcused", type: "A" },
	{ date: "Dec 15, 2025", day: "Monday", reason: "Sick", status: "Excused", type: "A" },
];

const statusStyle = {
	A: "bg-red-500/15 text-red-700 dark:text-red-400",
	L: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
};

export function AbsenceLogTable() {
	return (
		<Card className="border-none shadow-sm">
			<CardHeader className="border-b pb-3">
				<CardTitle className="text-base font-semibold">
					Recent Absences & Leave Log
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="font-semibold">Date</TableHead>
							<TableHead className="font-semibold">Day</TableHead>
							<TableHead className="text-center font-semibold">Type</TableHead>
							<TableHead className="font-semibold">Reason</TableHead>
							<TableHead className="text-center font-semibold">Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{recentAbsences.map((absence, i) => (
							<TableRow key={i}>
								<TableCell className="font-medium">{absence.date}</TableCell>
								<TableCell className="text-muted-foreground">
									{absence.day}
								</TableCell>
								<TableCell className="text-center">
									<span
										className={cn(
											"inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold",
											absence.type === "A" ? statusStyle.A : statusStyle.L
										)}
									>
										{absence.type}
									</span>
								</TableCell>
								<TableCell>{absence.reason}</TableCell>
								<TableCell className="text-center">
									<Badge
										variant={
											absence.status === "Excused"
												? "secondary"
												: "destructive"
										}
										className="text-xs"
									>
										{absence.status}
									</Badge>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
