"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { AlertCircle } from "lucide-react";

const dueInvoices = [
	{ invoice: "INV-012", head: "Tuition Fee (Feb)", amount: 3000, dueDate: "Feb 28, 2026", daysOverdue: 74, fine: 200 },
	{ invoice: "INV-010", head: "Exam Fee (Dec)", amount: 2000, dueDate: "Dec 31, 2025", daysOverdue: 135, fine: 100 },
	{ invoice: "INV-008", head: "Transport Fee (Oct)", amount: 500, dueDate: "Oct 31, 2025", daysOverdue: 196, fine: 50 },
];

export function OutstandingDuesTable() {
	return (
		<Card className="border-none shadow-sm">
			<CardHeader className="border-b pb-3">
				<CardTitle className="flex items-center gap-2 text-base font-semibold text-red-600">
					<AlertCircle className="h-4 w-4" />
					Outstanding Dues
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="font-semibold">Invoice</TableHead>
							<TableHead className="font-semibold">Fee Head</TableHead>
							<TableHead className="text-right font-semibold">Amount</TableHead>
							<TableHead className="text-right font-semibold">Fine</TableHead>
							<TableHead className="font-semibold">Due Date</TableHead>
							<TableHead className="text-center font-semibold">Overdue</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{dueInvoices.map((inv) => (
							<TableRow key={inv.invoice}>
								<TableCell className="font-mono text-xs">{inv.invoice}</TableCell>
								<TableCell>{inv.head}</TableCell>
								<TableCell className="text-right font-mono font-semibold text-red-600">৳{inv.amount.toLocaleString()}</TableCell>
								<TableCell className="text-right font-mono text-yellow-600">৳{inv.fine}</TableCell>
								<TableCell className="text-muted-foreground">{inv.dueDate}</TableCell>
								<TableCell className="text-center">
									<Badge variant="destructive" className="text-xs">{inv.daysOverdue} days</Badge>
								</TableCell>
							</TableRow>
						))}
						<TableRow className="bg-muted/30 font-semibold">
							<TableCell colSpan={2} className="text-right">Total Outstanding</TableCell>
							<TableCell className="text-right font-mono text-red-600">
								৳{dueInvoices.reduce((a, b) => a + b.amount, 0).toLocaleString()}
							</TableCell>
							<TableCell className="text-right font-mono text-yellow-600">
								৳{dueInvoices.reduce((a, b) => a + b.fine, 0)}
							</TableCell>
							<TableCell colSpan={2} />
						</TableRow>
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
