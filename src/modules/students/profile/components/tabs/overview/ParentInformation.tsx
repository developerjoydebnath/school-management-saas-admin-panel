"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Shield } from "lucide-react";
import { useTranslations } from "next-intl";

interface ParentInformationProps {
	student: any;
}

export function ParentInformation({ student }: ParentInformationProps) {
	const t = useTranslations("StudentProfile");

	return (
		<Card className="gap-2">
			<CardHeader className="border-b pb-3">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<Shield className="text-muted-foreground h-4 w-4" />
					{t("parentDetails")}
				</CardTitle>
			</CardHeader>
			<CardContent className="grid grid-cols-1 gap-x-8 gap-y-3 pt-4 sm:grid-cols-2">
				<div>
					<p className="text-muted-foreground text-xs">{t("fatherName")}</p>
					<p className="text-sm font-medium">{student.fatherName || "—"}</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">Father&apos;s NID</p>
					<p className="text-sm font-medium">{student.fatherNid || "—"}</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">{t("motherName")}</p>
					<p className="text-sm font-medium">{student.motherName || "—"}</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">Mother&apos;s NID</p>
					<p className="text-sm font-medium">{student.motherNid || "—"}</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">{t("fatherPhone")}</p>
					<p className="text-sm font-medium">{student.mobile || "—"}</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">Emergency Contact</p>
					<p className="text-sm font-medium">
						{student.emergencyContact || "—"}
					</p>
				</div>
				{student.guardianDetails && (
					<div className="sm:col-span-2">
						<p className="text-muted-foreground text-xs">
							Guardian Details
						</p>
						<p className="text-sm font-medium">{student.guardianDetails}</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
