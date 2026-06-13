"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";
import { Clock, TrendingUp, UserCheck, UserMinus, Users } from "lucide-react";

interface AttendanceSheetStatsProps {
	stats: {
		total: number;
		present: number;
		absent: number;
		late: number;
		rate: number;
	};
}

export function AttendanceSheetStats({ stats }: AttendanceSheetStatsProps) {
	const statsConfig = [
		{
			label: "Total",
			value: stats.total,
			icon: Users,
			color: "blue",
		},
		{
			label: "Present",
			value: stats.present,
			icon: UserCheck,
			color: "green",
		},
		{
			label: "Absent",
			value: stats.absent,
			icon: UserMinus,
			color: "red",
		},
		{
			label: "Late",
			value: stats.late,
			icon: Clock,
			color: "amber",
		},
		{
			label: "Rate",
			value: `${stats.rate}%`,
			icon: TrendingUp,
			color: "emerald",
		},
	];

	return (
		<div className="grid grid-cols-2 gap-3 @xl/attendance-sheet:grid-cols-3 @5xl/attendance-sheet:grid-cols-5">
			{statsConfig.map((stat) => (
				<Card
					key={stat.label}
					className={cn(
						"border-none shadow-sm",
						stat.color === "blue" && "bg-blue-500/5",
						stat.color === "green" && "bg-green-500/5",
						stat.color === "red" && "bg-red-500/5",
						stat.color === "amber" && "bg-amber-500/5",
						stat.color === "emerald" && "bg-emerald-500/5"
					)}
				>
					<CardContent className="flex items-center gap-2.5 px-4">
						<div
							className={cn(
								"rounded-full p-2",
								stat.color === "blue" && "bg-blue-500/10 text-blue-600",
								stat.color === "green" && "bg-green-500/10 text-green-600",
								stat.color === "red" && "bg-red-500/10 text-red-600",
								stat.color === "amber" && "bg-amber-500/10 text-amber-600",
								stat.color === "emerald" && "bg-emerald-500/10 text-emerald-600"
							)}
						>
							<stat.icon className="h-4 w-4" />
						</div>
						<div>
							<p className="text-muted-foreground text-[10px]">{stat.label}</p>
							<p
								className={cn(
									"text-lg font-bold",
									stat.color === "blue" && "text-blue-700",
									stat.color === "green" && "text-green-700",
									stat.color === "red" && "text-red-700",
									stat.color === "amber" && "text-amber-700",
									stat.color === "emerald" && "text-emerald-700"
								)}
							>
								{stat.value}
							</p>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
