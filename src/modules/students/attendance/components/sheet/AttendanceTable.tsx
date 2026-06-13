"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { AlertCircle, CalendarCheck, Check, Lock, Save, Users } from "lucide-react";

type AttendanceStatus = "present" | "absent" | "late";

interface AttendanceTableProps {
	isFuture: boolean;
	isLoading: boolean;
	filteredStudents: any[];
	attendanceData: Record<string, AttendanceStatus>;
	toggleStatus: (studentId: string, status: AttendanceStatus) => void;
	canEdit: boolean;
	stats: {
		total: number;
		present: number;
		absent: number;
		late: number;
	};
	isSubmitted: boolean;
	isDateSubmitted: boolean;
	handleSubmit: () => void;
}

export function AttendanceTable({
	isFuture,
	isLoading,
	filteredStudents,
	attendanceData,
	toggleStatus,
	canEdit,
	stats,
	isSubmitted,
	isDateSubmitted,
	handleSubmit,
}: AttendanceTableProps) {
	return (
		<Card className="border-none shadow-sm">
			<CardHeader className="border-b pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-base font-semibold">
						<CalendarCheck className="text-muted-foreground h-4 w-4" />
						Attendance Sheet
						{!canEdit && !isFuture && (
							<Badge variant="secondary" className="ml-2 gap-1 text-[10px]">
								<Lock className="h-2.5 w-2.5" />
								Read Only
							</Badge>
						)}
					</CardTitle>
					<div className="flex items-center gap-2">
						<div className="flex items-center gap-3 text-xs">
							<div className="flex items-center gap-1">
								<div className="h-2.5 w-2.5 rounded-full bg-green-600" />
								<span>P: {stats.present}</span>
							</div>
							<div className="flex items-center gap-1">
								<div className="h-2.5 w-2.5 rounded-full bg-red-500" />
								<span>A: {stats.absent}</span>
							</div>
							<div className="flex items-center gap-1">
								<div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
								<span>L: {stats.late}</span>
							</div>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				{isFuture ? (
					<div className="flex flex-col items-center justify-center gap-3 py-16">
						<AlertCircle className="text-muted-foreground/30 h-12 w-12" />
						<p className="text-muted-foreground">
							Cannot view attendance for future dates.
						</p>
					</div>
				) : isLoading ? (
					<div className="space-y-3 py-4">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton key={i} className="h-12 w-full rounded-md" />
						))}
					</div>
				) : filteredStudents.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 py-16">
						<Users className="text-muted-foreground/30 h-12 w-12" />
						<p className="text-muted-foreground">
							No students found for this class/section.
						</p>
					</div>
				) : (
					<>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-16 font-semibold">#</TableHead>
									<TableHead className="w-24 font-semibold">Roll</TableHead>
									<TableHead className="w-32 font-semibold">Student ID</TableHead>
									<TableHead className="font-semibold">Student Name</TableHead>
									<TableHead className="w-[100px] text-center font-semibold">
										Present
									</TableHead>
									<TableHead className="w-[100px] text-center font-semibold">
										Absent
									</TableHead>
									<TableHead className="w-[100px] text-center font-semibold">
										Late
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredStudents.map((student: any, index: number) => {
									const status = attendanceData[student.id] || "present";
									return (
										<TableRow
											key={student.id}
											className={
												status === "absent"
													? "bg-red-50/50 dark:bg-red-950/10"
													: status === "late"
														? "bg-amber-50/50 dark:bg-amber-950/10"
														: ""
											}
										>
											<TableCell className="text-muted-foreground">
												{index + 1}
											</TableCell>
											<TableCell className="font-mono font-semibold">
												{student.roll || "—"}
											</TableCell>
											<TableCell className="text-muted-foreground font-mono text-xs">
												{student.studentId || "—"}
											</TableCell>
											<TableCell className="font-medium">
												{student.fullName}
											</TableCell>
											<TableCell className="text-center">
												<button
													type="button"
													onClick={() =>
														toggleStatus(student.id, "present")
													}
													disabled={!canEdit}
													className={`inline-flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
														status === "present"
															? "border-green-600 bg-green-600 text-white shadow-sm"
															: "border-muted-foreground/20 hover:border-green-600/50"
													} ${
														!canEdit
															? "cursor-default opacity-75"
															: "cursor-pointer"
													}`}
												>
													{status === "present" && (
														<Check className="h-4 w-4" />
													)}
												</button>
											</TableCell>
											<TableCell className="text-center">
												<button
													type="button"
													onClick={() =>
														toggleStatus(student.id, "absent")
													}
													disabled={!canEdit}
													className={`inline-flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
														status === "absent"
															? "border-red-500 bg-red-500 text-white shadow-sm"
															: "border-muted-foreground/20 hover:border-red-500/50"
													} ${
														!canEdit
															? "cursor-default opacity-75"
															: "cursor-pointer"
													}`}
												>
													{status === "absent" && (
														<Check className="h-4 w-4" />
													)}
												</button>
											</TableCell>
											<TableCell className="text-center">
												<button
													type="button"
													onClick={() => toggleStatus(student.id, "late")}
													disabled={!canEdit}
													className={`inline-flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
														status === "late"
															? "border-amber-500 bg-amber-500 text-white shadow-sm"
															: "border-muted-foreground/20 hover:border-amber-500/50"
													} ${
														!canEdit
															? "cursor-default opacity-75"
															: "cursor-pointer"
													}`}
												>
													{status === "late" && (
														<Check className="h-4 w-4" />
													)}
												</button>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>

						{/* Submit Button */}
						{canEdit && (
							<div className="flex items-center justify-between border-t pt-4">
								<p className="text-muted-foreground text-xs">
									<span className="text-foreground font-semibold">
										{stats.total}
									</span>{" "}
									students •{" "}
									<span className="font-semibold text-green-600">
										{stats.present}
									</span>{" "}
									present •{" "}
									<span className="font-semibold text-red-500">
										{stats.absent}
									</span>{" "}
									absent •{" "}
									<span className="font-semibold text-amber-500">
										{stats.late}
									</span>{" "}
									late
								</p>
								<Button
									onClick={handleSubmit}
									className="gap-2 bg-green-600 hover:bg-green-700"
								>
									<Save className="h-4 w-4" />
									Submit Attendance
								</Button>
							</div>
						)}

						{/* Submitted Notice */}
						{(isSubmitted || isDateSubmitted) && !isFuture && (
							<div className="text-muted-foreground flex items-center gap-2 border-t pt-4 text-sm">
								<Lock className="h-4 w-4 text-green-600" />
								<span>
									Attendance for this date has been submitted and locked. Changes
									can only be made through reconciliation.
								</span>
							</div>
						)}
					</>
				)}
			</CardContent>
		</Card>
	);
}
