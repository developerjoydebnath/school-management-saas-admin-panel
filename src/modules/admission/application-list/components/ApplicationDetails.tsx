"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useSWR } from "@/shared/hooks/use-swr";
import { cn } from "@/shared/lib/utils";
import { BookOpen, Info, Loader2, MapPin, User, Users } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ApplicationDetails({ id }: { id: string }) {
	const t = useTranslations("Applications");
	const { data: app, isLoading } = useSWR(`/admissions/${id}`);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				<Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!app) {
		return (
			<div className="flex items-center justify-center p-8 text-center">
				<p className="text-muted-foreground">{t("notFound")}</p>
			</div>
		);
	}

	let customData = app.customData;
	if (typeof customData === "string") {
		try {
			customData = JSON.parse(customData);
		} catch (e) {
			customData = {};
		}
	}

	return (
		<div className="grid grid-cols-1 gap-6 @5xl/main:grid-cols-12">
			{/* Left Column: Profile and Academic Info */}
			<div className="@5xl/main:col-span-4">
				<div className="space-y-6 @5xl/main:sticky @5xl/main:top-20">
					{/* Profile Card */}
					<Card className="border-border/50 overflow-hidden shadow-none">
						<CardContent className="pt-8 pb-6 text-center">
							<div className="bg-muted text-muted-foreground/40 border-background mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full border-4 text-3xl font-bold shadow-sm">
								{app.fullName?.[0] || app.studentName?.[0]}
							</div>
							<h2 className="text-foreground/90 text-xl font-bold">
								{app.fullName || app.studentName}
							</h2>
							<Badge
								variant="outline"
								className={cn(
									"mt-3 rounded-full px-4 py-0.5 font-medium",
									app.status === "Approved"
										? "border-green-200 bg-green-50 text-green-600"
										: app.status === "Rejected"
											? "border-red-200 bg-red-50 text-red-600"
											: "border-orange-200 bg-orange-50 text-orange-600"
								)}
							>
								{app.status || "Pending"}
							</Badge>

							<div className="mt-8 grid grid-cols-2 gap-4 border-t border-dashed pt-6">
								<div className="text-left">
									<p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wider uppercase">
										Class
									</p>
									<p className="text-foreground/80 font-bold">{app.class}</p>
								</div>
								<div className="border-l pl-4 text-left">
									<p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wider uppercase">
										Section
									</p>
									<p className="text-foreground/80 font-bold">
										{app.section || "A"}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Academic Information Card */}
					<Card className="gap-0 py-0 shadow-none">
						<CardHeader className="flex flex-row items-center gap-2 space-y-0 border-b bg-blue-100/10 pt-5 pb-5! dark:bg-black/200">
							<BookOpen className="text-primary size-4" />
							<CardTitle className="text-base font-bold">
								{t("academicInfo")}
							</CardTitle>
						</CardHeader>
						<CardContent className="pt-5 pb-6">
							<dl className="space-y-4">
								<div className="group flex items-center justify-between text-sm">
									<dt className="text-muted-foreground group-hover:text-foreground transition-colors">
										{t("admissionType")}
									</dt>
									<dd className="text-foreground/80 font-bold capitalize">
										{app.admissionType || "-"}
									</dd>
								</div>
								<div className="group flex items-center justify-between text-sm">
									<dt className="text-muted-foreground group-hover:text-foreground transition-colors">
										{t("previousSchool")}
									</dt>
									<dd className="text-foreground/80 font-bold">
										{app.previousSchool || "-"}
									</dd>
								</div>
								<div className="group flex items-center justify-between text-sm">
									<dt className="text-muted-foreground group-hover:text-foreground transition-colors">
										{t("tcNumber")}
									</dt>
									<dd className="text-foreground/80 font-bold">
										{app.tcNumber || "-"}
									</dd>
								</div>
								<div className="group flex items-center justify-between text-sm">
									<dt className="text-muted-foreground group-hover:text-foreground transition-colors">
										{t("lastResult")}
									</dt>
									<dd className="text-foreground/80 font-bold">
										{app.lastResult || "-"}
									</dd>
								</div>
							</dl>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Right Column: Detailed Info Sections */}
			<div className="space-y-6 @5xl/main:col-span-8">
				{/* Student Information */}
				<Card className="gap-0 py-0 shadow-none">
					<CardHeader className="flex flex-row items-center gap-2 space-y-0 border-b bg-blue-100/10 pt-5 pb-5! dark:bg-black/200">
						<User className="text-primary size-4" />
						<CardTitle className="text-base font-bold">{t("studentInfo")}</CardTitle>
					</CardHeader>
					<CardContent className="px-6 pt-6 pb-8">
						<div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
							<div className="space-y-1">
								<p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
									{t("applicationID")}
								</p>
								<p className="text-foreground/80 font-bold">{app.id}</p>
							</div>
							<div className="space-y-1">
								<p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
									{t("session")}
								</p>
								<p className="text-foreground/80 font-bold">{app.session}</p>
							</div>
							<div className="space-y-1">
								<p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
									{t("dob")}
								</p>
								<p className="text-foreground/80 font-bold">{app.dob || "-"}</p>
							</div>
							<div className="space-y-1">
								<p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
									{t("gender")}
								</p>
								<p className="text-foreground/80 font-bold capitalize">
									{app.gender || "-"}
								</p>
							</div>
							<div className="space-y-1">
								<p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
									{t("bloodGroup")}
								</p>
								<p className="text-foreground/80 font-bold">
									{app.bloodGroup || "-"}
								</p>
							</div>
							<div className="space-y-1">
								<p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
									{t("religion")}
								</p>
								<p className="text-foreground/80 font-bold">
									{app.religion || "-"}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Parent / Guardian Information */}
				<Card className="gap-0 py-0 shadow-none">
					<CardHeader className="flex flex-row items-center gap-2 space-y-0 border-b bg-blue-100/10 pt-5 pb-5! dark:bg-black/200">
						<Users className="text-primary size-4" />
						<CardTitle className="text-base font-bold">{t("parentInfo")}</CardTitle>
					</CardHeader>
					<CardContent className="px-6 pt-6 pb-8">
						<div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
							<div className="space-y-1">
								<p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
									{t("fatherName")}
								</p>
								<p className="text-foreground/80 font-bold">
									{app.fatherName || "-"}
								</p>
							</div>
							<div className="space-y-1">
								<p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
									{t("fatherNid")}
								</p>
								<p className="text-foreground/80 font-bold">
									{app.fatherNid || "-"}
								</p>
							</div>
							<div className="space-y-1">
								<p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
									{t("motherName")}
								</p>
								<p className="text-foreground/80 font-bold">
									{app.motherName || "-"}
								</p>
							</div>
							<div className="space-y-1">
								<p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
									{t("motherNid")}
								</p>
								<p className="text-foreground/80 font-bold">
									{app.motherNid || "-"}
								</p>
							</div>
							<div className="space-y-1">
								<p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
									{t("contactNumber")}
								</p>
								<p className="text-foreground/80 font-bold">
									{app.mobile || app.contact || "-"}
								</p>
							</div>
							<div className="space-y-1">
								<p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
									{t("emergencyContact")}
								</p>
								<p className="text-foreground/80 font-bold">
									{app.emergencyContact || "-"}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Address Information */}
				<Card className="gap-0 py-0 shadow-none">
					<CardHeader className="flex flex-row items-center gap-2 space-y-0 border-b bg-blue-100/10 pt-5 pb-5! dark:bg-black/200">
						<MapPin className="text-primary size-4" />
						<CardTitle className="text-base font-bold">{t("address")}</CardTitle>
					</CardHeader>
					<CardContent className="px-6 pt-6 pb-8">
						<div className="grid grid-cols-1 gap-x-12 gap-y-6 sm:grid-cols-2">
							<div className="space-y-1">
								<p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
									{t("presentAddress")}
								</p>
								<p className="text-foreground/80 leading-relaxed font-bold">
									{app.presentAddress || "-"}
								</p>
							</div>
							<div className="space-y-1">
								<p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
									{t("permanentAddress")}
								</p>
								<p className="text-foreground/80 leading-relaxed font-bold">
									{app.permanentAddress || "-"}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Additional Custom Data */}
				{customData && Object.keys(customData).length > 0 && (
					<Card className="gap-0 py-0 shadow-none">
						<CardHeader className="flex flex-row items-center gap-2 space-y-0 border-b bg-blue-100/10 pt-5 pb-5! dark:bg-black/200">
							<Info className="text-primary size-4" />
							<CardTitle className="text-base font-bold">
								{t("additionalData")}
							</CardTitle>
						</CardHeader>
						<CardContent className="bg-muted/5 px-6 pt-6 pb-6">
							<pre className="bg-muted/40 border-border/50 scrollbar-thin max-h-60 overflow-auto rounded-lg border p-4 font-mono text-xs">
								{JSON.stringify(customData, null, 2)}
							</pre>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
