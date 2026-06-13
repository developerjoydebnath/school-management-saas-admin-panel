"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Award, BookOpen, Calendar, CreditCard, GraduationCap, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

export function QuickStats() {
	const t = useTranslations("StudentProfile");

	return (
		<div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
			<Card className="bg-primary/5 py-4">
				<CardContent className="flex flex-col items-center justify-center p-4 text-center">
					<div className="bg-primary/10 text-primary mb-2 rounded-full p-2">
						<Calendar className="h-4 w-4" />
					</div>
					<p className="text-muted-foreground text-xs">{t("attendanceStat")}</p>
					<h3 className="text-lg font-bold">87%</h3>
				</CardContent>
			</Card>
			<Card className="bg-green-500/5 py-4">
				<CardContent className="flex flex-col items-center justify-center p-4 text-center">
					<div className="mb-2 rounded-full bg-green-500/10 p-2 text-green-600">
						<Award className="h-4 w-4" />
					</div>
					<p className="text-muted-foreground text-xs">{t("averageGrade")}</p>
					<h3 className="text-lg font-bold text-green-700">A</h3>
				</CardContent>
			</Card>
			<Card className="bg-orange-500/5 py-4">
				<CardContent className="flex flex-col items-center justify-center p-4 text-center">
					<div className="mb-2 rounded-full bg-orange-500/10 p-2 text-orange-600">
						<CreditCard className="h-4 w-4" />
					</div>
					<p className="text-muted-foreground text-xs">{t("totalDues")}</p>
					<h3 className="text-lg font-bold text-orange-700">৳5,500</h3>
				</CardContent>
			</Card>
			<Card className="bg-blue-500/5 py-4">
				<CardContent className="flex flex-col items-center justify-center p-4 text-center">
					<div className="mb-2 rounded-full bg-blue-500/10 p-2 text-blue-600">
						<BookOpen className="h-4 w-4" />
					</div>
					<p className="text-muted-foreground text-xs">{t("assignments")}</p>
					<h3 className="text-lg font-bold text-blue-700">42/50</h3>
				</CardContent>
			</Card>
			<Card className="bg-purple-500/5 py-4">
				<CardContent className="flex flex-col items-center justify-center p-4 text-center">
					<div className="mb-2 rounded-full bg-purple-500/10 p-2 text-purple-600">
						<TrendingUp className="h-4 w-4" />
					</div>
					<p className="text-muted-foreground text-xs">Class Rank</p>
					<h3 className="text-lg font-bold text-purple-700">2nd</h3>
				</CardContent>
			</Card>
			<Card className="bg-pink-500/5 py-4">
				<CardContent className="flex flex-col items-center justify-center p-4 text-center">
					<div className="mb-2 rounded-full bg-pink-500/10 p-2 text-pink-600">
						<GraduationCap className="h-4 w-4" />
					</div>
					<p className="text-muted-foreground text-xs">GPA</p>
					<h3 className="text-lg font-bold text-pink-700">3.85</h3>
				</CardContent>
			</Card>
		</div>
	);
}
