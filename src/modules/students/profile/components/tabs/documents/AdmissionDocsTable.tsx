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
import { Download, Eye, FileCheck2, FileImage, FileSpreadsheet, FileText, Shield, Upload } from "lucide-react";

const admissionDocuments = [
	{ name: "Birth Certificate", type: "PDF", size: "1.2 MB", uploadDate: "May 10, 2026", status: "Verified", icon: FileText, expiry: "—" },
	{ name: "Transfer Certificate", type: "PDF", size: "890 KB", uploadDate: "May 10, 2026", status: "Verified", icon: FileCheck2, expiry: "—" },
	{ name: "Previous Marksheet", type: "PDF", size: "2.1 MB", uploadDate: "May 10, 2026", status: "Verified", icon: FileSpreadsheet, expiry: "—" },
	{ name: "Student Photo (Passport)", type: "JPEG", size: "340 KB", uploadDate: "May 10, 2026", status: "Verified", icon: FileImage, expiry: "Dec 2026" },
	{ name: "Father's NID", type: "PDF", size: "1.5 MB", uploadDate: "May 10, 2026", status: "Pending", icon: Shield, expiry: "—" },
	{ name: "Mother's NID", type: "PDF", size: "—", uploadDate: "—", status: "Missing", icon: Shield, expiry: "—" },
	{ name: "Guardianship Proof", type: "PDF", size: "—", uploadDate: "—", status: "Not Required", icon: Shield, expiry: "—" },
];

const getStatusColor = (status: string) => {
	switch (status) {
		case "Verified": return "default";
		case "Pending": return "secondary";
		case "Missing": return "destructive";
		default: return "outline";
	}
};

export function AdmissionDocsTable() {
	return (
		<Card className="border-none shadow-sm">
			<CardHeader className="border-b pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base font-semibold">Admission Documents</CardTitle>
					<Button variant="outline" size="sm" className="gap-1.5 text-xs">
						<Upload className="h-3.5 w-3.5" />
						Upload
					</Button>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="font-semibold">Document</TableHead>
							<TableHead className="font-semibold">Type</TableHead>
							<TableHead className="font-semibold">Size</TableHead>
							<TableHead className="font-semibold">Upload Date</TableHead>
							<TableHead className="font-semibold">Expiry</TableHead>
							<TableHead className="text-center font-semibold">Status</TableHead>
							<TableHead className="text-center font-semibold">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{admissionDocuments.map((doc) => (
							<TableRow key={doc.name}>
								<TableCell>
									<div className="flex items-center gap-2">
										<doc.icon className="h-4 w-4 text-muted-foreground" />
										<span className="font-medium">{doc.name}</span>
									</div>
								</TableCell>
								<TableCell>
									<Badge variant="outline" className="font-mono text-xs">{doc.type}</Badge>
								</TableCell>
								<TableCell className="text-sm text-muted-foreground">{doc.size}</TableCell>
								<TableCell className="text-sm text-muted-foreground">{doc.uploadDate}</TableCell>
								<TableCell className="text-sm text-muted-foreground">{doc.expiry}</TableCell>
								<TableCell className="text-center">
									<Badge variant={getStatusColor(doc.status) as any} className="text-xs">
										{doc.status}
									</Badge>
								</TableCell>
								<TableCell className="text-center">
									{doc.status !== "Missing" && doc.status !== "Not Required" && (
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
