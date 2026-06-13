"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { Gift } from "lucide-react";

interface FeeProgressScholarshipProps {
	feeSummary: {
		totalPaid: number;
		totalDue: number;
		paidPercent: number;
	};
	scholarshipInfo: {
		name: string;
		status: string;
		amount: number;
		validUntil: string;
		criteria: string;
	};
}

export function FeeProgressScholarship({ feeSummary, scholarshipInfo }: FeeProgressScholarshipProps) {
	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
			<Card className="border-none shadow-sm">
				<CardContent className="p-4">
					<div className="flex items-center justify-between text-sm">
						<span className="font-medium">Payment Progress</span>
						<span className="font-mono font-semibold text-primary">{feeSummary.paidPercent}%</span>
					</div>
					<Progress value={feeSummary.paidPercent} className="mt-2 h-3" />
					<div className="mt-2 flex justify-between text-xs text-muted-foreground">
						<span>৳{feeSummary.totalPaid.toLocaleString()} paid</span>
						<span>৳{feeSummary.totalDue.toLocaleString()} remaining</span>
					</div>
				</CardContent>
			</Card>
			{/* Scholarship */}
			<Card className="border-none bg-gradient-to-r from-green-500/5 to-blue-500/5 shadow-sm">
				<CardContent className="p-4">
					<div className="flex items-center gap-2">
						<Gift className="h-4 w-4 text-green-600" />
						<span className="text-sm font-semibold">{scholarshipInfo.name}</span>
						<Badge variant="default" className="text-[10px]">{scholarshipInfo.status}</Badge>
					</div>
					<div className="mt-2 grid grid-cols-2 gap-2 text-xs">
						<div>
							<span className="text-muted-foreground">Amount: </span>
							<span className="font-semibold">৳{scholarshipInfo.amount.toLocaleString()}</span>
						</div>
						<div>
							<span className="text-muted-foreground">Valid: </span>
							<span className="font-semibold">{scholarshipInfo.validUntil}</span>
						</div>
						<div className="col-span-2">
							<span className="text-muted-foreground">Criteria: </span>
							<span className="font-semibold">{scholarshipInfo.criteria}</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
