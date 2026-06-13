"use client";

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

interface CertificatesStudentListProps {
	students: any[];
	selectedStudentIds: string[];
	onSelect: (id: string, checked: boolean) => void;
	onSelectAll: (checked: boolean) => void;
	onPreviewSelect: (student: any) => void;
	activePreviewId?: string;
}

export default function CertificatesStudentList({
	students,
	selectedStudentIds,
	onSelect,
	onSelectAll,
	onPreviewSelect,
	activePreviewId,
}: CertificatesStudentListProps) {
	const t = useTranslations("StudentCertificates");
	const [search, setSearch] = useState("");

	const filteredStudents = students.filter(
		(s) =>
			s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
			s.studentId?.toLowerCase().includes(search.toLowerCase())
	);

	const allSelected = filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length;
	const someSelected = selectedStudentIds.length > 0 && selectedStudentIds.length < filteredStudents.length;

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
								<Checkbox
									checked={(allSelected ? true : someSelected ? "indeterminate" : false) as any}
									onCheckedChange={(checked) => onSelectAll(!!checked)}
									aria-label={t("list.selectAll")}
								/>
							</TableHead>
							<TableHead>{t("list.id")}</TableHead>
							<TableHead>{t("list.name")}</TableHead>
							<TableHead>{t("list.class")}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredStudents.map((student) => {
							const isSelected = selectedStudentIds.includes(student.id);
							const isActive = activePreviewId === student.id;

							return (
								<TableRow 
									key={student.id}
									className={`cursor-pointer transition-colors ${isActive ? 'bg-primary/5' : ''}`}
									onClick={() => onPreviewSelect(student)}
								>
									<TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
										<Checkbox
											checked={isSelected}
											onCheckedChange={(checked) => onSelect(student.id, !!checked)}
										/>
									</TableCell>
									<TableCell className="font-mono text-sm">{student.studentId}</TableCell>
									<TableCell>
										<div>
											<p className="font-medium">{student.fullName}</p>
											<p className="text-xs text-muted-foreground">Roll: {student.roll}</p>
										</div>
									</TableCell>
									<TableCell>{student.class} {student.section ? `(${student.section})` : ''}</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
