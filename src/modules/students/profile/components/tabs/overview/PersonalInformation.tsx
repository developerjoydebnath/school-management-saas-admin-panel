"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { User } from "lucide-react";
import { useTranslations } from "next-intl";

interface PersonalInformationProps {
	student: any;
}

export function PersonalInformation({ student }: PersonalInformationProps) {
	const t = useTranslations("StudentProfile");

	return (
		<Card className="gap-2">
			<CardHeader className="border-b pb-3">
				<CardTitle className="flex items-center gap-2 text-base font-semibold">
					<User className="text-muted-foreground h-4 w-4" />
					{t("personalDetails")}
				</CardTitle>
			</CardHeader>
			<CardContent className="grid grid-cols-1 gap-x-8 gap-y-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
				<div>
					<p className="text-muted-foreground text-xs">{t("dateOfBirth")}</p>
					<p className="text-sm font-medium">{student.dob || "—"}</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">{t("gender")}</p>
					<p className="text-sm font-medium capitalize">
						{student.gender || "—"}
					</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">{t("bloodGroup")}</p>
					<p className="text-sm font-medium">{student.bloodGroup || "—"}</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">{t("religion")}</p>
					<p className="text-sm font-medium capitalize">
						{student.religion || "—"}
					</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">Nationality</p>
					<p className="text-sm font-medium">
						{student.nationality || "Bangladeshi"}
					</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">Admission Type</p>
					<p className="text-sm font-medium capitalize">
						{student.admissionType || "—"}
					</p>
				</div>
				{student.presentAddress && (
					<div className="sm:col-span-2 lg:col-span-3">
						<p className="text-muted-foreground text-xs">
							{t("presentAddress")}
						</p>
						<p className="text-sm font-medium">{student.presentAddress}</p>
					</div>
				)}
				{student.permanentAddress && (
					<div className="sm:col-span-2 lg:col-span-3">
						<p className="text-muted-foreground text-xs">
							Permanent Address
						</p>
						<p className="text-sm font-medium">
							{student.permanentAddress}
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
