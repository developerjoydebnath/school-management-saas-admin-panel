"use client";

import { StudentBarcode } from "@/shared/components/custom/StudentBarcode";
import { StudentQRCode } from "@/shared/components/custom/StudentQRCode";
import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Progress } from "@/shared/components/ui/progress";
import { Activity, Calendar, Phone, QrCode, ZoomIn } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface PerformanceSidebarProps {
	student: any;
}

const subjectPerformance = [
	{ subject: "Bangla", score: 90 },
	{ subject: "English", score: 85 },
	{ subject: "Mathematics", score: 92 },
	{ subject: "Science", score: 88 },
	{ subject: "Social Science", score: 84 },
	{ subject: "Religion", score: 91 },
	{ subject: "ICT", score: 78 },
];

const upcomingEvents = [
	{ title: "Mathematics Exam", date: "May 18, 2026", type: "Exam" },
	{ title: "Science Project Due", date: "May 22, 2026", type: "Assignment" },
	{ title: "Parent-Teacher Meeting", date: "May 25, 2026", type: "Meeting" },
	{ title: "Annual Sports Day", date: "Jun 02, 2026", type: "Event" },
];

const recentActivity = [
	{ title: "Submitted Science Homework", date: "May 12, 2026", type: "success" },
	{ title: "Absent — Fever", date: "Apr 22, 2026", type: "warning" },
	{ title: "Scored A+ in Math Exam", date: "Apr 15, 2026", type: "success" },
	{ title: "Fee Payment — ৳3,000", date: "Apr 10, 2026", type: "info" },
	{ title: "Library Book Issued", date: "Apr 05, 2026", type: "info" },
	{ title: "Late to class", date: "Mar 28, 2026", type: "warning" },
];

const activityColors: Record<string, string> = {
	success: "bg-green-500",
	warning: "bg-yellow-500",
	info: "bg-blue-500",
};

const eventColors: Record<string, string> = {
	Exam: "bg-red-500/10 text-red-700",
	Assignment: "bg-orange-500/10 text-orange-700",
	Meeting: "bg-blue-500/10 text-blue-700",
	Event: "bg-purple-500/10 text-purple-700",
};

