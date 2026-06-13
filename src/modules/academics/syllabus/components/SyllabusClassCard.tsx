"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import { PATHS } from "@/shared/configs/paths.config";
import { ArrowRight, BookOpen, Calendar, GraduationCap } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { SyllabusOverview } from "../dto/syllabus.dto";

interface SyllabusClassCardProps {
	syllabus: SyllabusOverview;
}

export default function SyllabusClassCard({ syllabus }: SyllabusClassCardProps) {
	const t = useTranslations("Syllabus");

	return (
		<Card className="group h-full">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="text-base font-bold">{syllabus.className}</CardTitle>
					<div className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors">
						<GraduationCap className="h-4.5 w-4.5" />
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center gap-2">
					<BookOpen className="text-muted-foreground h-4 w-4" />
					<span className="text-muted-foreground text-sm">{t("totalSubjects")}:</span>
					<span className="text-lg font-bold">{syllabus.totalSubjects}</span>
				</div>

				<div className="space-y-2">
					<p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
						{t("nextExam")}
					</p>
					<div className="flex items-center gap-2">
						<Calendar className="text-muted-foreground h-4 w-4" />
						<span className="text-sm font-medium">{syllabus.nextExam}</span>
					</div>
				</div>

				<div className="space-y-2 pt-2">
					<div className="flex items-center justify-between text-xs font-semibold uppercase">
						<span className="text-muted-foreground tracking-wider">{t("progress")}</span>
						<span>{syllabus.progress}%</span>
					</div>
					<Progress value={syllabus.progress} className="h-1.5" />
				</div>

				<Link href={PATHS.ACADEMICS.SYLLABUS.DETAILS(syllabus.classId)} passHref>
					<Button
						variant="ghost"
						size="sm"
						className="group-hover:bg-primary/10 group-hover:text-primary mt-2 w-full gap-2 text-xs font-semibold transition-all"
					>
						{t("viewSyllabus")}
						<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
					</Button>
				</Link>
			</CardContent>
		</Card>
	);
}

