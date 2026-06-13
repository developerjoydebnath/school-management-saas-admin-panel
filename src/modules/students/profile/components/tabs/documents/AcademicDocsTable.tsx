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
import { Download, Eye, FileSpreadsheet } from "lucide-react";

const academicDocuments = [
	{ name: "1st Term Report Card", type: "PDF", size: "450 KB", date: "Sep 15, 2025", status: "Available", gpa: "3.72" },
	{ name: "2nd Term Report Card", type: "PDF", size: "480 KB", date: "Dec 20, 2025", status: "Available", gpa: "3.78" },
	{ name: "Midterm Report Card", type: "PDF", size: "510 KB", date: "Feb 28, 2026", status: "Available", gpa: "3.80" },
	{ name: "Final Report Card", type: "PDF", size: "—", date: "—", status: "Pending", gpa: "—" },
	{ name: "Annual Progress Report", type: "PDF", size: "—", date: "—", status: "Pending", gpa: "—" },
];

const getStatusColor = (status: string) => {
	switch (status) {
		case "Available": return "default";
		case "Pending": return "secondary";
		default: return "outline";
	}
};

export function AcademicDocsTable() {
	return (
		<Card className="border-none shadow-sm">
			<CardHeader className="border-b pb-3">
				<CardTitle className="text-base font-semibold">Academic Reports & Results</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="font-semibold">Report</TableHead>
							<TableHead className="font-semibold">Type</TableHead>
							<TableHead className="font-semibold">Size</TableHead>
							<TableHead className="font-semibold">Date</TableHead>
							<TableHead className="text-center font-semibold">GPA</TableHead>
							<TableHead className="text-center font-semibold">Status</TableHead>
							<TableHead className="text-center font-semibold">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{academicDocuments.map((doc) => (
							<TableRow key={doc.name}>
								<TableCell>
									<div className="flex items-center gap-2">
										<FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium">{doc.name}</span>
									</div>
								</TableCell>
								<TableCell><Badge variant="outline" className="font-mono text-xs">{doc.type}</Badge></TableCell>
								<TableCell className="text-sm text-muted-foreground">{doc.size}</TableCell>
								<TableCell className="text-sm text-muted-foreground">{doc.date}</TableCell>
								<TableCell className="text-center font-mono font-semibold">{doc.gpa}</TableCell>
								<TableCell className="text-center">
									<Badge variant={getStatusColor(doc.status) as any} className="text-xs">{doc.status}</Badge>
								</TableCell>
								<TableCell className="text-center">
									{doc.status === "Available" && (
										<div className="flex items-center justify-center gap-1">
											<Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-3.5 w-3.5" /></Button>
											<Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-3.5 w-3.5" /></Button>
										</div>
									)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
