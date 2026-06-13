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
import { Heart } from "lucide-react";

const medicalRecords = [
	{ record: "Annual Health Checkup", date: "Jul 2025", doctor: "Dr. Rahman", note: "All vitals normal. Height: 152cm, Weight: 42kg", status: "Completed" },
	{ record: "Vaccination: COVID-19", date: "Aug 2025", doctor: "School Nurse", note: "Booster dose administered", status: "Completed" },
	{ record: "Eye Test Report", date: "Jan 2026", doctor: "Dr. Hasan", note: "Vision: 6/6 both eyes", status: "Completed" },
	{ record: "Dental Checkup", date: "Mar 2026", doctor: "Dr. Sonia", note: "Mild cavity — follow-up needed", status: "Follow-up" },
];

const getStatusColor = (status: string) => {
	switch (status) {
		case "Completed": return "default";
		case "Follow-up": return "secondary";
		default: return "outline";
	}
};

export function MedicalRecordsTable() {
	return (
		<Card className="border-none shadow-sm">
			<CardHeader className="border-b pb-3">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<Heart className="h-4 w-4 text-muted-foreground" />
					Medical / Health Records
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="font-semibold">Record</TableHead>
							<TableHead className="font-semibold">Date</TableHead>
							<TableHead className="font-semibold">Doctor / Staff</TableHead>
							<TableHead className="font-semibold">Notes</TableHead>
							<TableHead className="text-center font-semibold">Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{medicalRecords.map((rec, i) => (
							<TableRow key={i}>
								<TableCell className="font-medium">{rec.record}</TableCell>
								<TableCell className="text-muted-foreground">{rec.date}</TableCell>
								<TableCell>{rec.doctor}</TableCell>
								<TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">{rec.note}</TableCell>
								<TableCell className="text-center">
									<Badge variant={getStatusColor(rec.status) as any} className="text-xs">{rec.status}</Badge>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
