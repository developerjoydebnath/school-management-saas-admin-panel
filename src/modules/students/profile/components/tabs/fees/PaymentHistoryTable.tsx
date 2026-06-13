"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { Download, Receipt } from "lucide-react";

const paymentHistory = [
	{ id: "TXN-001", date: "Jul 10, 2025", head: "Tuition Fee (Jul)", amount: 3000, method: "bKash", status: "Paid", receipt: "REC-001" },
	{ id: "TXN-002", date: "Aug 05, 2025", head: "Tuition Fee (Aug)", amount: 3000, method: "Cash", status: "Paid", receipt: "REC-002" },
	{ id: "TXN-003", date: "Sep 12, 2025", head: "Tuition Fee (Sep)", amount: 3000, method: "Bank Transfer", status: "Paid", receipt: "REC-003" },
	{ id: "TXN-004", date: "Oct 08, 2025", head: "Tuition + Exam", amount: 2500, method: "Nagad", status: "Partial", receipt: "REC-004" },
	{ id: "TXN-005", date: "Nov 10, 2025", head: "Tuition Fee (Nov)", amount: 3000, method: "bKash", status: "Paid", receipt: "REC-005" },
	{ id: "TXN-006", date: "Dec 03, 2025", head: "Lab + Library", amount: 1000, method: "Cash", status: "Partial", receipt: "REC-006" },
	{ id: "TXN-007", date: "Jan 15, 2026", head: "Tuition Fee (Jan)", amount: 3000, method: "Bank Transfer", status: "Paid", receipt: "REC-007" },
];

export function PaymentHistoryTable() {
	return (
		<Card className="border-none shadow-sm">
			<CardHeader className="border-b pb-3">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<Receipt className="h-4 w-4 text-muted-foreground" />
					Payment History
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="font-semibold">Transaction</TableHead>
							<TableHead className="font-semibold">Date</TableHead>
							<TableHead className="font-semibold">Fee Head</TableHead>
							<TableHead className="text-right font-semibold">Amount</TableHead>
							<TableHead className="font-semibold">Method</TableHead>
							<TableHead className="text-center font-semibold">Status</TableHead>
							<TableHead className="text-center font-semibold">Receipt</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{paymentHistory.map((tx) => (
							<TableRow key={tx.id}>
								<TableCell className="font-mono text-xs text-muted-foreground">{tx.id}</TableCell>
								<TableCell>{tx.date}</TableCell>
								<TableCell>{tx.head}</TableCell>
								<TableCell className="text-right font-mono font-semibold">৳{tx.amount.toLocaleString()}</TableCell>
								<TableCell><Badge variant="outline" className="text-xs">{tx.method}</Badge></TableCell>
								<TableCell className="text-center">
									<Badge variant={tx.status === "Paid" ? "default" : "secondary"} className="text-xs">{tx.status}</Badge>
								</TableCell>
								<TableCell className="text-center">
									<Button variant="ghost" size="icon" className="h-8 w-8">
										<Download className="h-3.5 w-3.5" />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
