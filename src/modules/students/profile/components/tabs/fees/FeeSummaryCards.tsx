"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { AlertCircle, AlertTriangle, CheckCircle2, CreditCard, DollarSign, Gift } from "lucide-react";

interface FeeSummaryCardsProps {
	feeSummary: {
		totalFee: number;
		totalPaid: number;
		totalDue: number;
		totalDiscount: number;
		totalFine: number;
		nextPaymentAmount: number;
	};
}

export function FeeSummaryCards({ feeSummary }: FeeSummaryCardsProps) {
	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
			<Card className="border-none bg-blue-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-blue-500/10 p-2 text-blue-600">
						<DollarSign className="h-4 w-4" />
					</div>
					<div>
						<p className="text-[10px] text-muted-foreground">Total Fee</p>
						<p className="text-lg font-bold text-blue-700">৳{feeSummary.totalFee.toLocaleString()}</p>
					</div>
				</CardContent>
			</Card>
			<Card className="border-none bg-green-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-green-500/10 p-2 text-green-600">
						<CheckCircle2 className="h-4 w-4" />
					</div>
					<div>
						<p className="text-[10px] text-muted-foreground">Paid</p>
						<p className="text-lg font-bold text-green-700">৳{feeSummary.totalPaid.toLocaleString()}</p>
					</div>
				</CardContent>
			</Card>
			<Card className="border-none bg-red-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-red-500/10 p-2 text-red-600">
						<AlertCircle className="h-4 w-4" />
					</div>
					<div>
						<p className="text-[10px] text-muted-foreground">Due</p>
						<p className="text-lg font-bold text-red-700">৳{feeSummary.totalDue.toLocaleString()}</p>
					</div>
				</CardContent>
			</Card>
			<Card className="border-none bg-purple-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-purple-500/10 p-2 text-purple-600">
						<Gift className="h-4 w-4" />
					</div>
					<div>
						<p className="text-[10px] text-muted-foreground">Discount</p>
						<p className="text-lg font-bold text-purple-700">৳{feeSummary.totalDiscount.toLocaleString()}</p>
					</div>
				</CardContent>
			</Card>
			<Card className="border-none bg-yellow-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-yellow-500/10 p-2 text-yellow-600">
						<AlertTriangle className="h-4 w-4" />
					</div>
					<div>
						<p className="text-[10px] text-muted-foreground">Fine</p>
						<p className="text-lg font-bold text-yellow-700">৳{feeSummary.totalFine}</p>
					</div>
				</CardContent>
			</Card>
			<Card className="border-none bg-orange-500/5 shadow-sm">
				<CardContent className="flex items-center gap-3 p-4">
					<div className="rounded-full bg-orange-500/10 p-2 text-orange-600">
						<CreditCard className="h-4 w-4" />
					</div>
					<div>
						<p className="text-[10px] text-muted-foreground">Next Due</p>
						<p className="text-lg font-bold text-orange-700">৳{feeSummary.nextPaymentAmount.toLocaleString()}</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
