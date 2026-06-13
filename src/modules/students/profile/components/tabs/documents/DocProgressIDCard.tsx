"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { IdCard } from "lucide-react";

interface DocProgressIDCardProps {
	completionPercent: number;
	verified: number;
	totalDocs: number;
	idCardInfo: {
		cardNumber: string;
		status: string;
		bloodGroup: string;
		issueDate: string;
		expiryDate: string;
	};
}

export function DocProgressIDCard({
	completionPercent,
	verified,
	totalDocs,
	idCardInfo,
}: DocProgressIDCardProps) {
	return (
		<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
			{/* Completion Progress */}
			<Card className="border-none shadow-sm">
				<CardContent className="space-y-3 p-4">
					<div className="flex items-center justify-between text-sm">
						<span className="font-medium">Document Completion</span>
						<span className="font-mono font-semibold text-primary">{completionPercent}%</span>
					</div>
					<Progress value={completionPercent} className="h-3" />
					<p className="text-xs text-muted-foreground">
						{verified} of {totalDocs - 1} required documents verified
					</p>
				</CardContent>
			</Card>

			{/* ID Card Info */}
			<Card className="border-none bg-gradient-to-r from-primary/5 to-blue-500/5 shadow-sm">
				<CardContent className="p-4">
					<div className="flex items-center gap-2">
						<IdCard className="h-4 w-4 text-primary" />
						<span className="text-sm font-semibold">Student ID Card</span>
						<Badge variant="default" className="text-[10px]">{idCardInfo.status}</Badge>
					</div>
					<div className="mt-2 grid grid-cols-2 gap-2 text-xs">
						<div>
							<span className="text-muted-foreground">Card No: </span>
							<span className="font-mono font-semibold">{idCardInfo.cardNumber}</span>
						</div>
						<div>
							<span className="text-muted-foreground">Blood: </span>
							<span className="font-semibold">{idCardInfo.bloodGroup}</span>
						</div>
						<div>
							<span className="text-muted-foreground">Issued: </span>
							<span className="font-semibold">{idCardInfo.issueDate}</span>
						</div>
						<div>
							<span className="text-muted-foreground">Expires: </span>
							<span className="font-semibold">{idCardInfo.expiryDate}</span>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
