"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useSWR } from "@/shared/hooks/use-swr";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { CheckCircle2, Clock, FileWarning } from "lucide-react";
import { format } from "date-fns";

export default function TransferInTab() {
	const { data: students, isLoading } = useSWR("/students");
	
	// In a real app, this would be filtered by the backend or API endpoint
	// e.g. /students?admissionType=transfer
	const transferStudents = students?.filter((s: any) => s.admissionType === "transfer" || s.admissionDate?.includes("2023")) || [];

	return (
		<div className="p-6">
			<Card className="border-none shadow-none">
				<CardHeader className="px-0 pt-0">
					<CardTitle>Incoming Transfer Students</CardTitle>
					<CardDescription>Manage and track students admitted via Transfer Certificate.</CardDescription>
				</CardHeader>
				<CardContent className="px-0">
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow className="bg-muted/50">
									<TableHead>Student</TableHead>
									<TableHead>Class</TableHead>
									<TableHead>Admission Date</TableHead>
									<TableHead>Previous School</TableHead>
									<TableHead>TC Status</TableHead>
									<TableHead className="text-right">Action</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									<TableRow>
										<TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
											Loading data...
										</TableCell>
									</TableRow>
								) : transferStudents.length === 0 ? (
									<TableRow>
										<TableCell colSpan={6} className="text-center py-8 text-muted-foreground flex flex-col items-center">
											<FileWarning className="h-8 w-8 mb-2 opacity-20" />
											No incoming transfer students found.
										</TableCell>
									</TableRow>
								) : (
									transferStudents.map((student: any) => (
										<TableRow key={student.id}>
											<TableCell>
												<div className="font-medium">{student.fullName}</div>
												<div className="text-xs text-muted-foreground">{student.studentId}</div>
											</TableCell>
											<TableCell>{student.class}</TableCell>
											<TableCell>{student.admissionDate ? format(new Date(student.admissionDate), "MMM dd, yyyy") : "N/A"}</TableCell>
											<TableCell className="text-sm">
												{student.previousSchool || "Unknown School"}
											</TableCell>
											<TableCell>
												{/* Mocking TC Status since it's not strictly in db.json */}
												{student.id % 2 === 0 ? (
													<Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 gap-1">
														<Clock className="h-3 w-3" /> Pending TC
													</Badge>
												) : (
													<Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 gap-1">
														<CheckCircle2 className="h-3 w-3" /> TC Verified
													</Badge>
												)}
											</TableCell>
											<TableCell className="text-right">
												<Button variant="outline" size="sm">Update Docs</Button>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
