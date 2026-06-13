"use client";

import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Spinner } from "@/shared/components/ui/spinner";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { useTableData } from "@/shared/hooks/use-table-data";
import { useTranslations } from "next-intl";

interface StudentRollListProps {
	classId?: string;
	sessionId?: string;
	section?: string;
}

export default function StudentRollList({ classId, sessionId, section }: StudentRollListProps) {
	const t = useTranslations("Applications");
	const { data: students, isLoading } = useTableData(
		"/students",
		{ class: classId, session: sessionId, section: section },
		{ revalidateOnMount: true }
	);

	if (isLoading) {
		return (
			<div className="flex h-32 items-center justify-center">
				<Spinner className="h-6 w-6" />
			</div>
		);
	}

	return (
		<ScrollArea className="max-h-[400px] overflow-y-auto px-2">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>{t("studentId")}</TableHead>
						<TableHead>{t("roll")}</TableHead>
						<TableHead>{t("studentName")}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.isArray(students) && students.length > 0 ? (
						students.map((s: any) => (
							<TableRow key={s.id}>
								<TableCell className="text-xs">{s.studentId}</TableCell>
								<TableCell className="font-bold">{s.roll}</TableCell>
								<TableCell>{s.fullName}</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={3}
								className="text-muted-foreground py-4 text-center"
							>
								No students found
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</ScrollArea>
	);
}
