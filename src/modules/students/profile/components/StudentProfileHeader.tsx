"use client";

import { ProgressiveImage } from "@/shared/components/media/ProgressiveImage";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Edit, Mail, Phone, Printer } from "lucide-react";
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

export default function StudentProfileHeader({
	student,
	classId,
}: StudentProfileHeaderProps) {
	const t = useTranslations("StudentProfile");
	const status = String(student.status || "ACTIVE").toUpperCase();

	return (
		<Card className="overflow-hidden py-0">
			<CardContent className="p-6 sm:p-8">
				<div className="grid gap-6 lg:grid-cols-[240px_1fr_auto] lg:items-center">
					<div className="mx-auto w-full max-w-[220px]">
						<div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
							<ProgressiveImage
								src={student.photoUrl || "/images/avatar.png"}
								alt={student.fullName || "Student photo"}
								placeholderBase64={student.photoPlaceholder}
								fallback="/images/avatar.png"
								fill
								sizes="220px"
								className="object-cover"
							/>
						</div>
					</div>

					<div className="space-y-4 text-center lg:text-left">
						<div className="space-y-2">
							<div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
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
							<p className="text-sm font-medium text-muted-foreground">
								ID: {student.studentId || "-"} | Class {student.class || "-"} |{" "}
								Section {student.section || "-"} | Roll {student.roll || "-"}
							</p>
						</div>

						<div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground lg:justify-start">
							{student.mobile && (
								<div className="flex items-center gap-1">
									<Phone className="h-3.5 w-3.5" />
									<span>{student.mobile}</span>
								</div>
							)}
							{student.email && (
								<div className="flex items-center gap-1">
									<Mail className="h-3.5 w-3.5" />
									<span>{student.email}</span>
								</div>
							)}
						</div>
					</div>

					<div className="flex items-center justify-center gap-3 lg:justify-end">
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
