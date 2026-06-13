"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { PATHS } from "@/shared/configs/paths.config";
import { ArrowRight, GraduationCap } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { SyllabusOverview } from "../dto/syllabus.dto";

interface SyllabusClassListProps {
	syllabusList: SyllabusOverview[];
}

export default function SyllabusClassList({ syllabusList }: SyllabusClassListProps) {
	const t = useTranslations("Syllabus");

	return (
		<Card className="border-none shadow-sm">
			<CardContent className="pt-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="font-semibold">Class</TableHead>
							<TableHead className="text-center font-semibold">
								{t("totalSubjects")}
							</TableHead>
							<TableHead className="font-semibold">{t("nextExam")}</TableHead>
							<TableHead className="font-semibold w-48">{t("progress")}</TableHead>
							<TableHead className="text-right font-semibold">
								Action
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{syllabusList.map((syllabus) => (
							<TableRow key={syllabus.id} className="group">
								<TableCell>
									<div className="flex items-center gap-3">
										<div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
											<GraduationCap className="h-4 w-4" />
										</div>
										<span className="font-semibold">
											{syllabus.className}
										</span>
									</div>
								</TableCell>
								<TableCell className="text-center font-mono text-lg font-bold">
									{syllabus.totalSubjects}
								</TableCell>
								<TableCell>
									<span className="text-muted-foreground text-sm font-medium">
										{syllabus.nextExam}
									</span>
								</TableCell>
								<TableCell>
									<div className="flex flex-col gap-1.5">
										<div className="flex items-center justify-between text-xs font-semibold">
											<span className="text-muted-foreground uppercase">{t("progress")}</span>
											<span>{syllabus.progress}%</span>
										</div>
										<Progress value={syllabus.progress} className="h-1.5" />
									</div>
								</TableCell>
								<TableCell className="text-right">
									<Link
										href={PATHS.ACADEMICS.SYLLABUS.DETAILS(syllabus.classId)}
									>
										<Button
											variant="ghost"
											size="sm"
											className="hover:text-primary gap-1 text-xs font-semibold"
										>
											{t("viewSyllabus")}
											<ArrowRight className="h-3 w-3" />
										</Button>
									</Link>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

