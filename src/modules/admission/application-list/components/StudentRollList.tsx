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
import { useSWR } from "@/shared/hooks/use-swr";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";

interface StudentRollListProps {
	classId?: string;
	sessionId?: string;
	section?: string;
	onSuggestedRoll?: (roll: string) => void;
}

export default function StudentRollList({
	classId,
	sessionId,
	section,
	onSuggestedRoll,
}: StudentRollListProps) {
	const t = useTranslations("Applications");
	const query = useMemo(
		() => ({
			classId,
			sessionId,
			sectionId: section || undefined,
		}),
		[classId, sessionId, section]
	);
	const { data: response, isLoading } = useSWR(
		"/admissions/rolls",
		query,
		{ revalidateOnMount: true }
	);
	const students = Array.isArray(response?.data) ? response.data : [];

	useEffect(() => {
		if (isLoading) return;
		if (!Array.isArray(students) || !onSuggestedRoll) return;
		const maxRoll = students.reduce((max, student: any) => {
			const roll = Number.parseInt(String(student.rollNumber || "0"), 10);
			return Number.isFinite(roll) ? Math.max(max, roll) : max;
		}, 0);
		onSuggestedRoll(String(maxRoll + 1).padStart(3, "0"));
	}, [isLoading, students, onSuggestedRoll]);

	if (isLoading) {
		return (
			<div className="bg-muted/30 flex min-h-40 items-center justify-center rounded-md border">
				<Spinner className="h-6 w-6" />
			</div>
		);
	}

	return (
		<ScrollArea className="max-h-[420px] w-full overflow-auto rounded-md border">
			<Table className="min-w-[560px]">
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
								<TableCell className="whitespace-nowrap text-xs">
									{s.studentIdNo || "-"}
								</TableCell>
								<TableCell className="whitespace-nowrap font-bold">
									{s.rollNumber || "-"}
								</TableCell>
								<TableCell className="min-w-48">{s.fullNameEn || "-"}</TableCell>
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
