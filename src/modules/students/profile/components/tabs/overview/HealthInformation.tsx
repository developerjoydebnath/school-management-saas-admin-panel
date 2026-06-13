"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";

interface HealthInformationProps {
	student: any;
}

export function HealthInformation({ student }: HealthInformationProps) {
	const t = useTranslations("StudentProfile");

	return (
		<Card className="gap-2">
			<CardHeader className="border-b pb-3">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<Heart className="text-muted-foreground h-4 w-4" />
					Health Information
				</CardTitle>
			</CardHeader>
			<CardContent className="grid grid-cols-1 gap-x-8 gap-y-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
				<div>
					<p className="text-muted-foreground text-xs">{t("bloodGroup")}</p>
					<p className="text-sm font-medium">{student.bloodGroup || "—"}</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">Allergies</p>
					<p className="text-sm font-medium">
						{student.allergies || "None reported"}
					</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">Medical Conditions</p>
					<p className="text-sm font-medium">
						{student.conditions || "None reported"}
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
