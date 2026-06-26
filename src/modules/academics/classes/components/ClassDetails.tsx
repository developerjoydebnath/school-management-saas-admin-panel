"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { ClassModel } from "@/shared/models/class.model";
import { StatusEnum } from "@/shared/types/enums";
import { getLocalizedName } from "@/shared/utils/localization";
import { useTranslations } from "next-intl";

type Props = {
	cls: ClassModel;
};

const formatValue = (value?: string | number | null) => value ?? "N/A";

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
	return (
		<div>
			<div className="text-muted-foreground text-sm">{label}</div>
			<div className="mt-0.5 font-medium">{value ?? "N/A"}</div>
		</div>
	);
}

export function ClassDetails({ cls }: Props) {
	const t = useTranslations("Classes");
	const hasSections = (cls.sections?.length ?? 0) > 0;

	return (
		<div className="grid gap-6">
			{/* ── Basic Info Card (always shown) ── */}
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("sectionBasicTitle")}</CardTitle>
					<CardDescription>{t("sectionBasicDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-3">
					<InfoRow label="Class Name" value={getLocalizedName(cls.name, "en") || "N/A"} />
					<InfoRow
						label="Status"
						value={
							<Badge variant={cls.status === StatusEnum.ACTIVE ? "default" : "secondary"}>
								{cls.status === StatusEnum.ACTIVE ? "Active" : "Inactive"}
							</Badge>
						}
					/>
					{hasSections && (
						<InfoRow
							label="Sections"
							value={
								<div className="flex flex-wrap gap-1 mt-1">
									{cls.sections.map((section: any) => (
										<Badge key={section.id ?? section.name} variant="outline">
											{section.name}
										</Badge>
									))}
								</div>
							}
						/>
					)}
				</CardContent>
			</Card>

			{/* ── No sections: show default room & shift ── */}
			{!hasSections && (
				<Card className="shadow-none ring-0">
					<CardHeader>
						<CardTitle>Room &amp; Shift</CardTitle>
						<CardDescription>Default classroom and shift assigned to this class.</CardDescription>
					</CardHeader>
					<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-3">
						<InfoRow label="Class Room" value={cls.classRoom?.name || cls.classRoom?.roomNo || "N/A"} />
						<InfoRow label="Room No" value={cls.classRoom?.roomNo || "N/A"} />
						<InfoRow label="Capacity" value={formatValue(cls.classRoom?.capacity)} />
						<InfoRow label="Building" value={cls.classRoom?.building || "N/A"} />
						<InfoRow label="Floor" value={cls.classRoom?.floor || "N/A"} />
						<InfoRow label="Shift" value={cls.shift || "N/A"} />
					</CardContent>
				</Card>
			)}

			{/* ── Has sections: one card per section ── */}
			{hasSections &&
				cls.sections.map((section: any) => {
					const shiftName = section.shift?.name || (typeof section.shift === "string" ? section.shift : null);
					const room = section.classRoom;

					return (
						<Card key={section.id ?? section.name} className="shadow-none ring-0">
							<CardHeader>
								<CardTitle>{t("sectionCardTitle", { name: section.name })}</CardTitle>
								<CardDescription>
									{t("sectionCardDescription", { name: section.name })}
								</CardDescription>
							</CardHeader>
							<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-3">
								<InfoRow label="Section Name" value={section.name} />
								<InfoRow label="Class Room" value={room?.name || room?.roomNo || "N/A"} />
								<InfoRow label="Room No" value={room?.roomNo || "N/A"} />
								<InfoRow label="Capacity" value={formatValue(room?.capacity)} />
								<InfoRow label="Building" value={room?.building || "N/A"} />
								<InfoRow label="Floor" value={room?.floor || "N/A"} />
								<InfoRow label="Shift" value={shiftName || "N/A"} />
							</CardContent>
						</Card>
					);
				})}
		</div>
	);
}
