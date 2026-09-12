"use client";

import { Card } from "@/shared/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { emptyPromotionRow, PromotionRowState } from "../dto/student-promotion.dto";
import PromotionTableRow from "./PromotionTableRow";

interface PromotionTableProps {
	students: any[];
	rows: Record<string, PromotionRowState>;
	toSessionId: string;
	onRowChange: (studentId: string, patch: Partial<PromotionRowState>) => void;
}

export default function PromotionTable({
	students,
	rows,
	toSessionId,
	onRowChange,
}: PromotionTableProps) {
	const t = useTranslations("StudentPromotion");

	if (!students || students.length === 0) {
		return (
			<Card className="flex flex-col items-center justify-center border-dashed p-12 text-center">
				<div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
					<AlertCircle className="text-muted-foreground h-8 w-8" />
				</div>
				<h3 className="text-lg font-semibold">{t("table.noStudents")}</h3>
			</Card>
		);
	}

	return (
		<div className="rounded-md border bg-card">
			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/50">
							<TableHead className="w-10 text-center">#</TableHead>
							<TableHead>{t("table.studentInfo")}</TableHead>
							<TableHead>{t("table.currentInfo")}</TableHead>
							<TableHead className="w-32">{t("table.status")}</TableHead>
							<TableHead className="w-56">{t("table.nextClass")}</TableHead>
							<TableHead className="w-24">{t("table.nextRoll")}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{students.map((student, index) => (
							<PromotionTableRow
								key={student.id}
								index={index}
								student={student}
								row={rows[student.id] || emptyPromotionRow()}
								toSessionId={toSessionId}
								onChange={(patch) => onRowChange(student.id, patch)}
							/>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
