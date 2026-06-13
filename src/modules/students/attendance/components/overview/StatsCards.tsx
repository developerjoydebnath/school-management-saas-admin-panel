"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { TrendingUp, UserCheck, UserMinus, Users } from "lucide-react";

interface StatsCardsProps {
	isLoading: boolean;
	totals: {
		totalStudents: number;
		present: number;
		absent: number;
		late: number;
	};
	presentPercentage: number;
}

export function StatsCards({ isLoading, totals, presentPercentage }: StatsCardsProps) {
	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
			<Card className="border-none bg-blue-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-blue-500/10 p-2.5 text-blue-600">
						<Users className="h-5 w-5" />
					</div>
					<div>
						<p className="text-muted-foreground text-[11px] font-medium">
							Total Students
						</p>
						<p className="text-2xl font-bold text-blue-700">
							{isLoading ? "—" : totals.totalStudents}
						</p>
					</div>
				</CardContent>
			</Card>

			<Card className="border-none bg-green-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-green-500/10 p-2.5 text-green-600">
						<UserCheck className="h-5 w-5" />
					</div>
					<div>
						<p className="text-muted-foreground text-[11px] font-medium">
							Present Today
						</p>
						<p className="text-2xl font-bold text-green-700">
							{isLoading ? "—" : totals.present}
						</p>
					</div>
				</CardContent>
			</Card>

			<Card className="border-none bg-red-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-red-500/10 p-2.5 text-red-600">
						<UserMinus className="h-5 w-5" />
					</div>
					<div>
						<p className="text-muted-foreground text-[11px] font-medium">
							Absent Today
						</p>
						<p className="text-2xl font-bold text-red-700">
							{isLoading ? "—" : totals.absent}
						</p>
					</div>
				</CardContent>
			</Card>

			<Card className="border-none bg-emerald-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-emerald-500/10 p-2.5 text-emerald-600">
						<TrendingUp className="h-5 w-5" />
					</div>
					<div>
						<p className="text-muted-foreground text-[11px] font-medium">
							Present Rate
						</p>
						<p className="text-2xl font-bold text-emerald-700">
							{isLoading ? "—" : `${presentPercentage}%`}
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
