"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Search } from "lucide-react";
import type { CertificateTemplate } from "./CertificatesPreview";

interface CertificatesStudentListProps {
	students: any[];
	selectedStudentIds: string[];
	onSelect: (id: string, checked: boolean) => void;
	onSelectAll: (checked: boolean) => void;
	onPreviewSelect: (student: any) => void;
	onQuickSelect: (student: any) => void;
	activePreviewId?: string;
	templateType: CertificateTemplate;
}

export default function CertificatesStudentList({
	students,
	selectedStudentIds,
	onSelect,
	onSelectAll,
	onPreviewSelect,
	onQuickSelect,
	activePreviewId,
	templateType,
}: CertificatesStudentListProps) {
	const t = useTranslations("StudentCertificates");
	const [search, setSearch] = useState("");

	const filteredStudents = students.filter(
		(s) =>
			s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
			s.studentId?.toLowerCase().includes(search.toLowerCase())
	);

	const selectableStudents = filteredStudents.filter((s) => s.status !== "transferred");
	const allSelected =
		selectableStudents.length > 0 && selectedStudentIds.length === selectableStudents.length;
	const someSelected =
		selectedStudentIds.length > 0 && selectedStudentIds.length < selectableStudents.length;

	// The transfer certificate is generated one student at a time, so a single
	// "Select" action replaces bulk checkboxes for that template only.
	const isSingleSelectFlow = templateType === "transfer-certificate";

	if (students.length === 0) {
		return (
			<div className="flex h-40 items-center justify-center rounded-md border border-dashed text-muted-foreground">
				{t("list.noStudents")}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">{t("list.title")}</h3>
				<div className="relative w-64">
					<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder={t("list.searchPlaceholder")}
						className="pl-8"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>
			</div>

			<div className="rounded-md border bg-card">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12 text-center">
								{!isSingleSelectFlow && (
									<Checkbox
										checked={(allSelected ? true : someSelected ? "indeterminate" : false) as any}
										onCheckedChange={(checked) => onSelectAll(!!checked)}
										aria-label={t("list.selectAll")}
									/>
								)}
							</TableHead>
							<TableHead>{t("list.id")}</TableHead>
							<TableHead>{t("list.name")}</TableHead>
							<TableHead>{t("list.class")}</TableHead>
							<TableHead>{t("list.status")}</TableHead>
							{isSingleSelectFlow && <TableHead className="text-right">{t("list.select")}</TableHead>}
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredStudents.map((student) => {
							const isSelected = selectedStudentIds.includes(student.id);
							const isActive = activePreviewId === student.id;
							const isTransferred = student.status === "transferred";

							return (
								<TableRow
									key={student.id}
									className={`cursor-pointer transition-colors ${isActive ? "bg-primary/5" : ""}`}
									onClick={() => onPreviewSelect(student)}
								>
									<TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
										{!isSingleSelectFlow && (
											<Checkbox
												checked={isSelected}
												disabled={isTransferred}
												onCheckedChange={(checked) => onSelect(student.id, !!checked)}
											/>
										)}
									</TableCell>
									<TableCell className="font-mono text-sm">{student.studentId}</TableCell>
									<TableCell>
										<div>
											<p className="font-medium">{student.fullName}</p>
											<p className="text-xs text-muted-foreground">Roll: {student.roll}</p>
										</div>
									</TableCell>
									<TableCell>
										{student.className} {student.sectionName ? `(${student.sectionName})` : ""}
									</TableCell>
									<TableCell>
										{isTransferred ? (
											<Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
												{t("list.transferred")}
											</Badge>
										) : (
											<Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
												{t("list.active")}
											</Badge>
										)}
									</TableCell>
									{isSingleSelectFlow && (
										<TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
											<Button
												size="sm"
												variant={isSelected ? "default" : "outline"}
												disabled={isTransferred}
												onClick={() => onQuickSelect(student)}
											>
												{isSelected ? t("list.selected") : t("list.select")}
											</Button>
										</TableCell>
									)}
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
