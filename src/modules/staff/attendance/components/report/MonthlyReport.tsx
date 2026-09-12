"use client";

import DataTable from "@/shared/components/table/DataTable";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { PATHS } from "@/shared/configs/paths.config";
import { cn } from "@/shared/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MonthlySummaryItem } from "../../dto/staff-attendance.dto";
import { useMonthlySummary } from "../../hooks/use-staff-attendance";
import { downloadMonthlyStatementPdf } from "../../hooks/use-staff-attendance-mutations";

const currentMonth = () => {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const rateTone = (rate: number) =>
	rate >= 90
		? "text-emerald-600 dark:text-emerald-400"
		: rate >= 75
			? "text-amber-600 dark:text-amber-400"
			: "text-red-600 dark:text-red-400";

export function MonthlyReport() {
	const [month, setMonth] = useState(currentMonth());
	const [employeeType, setEmployeeType] = useState("");
	const { summary, isLoading } = useMonthlySummary({
		month,
		...(employeeType ? { employeeType } : {}),
	});

	const columns: ColumnDef<MonthlySummaryItem>[] = useMemo(
		() => [
			{
				id: "employee",
				header: "Employee",
				cell: ({ row }) => (
					<Link
						href={PATHS.STAFF.ATTENDANCE.EMPLOYEE(
							row.original.employeeType,
							row.original.employeeId
						)}
						className="hover:underline"
					>
						<div className="font-medium">{row.original.fullName}</div>
						<div className="text-muted-foreground text-xs">
							{row.original.employeeCode} · {row.original.designationName || "—"}
						</div>
					</Link>
				),
			},
			{
				id: "type",
				header: "Type",
				cell: ({ row }) => (
					<Badge variant="outline" className="capitalize">
						{row.original.employeeType}
					</Badge>
				),
			},
			{
				id: "present",
				header: "Present",
				cell: ({ row }) => <span className="tabular-nums">{row.original.present}</span>,
			},
			{
				id: "late",
				header: "Late",
				cell: ({ row }) => <span className="tabular-nums">{row.original.late}</span>,
			},
			{
				id: "halfDay",
				header: "Half day",
				cell: ({ row }) => <span className="tabular-nums">{row.original.halfDay}</span>,
			},
			{
				id: "onLeave",
				header: "Leave",
				cell: ({ row }) => <span className="tabular-nums">{row.original.onLeave}</span>,
			},
			{
				id: "absent",
				header: "Absent",
				cell: ({ row }) => <span className="tabular-nums">{row.original.absent}</span>,
			},
			{
				id: "workedHours",
				header: "Hours",
				cell: ({ row }) => (
					<span className="tabular-nums">{row.original.workedHours}</span>
				),
			},
			{
				id: "rate",
				header: "Rate",
				cell: ({ row }) => (
					<span
						className={cn("font-semibold tabular-nums", rateTone(row.original.attendanceRate))}
					>
						{row.original.attendanceRate}%
					</span>
				),
			},
		],
		[]
	);

	return (
		<Card className="@container/page p-4 shadow-none ring-0 sm:p-6">
			<CardHeader className="p-0 pb-4">
				<div className="flex flex-col gap-3 @3xl/page:flex-row @3xl/page:items-center @3xl/page:justify-between">
					<div className="flex flex-wrap items-center gap-2">
						<Input
							type="month"
							value={month}
							onChange={(event) => setMonth(event.target.value)}
							className="w-auto"
						/>
						{summary && (
							<Badge variant="outline">{summary.workingDays} working days</Badge>
						)}
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Tabs
							value={employeeType || "all"}
							onValueChange={(value) => setEmployeeType(value === "all" ? "" : value)}
						>
							<TabsList>
								<TabsTrigger value="all">All</TabsTrigger>
								<TabsTrigger value="teacher">Teachers</TabsTrigger>
								<TabsTrigger value="staff">Staff</TabsTrigger>
							</TabsList>
						</Tabs>
						<Button
							variant="outline"
							className="gap-2"
							onClick={() => downloadMonthlyStatementPdf(month)}
						>
							<Download className="size-4" /> Download PDF
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<DataTable
					columns={columns}
					data={summary?.items || []}
					isLoading={isLoading}
				/>
			</CardContent>
		</Card>
	);
}
