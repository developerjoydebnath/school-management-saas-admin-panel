"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { getLocalizedName } from "@/shared/utils/localization";
import { Eye, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

interface Student {
	id: string;
	studentId: string;
	fullName: string;
	class: string;
	section: string;
	roll: string;
	mobile: string;
	fatherName: string;
	status?: string;
	photo?: string;
}

interface StudentSearchResultsProps {
	results: Student[];
	classes: any[];
	isLoading: boolean;
	hasSearched: boolean;
}

export default function StudentSearchResults({
	results,
	classes,
	isLoading,
	hasSearched,
}: StudentSearchResultsProps) {
	const t = useTranslations("StudentProfileSearch");
	const tCommon = useTranslations("Common");
	const locale = useLocale();

	const getClassLabel = (classId: string) => {
		const classItem = classes.find((c) => c.id === classId);
		return classItem ? getLocalizedName(classItem.name, locale) : classId;
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-8 w-32" />
				<div className="bg-card rounded-md border">
					<div className="space-y-2 p-4">
						{Array.from({ length: 5 }).map((_, i) => (
							<Skeleton key={i} className="h-12 w-full" />
						))}
					</div>
				</div>
			</div>
		);
	}

	if (hasSearched && results.length === 0) {
		return (
			<div className="bg-card flex flex-col items-center justify-center gap-2 rounded-lg border p-12 text-center">
				<div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
					<User className="text-muted-foreground h-6 w-6" />
				</div>
				<p className="text-muted-foreground">{t("noResults")}</p>
			</div>
		);
	}

	if (!hasSearched) {
		return null;
	}

	return (
		<div className="animate-in fade-in slide-in-from-bottom-2 space-y-4 duration-500">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold">{t("results")}</h2>
				<Badge variant="secondary" className="font-medium">
					{results.length} {t("resultsFound") || "Students Found"}
				</Badge>
			</div>
			<div className="bg-card rounded-md border">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/50">
							<TableHead className="w-[120px] pl-4">{t("table.studentId")}</TableHead>
							<TableHead>{t("table.name")}</TableHead>
							<TableHead>{t("table.roll")}</TableHead>
							<TableHead>{t("table.class")}</TableHead>
							<TableHead>{t("table.section")}</TableHead>
							<TableHead>{t("table.mobile")}</TableHead>
							<TableHead>{t("table.guardianMobile")}</TableHead>
							<TableHead className="pr-4 text-right">{t("table.actions")}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{results.map((student) => (
							<TableRow
								key={student.id}
								className="hover:bg-muted/50 transition-colors"
							>
								<TableCell className="pl-4 font-mono text-sm font-medium">
									{student.studentId}
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-3">
										<Avatar className="h-8 w-8 border">
											<AvatarImage
												src={student.photo}
												alt={student.fullName}
											/>
											<AvatarFallback className="bg-primary/5 text-primary text-xs">
												{student.fullName.substring(0, 2).toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<span className="font-medium">{student.fullName}</span>
									</div>
								</TableCell>
								<TableCell>{student.roll}</TableCell>
								<TableCell>
									<Badge variant="outline" className="font-normal">
										{getClassLabel(student.class)}
									</Badge>
								</TableCell>
								<TableCell>{student.section}</TableCell>
								<TableCell className="text-muted-foreground text-sm">
									{student.mobile}
								</TableCell>
								<TableCell className="text-muted-foreground text-sm">
									{(student as any).emergencyContact ||
										(student as any).fatherPhone ||
										"-"}
								</TableCell>
								<TableCell className="pr-4 text-right">
									<Link
										href={`/students/directory/${student.class}/${student.id}`}
									>
										<Button
											variant="ghost"
											size="sm"
											className="hover:bg-primary/10 hover:text-primary gap-2"
										>
											<Eye className="h-4 w-4" />
											{t("table.viewProfile")}
										</Button>
									</Link>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
