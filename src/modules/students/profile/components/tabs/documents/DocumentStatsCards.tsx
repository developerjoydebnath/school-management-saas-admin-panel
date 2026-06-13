"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { FileCheck2, FileText, FileWarning } from "lucide-react";

interface DocumentStatsCardsProps {
	totalDocs: number;
	verified: number;
	pending: number;
	missing: number;
}

export function DocumentStatsCards({ totalDocs, verified, pending, missing }: DocumentStatsCardsProps) {
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<Card className="border-none bg-blue-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-blue-500/10 p-2 text-blue-600">
						<FileText className="h-4 w-4" />
					</div>
					<div>
						<p className="text-[10px] text-muted-foreground">Total Documents</p>
						<p className="text-lg font-bold text-blue-700">{totalDocs}</p>
					</div>
				</CardContent>
			</Card>
			<Card className="border-none bg-green-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-green-500/10 p-2 text-green-600">
						<FileCheck2 className="h-4 w-4" />
					</div>
					<div>
						<p className="text-[10px] text-muted-foreground">Verified</p>
						<p className="text-lg font-bold text-green-700">{verified}</p>
					</div>
				</CardContent>
			</Card>
			<Card className="border-none bg-yellow-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-yellow-500/10 p-2 text-yellow-600">
						<FileWarning className="h-4 w-4" />
					</div>
					<div>
						<p className="text-[10px] text-muted-foreground">Pending</p>
						<p className="text-lg font-bold text-yellow-700">{pending}</p>
					</div>
				</CardContent>
			</Card>
			<Card className="border-none bg-red-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-red-500/10 p-2 text-red-600">
						<FileWarning className="h-4 w-4" />
					</div>
					<div>
						<p className="text-[10px] text-muted-foreground">Missing</p>
						<p className="text-lg font-bold text-red-700">{missing}</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
