"use client";

import { ProgressiveImage } from "@/shared/components/media/ProgressiveImage";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
	BadgeCheck,
	Edit,
	GraduationCap,
	Hash,
	Mail,
	Phone,
	Printer,
	Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface StudentProfileHeaderProps {
	student: any;
	classId: string;
}

const STATUS_STYLES: Record<string, string> = {
	ACTIVE: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
	INACTIVE: "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30",
	SUSPENDED: "bg-red-500/15 text-red-300 ring-1 ring-red-500/30",
	TRANSFERRED: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30",
	GRADUATED: "bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/30",
	LEFT: "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/30",
	DROPPED: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30",
};

function formatStatus(status: unknown) {
	return String(status || "ACTIVE")
		.toLowerCase()
		.split("_")
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

function InfoItem({
	icon: Icon,
	children,
}: {
	icon: React.ComponentType<{ className?: string }>;
	children: React.ReactNode;
}) {
	return (
		<div className="bg-muted/60 flex items-center gap-1.5 rounded-full px-3 py-1 text-sm text-muted-foreground">
			<Icon className="h-3.5 w-3.5 shrink-0" />
			<span className="text-foreground/90 font-medium">{children}</span>
		</div>
	);
}

export default function StudentProfileHeader({
	student,
	classId,
}: StudentProfileHeaderProps) {
	const t = useTranslations("StudentProfile");
	const status = String(student.status || "ACTIVE").toUpperCase();
	const className = student.className || student.class || "-";

	return (
		<Card className="py-0">
			<CardContent className="p-6 sm:p-8">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
						<div className="border-border bg-muted relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border shadow-sm sm:h-28 sm:w-28">
							<ProgressiveImage
								src={student.photoUrl || "/images/avatar.png"}
								alt={student.fullName || "Student photo"}
								placeholderBase64={student.photoPlaceholder}
								fallback="/images/avatar.png"
								fill
								sizes="112px"
								className="object-cover"
							/>
						</div>

						<div className="space-y-3">
							<div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
								<h1 className="text-2xl font-bold tracking-tight">
									{student.fullName}
								</h1>
								<Badge
									className={
										STATUS_STYLES[status] ||
										"bg-muted text-muted-foreground ring-1 ring-border"
									}
								>
									{formatStatus(status)}
								</Badge>
							</div>

							<div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
								<InfoItem icon={BadgeCheck}>{student.studentId || "-"}</InfoItem>
								<InfoItem icon={GraduationCap}>
									{className}
									{student.section ? ` - ${student.section}` : ""}
								</InfoItem>
								<InfoItem icon={Hash}>Roll {student.roll || "-"}</InfoItem>
							</div>

							{(student.mobile || student.email) && (
								<div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground sm:justify-start">
									{student.mobile && (
										<div className="flex items-center gap-1.5">
											<Phone className="h-3.5 w-3.5" />
											<span>{student.mobile}</span>
										</div>
									)}
									{student.email && (
										<div className="flex items-center gap-1.5">
											<Mail className="h-3.5 w-3.5" />
											<span>{student.email}</span>
										</div>
									)}
								</div>
							)}
						</div>
					</div>

					<div className="flex items-center justify-center gap-3">
						<Button variant="outline" size="sm" className="gap-2">
							<Printer className="h-4 w-4" />
							{t("print")}
						</Button>
						<Button asChild size="sm" className="gap-2">
							<Link href={`/students/directory/${classId}/${student.id}/edit`}>
								<Edit className="h-4 w-4" />
								{t("editProfile")}
							</Link>
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