export function PerformanceSidebar({ student }: PerformanceSidebarProps) {
	const t = useTranslations("StudentProfile");
	const [isZoomOpen, setIsZoomOpen] = useState(false);

	return (
		<div className="space-y-6">
			{/* Student Digital Pass (Scannable Barcode & QR Code) */}
			<Card className="relative overflow-hidden border-primary/20 shadow-md transition-all hover:shadow-lg gap-6">
				<div className="absolute top-0 right-0 -mt-4 -mr-4 size-24 rounded-full bg-primary/5 blur-xl pointer-events-none" />
				<CardHeader className="border-b pb-3">
					<CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
						<QrCode className="text-primary size-5 animate-pulse" />
						Student Digital Pass
					</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col items-center gap-4">
					<div className="flex w-full items-center justify-between gap-4">
						<div className="flex flex-col items-start gap-1">
							<span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Scannable ID</span>
							<span className="font-mono text-sm font-semibold tracking-tight text-foreground">{student.studentId}</span>
							<span className="text-xs text-muted-foreground mt-0.5">{student.fullName}</span>
						</div>
						<div
							onClick={() => setIsZoomOpen(true)}
							className="rounded-xl border bg-white p-2 cursor-pointer transition-all duration-200  hover:border-primary/30 relative group"
							title="Click to zoom QR Code"
						>
							<StudentQRCode studentId={student.studentId} size={80} />
							<div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
								<ZoomIn className="text-primary-foreground size-5 bg-primary p-1 rounded-full shadow-md" />
							</div>
						</div>
					</div>
					<div
						onClick={() => setIsZoomOpen(true)}
						className="w-full border-t border-slate-100 pt-4 flex flex-col items-center cursor-pointer group"
						title="Click to zoom Barcode"
					>
						<div className="rounded-lg bg-slate-50 p-2.5 w-full flex justify-center border border-dashed dark:bg-slate-900/50 relative transition-all duration-200 group-hover:border-primary/30 group-hover:bg-slate-100/50">
							<StudentBarcode studentId={student.studentId} height={40} width={1.5} />
							<div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
								<ZoomIn className="text-primary-foreground size-5 bg-primary p-1 rounded-full shadow-md" />
							</div>
						</div>
						<span className="text-[10px] font-mono text-muted-foreground tracking-widest mt-1.5 uppercase font-semibold group-hover:text-primary transition-colors">Barcode Verification</span>
					</div>
				</CardContent>
			</Card>

			{/* Zoom Modal for scanning easily with mobile/handheld scanners */}
			<Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
				<DialogContent className="sm:max-w-[420px] rounded-2xl overflow-hidden p-6 gap-6">
					<DialogHeader className="flex flex-col items-center text-center gap-1 border-b pb-4">
						<DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
							<QrCode className="text-primary size-5" />
							Scan Credentials
						</DialogTitle>
						<p className="text-xs text-muted-foreground mt-1">
							{student.fullName} • ID: {student.studentId}
						</p>
					</DialogHeader>

					<div className="flex flex-col items-center gap-6 py-2">
						{/* QR Code Segment */}
						<div className="flex flex-col items-center gap-2 w-full">
							<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">QR Code Lookup</span>
							<div className="rounded-2xl border-2 border-primary/10 bg-white p-4">
								<StudentQRCode studentId={student.studentId} size={220} />
							</div>
						</div>

						{/* Barcode Segment */}
						<div className="flex flex-col items-center gap-2 w-full border-t border-slate-100 pt-6">
							<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Barcode Scanner</span>
							<div className="rounded-xl border border-dashed bg-slate-50 dark:bg-slate-900/50 p-4 w-full flex flex-col items-center justify-center gap-2">
								<StudentBarcode studentId={student.studentId} height={60} width={1.8} displayValue={true} />
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
			{/* Subject Progress */}
			<Card className="gap-2">
				<CardHeader className="border-b pb-3">
					<CardTitle className="flex items-center gap-2 text-base font-semibold">
						<Activity className="text-muted-foreground h-4 w-4" />
						{t("performance")}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4 pt-4">
					{subjectPerformance.map((sub) => (
						<div key={sub.subject} className="space-y-1.5">
							<div className="flex items-center justify-between text-sm">
								<span className="font-medium">{sub.subject}</span>
								<span className="text-muted-foreground text-xs">
									{sub.score}%
								</span>
							</div>
							<Progress value={sub.score} className="h-1.5" />
						</div>
					))}
				</CardContent>
			</Card>

			{/* Upcoming Events */}
			<Card className="gap-2">
				<CardHeader className="border-b pb-3">
					<CardTitle className="flex items-center gap-2 text-base font-semibold">
						<Calendar className="text-muted-foreground h-4 w-4" />
						Upcoming Events
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 pt-4">
					{upcomingEvents.map((event, i) => (
						<div key={i} className="flex items-center gap-3">
							<Badge
								variant="outline"
								className={`shrink-0 text-[10px] ${eventColors[event.type]}`}
							>
								{event.type}
							</Badge>
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-medium">
									{event.title}
								</p>
								<p className="text-muted-foreground text-xs">
									{event.date}
								</p>
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			{/* Recent Activity */}
			<Card className="gap-2">
				<CardHeader className="border-b pb-3">
					<CardTitle className="flex items-center gap-2 text-base font-semibold">
						<Activity className="text-muted-foreground h-4 w-4" />
						{t("recentActivity")}
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-4">
					<div className="space-y-4">
						{recentActivity.map((act, i) => (
							<div key={i} className="flex gap-3">
								<div
									className={`mt-1 h-2 w-2 shrink-0 rounded-full ${activityColors[act.type]}`}
								/>
								<div>
									<p className="text-sm leading-tight font-medium">
										{act.title}
									</p>
									<p className="text-muted-foreground mt-0.5 text-xs">
										{act.date}
									</p>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Emergency Contact Card */}
			<Card className="gap-4 bg-red-500/5">
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-base font-semibold text-red-700">
						<Phone className="h-4 w-4" />
						Emergency Contact
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2">
					<div>
						<p className="text-muted-foreground text-xs">Father</p>
						<p className="text-sm font-semibold">{student.mobile || "—"}</p>
					</div>
					<div>
						<p className="text-muted-foreground text-xs">Emergency</p>
						<p className="text-sm font-semibold">
							{student.emergencyContact || "—"}
						</p>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
