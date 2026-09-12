"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import ClassSelect from "@/shared/components/form/ClassSelect";
import SectionSelect from "@/shared/components/form/SectionSelect";
import SessionSelect from "@/shared/components/form/SessionSelect";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { Input } from "@/shared/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { PATHS } from "@/shared/configs/paths.config";
import { useTableData } from "@/shared/hooks/use-table-data";
import { useSWR } from "@/shared/hooks/use-swr";
import axios from "@/shared/lib/axios";
import { cn } from "@/shared/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import {
	AlertTriangle,
	CheckCircle2,
	CreditCard,
	Eye,
	Pencil,
	Trash2,
	Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import ApplicationFilterBar from "./ApplicationFilterBar";
import StudentRollList from "./StudentRollList";

export type ApplicationFilter = {
	search: string;
	status: string[];
	source: string[];
	sessionId: string[];
	classId: string[];
	sectionId: string[];
	paymentStatus: string[];
	dateFrom: string;
	dateTo: string;
};

const initialFilters: ApplicationFilter = {
	search: "",
	status: [],
	source: [],
	sessionId: [],
	classId: [],
	sectionId: [],
	paymentStatus: [],
	dateFrom: "",
	dateTo: "",
};

function formatStatusLabel(status: string) {
	return status
		.split("_")
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

function paymentStatusClass(status: string) {
	const value = String(status || "pending").toLowerCase();
	if (value === "paid") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
	if (value === "partial") return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
	if (value === "failed" || value === "cancelled") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
	return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
}

function paymentStatusLabel(status: string) {
	const value = String(status || "pending").toLowerCase();
	if (value === "paid") return "Paid";
	if (value === "partial") return "Partial";
	if (value === "failed") return "Failed";
	if (value === "cancelled") return "Cancelled";
	if (value === "unpaid") return "Unpaid";
	return "Pending";
}

function isPaymentPaid(app: any) {
	return String(app?.paymentStatus || "").toLowerCase() === "paid";
}

function isApproved(app: any) {
	return String(app?.status || "").toLowerCase() === "approved";
}

function formatMoney(value: unknown) {
	const amount = Number(value || 0);
	return Number.isFinite(amount) ? amount.toLocaleString() : "0";
}

function optionLabel(option: any) {
	if (!option) return "";
	if (typeof option.label === "string") return option.label;
	if (typeof option.name === "string") return option.name;
	if (typeof option.enName === "string") return option.enName;
	if (typeof option.title === "string") return option.title;
	return "";
}

const applicationTrendConfig = {
	count: { label: "Applications", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

function ApplicationSummary({ summary }: { summary?: Record<string, any> }) {
	if (!summary) {
		return (
			<div className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<div key={index} className="border-border/70 bg-card/70 h-24 animate-pulse rounded-md border" />
				))}
			</div>
		);
	}

	const stats = [
		{ label: "Total Applications", value: summary.total, icon: Users },
		{ label: "Approved", value: summary.approved, icon: CheckCircle2 },
		{ label: "Pending Review", value: (summary.pending || 0) + (summary.underReview || 0), icon: AlertTriangle },
		{ label: "Paid Not Activated", value: summary.paidNotActivated, icon: CreditCard, alert: Number(summary.paidNotActivated || 0) > 0 },
	];
	const breakdown = summary.statusBreakdown || {};
	const trend = Array.isArray(summary.trend) ? summary.trend : [];

	return (
		<div className="space-y-4">
			<div className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-4">
				{stats.map((stat) => {
					const Icon = stat.icon;
					return (
						<div
							key={stat.label}
							className={cn(
								"bg-card/70 border-border/70 flex min-h-24 items-start justify-between rounded-md border p-4",
								stat.alert && "border-amber-500/60 bg-amber-500/10"
							)}
						>
							<div className="space-y-2">
								<p className="text-muted-foreground text-sm">{stat.label}</p>
								<p className="text-2xl font-semibold">{formatMoney(stat.value)}</p>
							</div>
							<div className="relative">
								{stat.alert && <span className="absolute inset-0 rounded-full bg-amber-500/50 animate-ping" />}
								<Icon className="text-muted-foreground relative size-4" />
							</div>
						</div>
					);
				})}
			</div>
			<div className="bg-card/70 border-border/70 rounded-md border p-4">
				<div className="mb-3 flex flex-col gap-2 @3xl:flex-row @3xl:items-center @3xl:justify-between">
					<div>
						<p className="text-sm font-medium">Application Trend</p>
						<p className="text-muted-foreground text-xs">New applications for the selected view.</p>
					</div>
					<div className="flex flex-wrap gap-2">
						{Object.entries(breakdown).map(([status, count]) => (
							<Badge key={status} variant="secondary" className="capitalize">
								{formatStatusLabel(status)}: {String(count)}
							</Badge>
						))}
					</div>
				</div>
				<ChartContainer config={applicationTrendConfig} className="h-[220px] w-full">
					<AreaChart data={trend} margin={{ top: 8, right: 12, left: -18, bottom: 4 }}>
						<defs>
							<linearGradient id="applicationTrendGradient" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor="var(--color-count)" stopOpacity={0.35} />
								<stop offset="100%" stopColor="var(--color-count)" stopOpacity={0.03} />
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray="3 3" vertical={false} />
						<XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
						<YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
						<ChartTooltip content={<ChartTooltipContent />} />
						<Area
							type="monotone"
							dataKey="count"
							stroke="var(--color-count)"
							strokeWidth={1.5}
							fill="url(#applicationTrendGradient)"
							dot={{ r: 1.5, fill: "var(--color-count)" }}
						/>
					</AreaChart>
				</ChartContainer>
			</div>
		</div>
	);
}

export default function ApplicationList() {
	const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [statusUpdate, setStatusUpdate] = useState<{ id: string; status: string } | null>(null);
	const [approvalStep, setApprovalStep] = useState<
		"payment" | "target" | "roll" | "overview"
	>("target");
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
	const [roll, setRoll] = useState("");
	const autoSuggestedRollRef = useRef("");
	const [paymentDetails, setPaymentDetails] = useState<any>(null);
	const [isPaymentLoading, setIsPaymentLoading] = useState(false);
	const [approvalTarget, setApprovalTarget] = useState({
		sessionId: "",
		classId: "",
		sectionId: "",
	});
	const [approvalTargetLabels, setApprovalTargetLabels] = useState({
		session: "",
		className: "",
		section: "",
	});
	const [approvalSections, setApprovalSections] = useState<any[]>([]);
	const [approvalSectionSetupKey, setApprovalSectionSetupKey] = useState("");
	const [isApprovalSectionsLoading, setIsApprovalSectionsLoading] = useState(false);
	const [paymentForm, setPaymentForm] = useState({
		paymentMethod: "",
		amount: "",
		paidAt: new Date().toISOString().slice(0, 10),
		transactionId: "",
		note: "",
	});

	const t = useTranslations("Applications");
	const tc = useTranslations("Common");

	const [filter, setFilter] = useState<ApplicationFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const {
		data: applications,
		meta,
		isLoading,
		mutate,
	} = useTableData("/admissions", {
		page,
		limit,
		search: filter.search,
		status: filter.status.join(","),
		source: filter.source.join(","),
		sessionId: filter.sessionId[0] || "",
		classId: filter.classId[0] || "",
		sectionId: filter.sectionId[0] || "",
		paymentStatus: filter.paymentStatus.join(","),
		dateFrom: filter.dateFrom,
		dateTo: filter.dateTo,
	});
	const { data: approvalSessionsResponse } = useSWR(
		statusUpdate?.status === "approved" ? "/sessions/active-list" : null
	);
	const { data: approvalClassesResponse } = useSWR(
		statusUpdate?.status === "approved" && approvalTarget.sessionId
			? "/classes/active-list"
			: null,
		{ sessionId: approvalTarget.sessionId }
	);

	const selectedApplication = statusUpdate
		? (applications as any[])?.find((a: any) => a.id === statusUpdate.id)
		: null;

	const summary = (meta as any)?.summary;
	const approvalTargetKey =
		approvalTarget.sessionId && approvalTarget.classId
			? `${approvalTarget.sessionId}:${approvalTarget.classId}`
			: "";
	const isApprovalSectionSetupLoaded =
		!!approvalTargetKey &&
		!isApprovalSectionsLoading &&
		approvalSectionSetupKey === approvalTargetKey;
	const approvalRequiresSection =
		isApprovalSectionSetupLoaded && approvalSections.length > 0;
	const canLoadApprovalStudents =
		!!approvalTarget.sessionId &&
		!!approvalTarget.classId &&
		isApprovalSectionSetupLoaded &&
		(!approvalRequiresSection || !!approvalTarget.sectionId);
	const paymentDueAmount = Number(paymentDetails?.fee?.dueAmount || 0);
	const hasApprovalPaymentDue =
		!isPaymentPaid(selectedApplication) || paymentDueAmount > 0;
	const approvalSteps = ["payment", "target", "roll", "overview"] as const;
	const approvalStepIndex = approvalSteps.indexOf(approvalStep);
	const approvalSessions =
		approvalSessionsResponse?.data || approvalSessionsResponse || [];
	const approvalClasses = approvalClassesResponse?.data || approvalClassesResponse || [];
	const approvalSectionLabel =
		approvalSections.find((item: any) => item.sectionId === approvalTarget.sectionId)
			?.section?.name ||
		approvalTargetLabels.section ||
		selectedApplication?.section ||
		"";
	const approvalTargetSummary = [
		approvalTargetLabels.session || selectedApplication?.session || "Selected session",
		approvalTargetLabels.className || selectedApplication?.class || "Selected class",
		approvalRequiresSection
			? approvalSectionLabel || "Selected section"
			: "No section",
	].filter(Boolean);

	useEffect(() => {
		if (statusUpdate?.status !== "approved") return;
		const selectedSession = Array.isArray(approvalSessions)
			? approvalSessions.find(
					(session: any) =>
						session.id?.toString() === approvalTarget.sessionId?.toString()
				)
			: null;
		const selectedClass = Array.isArray(approvalClasses)
			? approvalClasses.find(
					(cls: any) => cls.id?.toString() === approvalTarget.classId?.toString()
				)
			: null;
		const nextSession = optionLabel(selectedSession);
		const nextClassName = optionLabel(selectedClass);
		setApprovalTargetLabels((current) => ({
			session: nextSession || current.session,
			className: nextClassName || current.className,
			section: current.section,
		}));
	}, [
		statusUpdate?.status,
		approvalTarget.sessionId,
		approvalTarget.classId,
		approvalSessionsResponse,
		approvalClassesResponse,
	]);

	const loadPaymentDetails = async (
		id: string,
		target = approvalTarget
	) => {
		if (!target.sessionId || !target.classId) return;
		setIsPaymentLoading(true);
		try {
			const response = await axios.get(`/admissions/${id}/payment-details`, {
				params: {
					sessionId: target.sessionId || undefined,
					classId: target.classId || undefined,
					sectionId: target.sectionId || undefined,
				},
			});
			const details = response?.data?.data;
			setPaymentDetails(details);
			const defaultMethod = details?.paymentMethods?.[0]?.value || "";
			setPaymentForm((current) => ({
				...current,
				paymentMethod: defaultMethod,
				amount: String(details?.fee?.dueAmount ?? ""),
				paidAt: new Date().toISOString().slice(0, 10),
			}));
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Failed to load payment details");
		} finally {
			setIsPaymentLoading(false);
		}
	};

	const openStatusUpdate = (app: any, status: string) => {
		setRoll("");
autoSuggestedRollRef.current = "";
		setPaymentDetails(null);
		const target = {
			sessionId: app.sessionId || "",
			classId: app.classId || "",
			sectionId: app.sectionId || "",
		};
		setApprovalTarget(target);
		setApprovalTargetLabels({
			session: app.session || app.sessionName || "",
			className: app.class || app.className || "",
			section: app.section || app.sectionName || "",
		});
		setApprovalSections([]);
		setApprovalSectionSetupKey("");
		setStatusUpdate({ id: app.id, status });
		if (status === "approved") {
			setApprovalStep("payment");
			void loadPaymentDetails(app.id, target);
		} else {
			setApprovalStep("target");
		}
	};

	useEffect(() => {
		if (
			statusUpdate?.status !== "approved" ||
			!approvalTarget.sessionId ||
			!approvalTarget.classId
		) {
			setApprovalSections([]);
			setApprovalSectionSetupKey("");
			return;
		}

		let isMounted = true;
		const requestKey = `${approvalTarget.sessionId}:${approvalTarget.classId}`;
		setApprovalSections([]);
		setApprovalSectionSetupKey("");
		setIsApprovalSectionsLoading(true);
		axios
			.get("/session-class-sections/setup", {
				params: {
					sessionId: approvalTarget.sessionId,
					classId: approvalTarget.classId,
				},
			})
			.then((response) => {
				if (!isMounted) return;
				const items = Array.isArray(response?.data?.data?.items)
					? response.data.data.items.filter(
							(item: any) =>
								item?.status === "ACTIVE" && item?.sectionId && item?.section?.id
						)
					: [];
				setApprovalSections(items);
				setApprovalSectionSetupKey(requestKey);
				setApprovalTarget((current) => {
					if (
						current.sectionId &&
						!items.some((item: any) => item.sectionId === current.sectionId)
					) {
						setRoll("");
autoSuggestedRollRef.current = "";
						return { ...current, sectionId: "" };
					}
					return current;
				});
			})
			.catch(() => {
				if (isMounted) {
					setApprovalSections([]);
					setApprovalSectionSetupKey(requestKey);
				}
			})
			.finally(() => {
				if (isMounted) setIsApprovalSectionsLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, [
		statusUpdate?.status,
		approvalTarget.sessionId,
		approvalTarget.classId,
	]);

	useEffect(() => {
		if (
			statusUpdate?.status !== "approved" ||
			approvalStep !== "payment" ||
			!statusUpdate.id ||
			!approvalTarget.sessionId ||
			!approvalTarget.classId ||
			!isApprovalSectionSetupLoaded ||
			(approvalRequiresSection && !approvalTarget.sectionId)
		) {
			return;
		}
		void loadPaymentDetails(statusUpdate.id, approvalTarget);
	}, [
		statusUpdate?.id,
		statusUpdate?.status,
		approvalStep,
		approvalTarget.sessionId,
		approvalTarget.classId,
		approvalTarget.sectionId,
		isApprovalSectionsLoading,
		isApprovalSectionSetupLoaded,
		approvalRequiresSection,
	]);



	const handleStatusUpdate = async () => {
		if (!statusUpdate || !selectedApplication) return;

		let shouldCloseDialog = false;
		if (statusUpdate.status === "approved") {
			if (approvalStep === "payment") {
				if (!hasApprovalPaymentDue) {
					setApprovalStep("target");
					return;
				}
				if (!paymentForm.paymentMethod) {
					toast.error("Select a payment method");
					return;
				}
				if (!Number(paymentForm.amount)) {
					toast.error("Payment amount is required");
					return;
				}
			} else {
				if (!approvalTarget.sessionId || !approvalTarget.classId) {
					toast.error("Select session and class before approval");
					return;
				}
				if (!isApprovalSectionSetupLoaded) {
					toast.error("Please wait while section setup is loading");
					return;
				}
				if (approvalRequiresSection && !approvalTarget.sectionId) {
					toast.error("Select a section for this class session");
					return;
				}
			}
			if (approvalStep === "target") {
				setApprovalStep("roll");
				return;
			}
			if (approvalStep === "roll") {
				if (!roll) {
					toast.error("Roll number is required for approval");
					return;
				}
				setApprovalStep("overview");
				return;
			}
			if (approvalStep === "overview" && !roll) {
				toast.error("Roll number is required for approval");
				return;
			}
		}

		setIsUpdatingStatus(true);
		try {
			let response: any;
			if (statusUpdate.status === "approved" && approvalStep === "payment") {
				response = await axios.post(`/admissions/${statusUpdate.id}/payment`, {
					...paymentForm,
					...approvalTarget,
				});
				toast.success(response?.data?.message || "Admission payment recorded successfully");
				await loadPaymentDetails(statusUpdate.id, approvalTarget);
				setApprovalStep("target");
				await mutate();
				return;
			} else if (
				statusUpdate.status === "approved" &&
				approvalStep === "overview"
			) {
				response = await axios.post(`/admissions/${statusUpdate.id}/approve`, {
					rollNumber: roll.padStart(3, "0"),
					sessionId: approvalTarget.sessionId,
					classId: approvalTarget.classId,
					sectionId: approvalTarget.sectionId || undefined,
				});
			} else if (statusUpdate.status === "approved") {
				setApprovalStep("overview");
				return;
			} else if (statusUpdate.status === "rejected") {
				response = await axios.post(`/admissions/${statusUpdate.id}/reject`, {
					rejectionReason: "Rejected from application list",
				});
			} else if (statusUpdate.status === "waitlisted") {
				response = await axios.post(`/admissions/${statusUpdate.id}/waitlist`, {});
			} else if (statusUpdate.status === "eligible_for_payment") {
				response = await axios.post(
					`/admissions/${statusUpdate.id}/eligible-for-payment`,
					{}
				);
			} else {
				response = await axios.patch(`/admissions/${statusUpdate.id}`, {
					status: statusUpdate.status,
				});
			}

			toast.success(
				response?.data?.message ||
					t("statusUpdateSuccess", { status: statusUpdate.status })
			);
			if (response?.data?.data?.mailSkipped) {
				toast.warning(response.data.data.mailMessage || "Mail was not sent");
			} else if (response?.data?.data?.emailQueued) {
				toast.success("Payment email queued");
			}
			mutate();
			setRoll("");
autoSuggestedRollRef.current = "";
			shouldCloseDialog = true;
		} catch (err: any) {
			// Shared axios interceptor already shows the backend message.
		} finally {
			setIsUpdatingStatus(false);
			if (shouldCloseDialog) {
				setStatusUpdate(null);
				setPaymentDetails(null);
				setApprovalStep("target");
				setApprovalSections([]);
				setApprovalSectionSetupKey("");
				setApprovalTarget({ sessionId: "", classId: "", sectionId: "" });
				setApprovalTargetLabels({ session: "", className: "", section: "" });
			}
		}
	};

	const goToPreviousApprovalStep = () => {
		if (statusUpdate?.status !== "approved" || approvalStepIndex <= 0) return;
		setApprovalStep(approvalSteps[approvalStepIndex - 1]);
	};

	const confirmDelete = async (id: string) => {
		setApplicationToDelete(id);
		setIsDeleting(true);
		try {
			await axios.delete(`/admissions/${id}`);
			toast.success("Application deleted successfully");
			mutate();
		} catch (err: any) {
			toast.error("Failed to delete application. Please try again.");
		} finally {
			setIsDeleting(false);
			setApplicationToDelete(null);
		}
	};

	const columns: ColumnDef<any>[] = [
		{
			id: "studentName",
			accessorKey: "fullName",
			header: t("studentName"),
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span className="font-medium">
						{row.original.fullName || row.original.studentName}
					</span>
					<span className="text-muted-foreground text-xs">
						{row.original.applicationNo || "-"}
					</span>
				</div>
			),
		},
		{
			id: "class",
			accessorKey: "class",
			header: t("class"),
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span className="text-sm font-medium">{row.original.class || "-"}</span>
					<span className="text-muted-foreground text-xs">
						{row.original.section ? `Section ${row.original.section}` : "No section"}
					</span>
				</div>
			),
		},
		{
			id: "guardianName",
			accessorKey: "fatherName",
			header: t("guardianName"),
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span className="text-sm font-medium">
						{row.original.fatherName || row.original.guardianName || "-"}
					</span>
					<span className="text-muted-foreground text-xs">
						{row.original.mobile || row.original.contact}
					</span>
				</div>
			),
		},
		{
			id: "source",
			header: "Source",
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span className="text-sm font-medium capitalize">
						{String(row.original.source || "-").replaceAll("_", " ")}
					</span>
					<span className="text-muted-foreground text-xs">
						{row.original.submittedAt
							? new Date(row.original.submittedAt).toLocaleDateString()
							: "-"}
					</span>
				</div>
			),
		},
		{
			id: "paymentStatus",
			header: "Payment",
			cell: ({ row }) => {
				const app = row.original;
				const paidNeedsApproval = isPaymentPaid(app) && !isApproved(app);
				return (
					<div className="flex items-center gap-2">
						<div className="relative flex">
							{paidNeedsApproval && (
								<span className="absolute -right-1 -top-1 size-2 rounded-full bg-green-500 animate-ping" />
							)}
							{paidNeedsApproval && (
								<span className="absolute -right-1 -top-1 size-2 rounded-full bg-green-500" />
							)}
							<Badge className={cn("border-0", paymentStatusClass(app.paymentStatus))}>
								{paymentStatusLabel(app.paymentStatus)}
							</Badge>
						</div>
					</div>
				);
			},
		},
		{
			id: "progress",
			header: "Progress",
			cell: ({ row }) => {
				const completion = row.original.completion || {};
				const percent = Number(completion.completionPercent || 0);
				return (
					<div className="min-w-36 space-y-1">
						<div className="flex items-center justify-between gap-3 text-xs">
							<span className="text-muted-foreground">
								{completion.completedFields || 0}/{completion.totalFields || 0}
							</span>
							<span className="font-medium">{percent}%</span>
						</div>
						<div className="bg-muted h-1.5 overflow-hidden rounded-full">
							<div
								className={cn(
									"h-full rounded-full",
									percent >= 80
										? "bg-green-500"
										: percent >= 50
											? "bg-amber-500"
											: "bg-red-500"
								)}
								style={{ width: `${Math.min(percent, 100)}%` }}
							/>
						</div>
					</div>
				);
			},
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => {
				const app = row.original;
				const status = String(app.status || "pending").toLowerCase();
				const statusLabel = formatStatusLabel(status);

				return (
					<Select
						value={status}
						onValueChange={(val) => {
							if (val !== status) openStatusUpdate(app, val);
						}}
						disabled={status === "approved"}
					>
						<SelectTrigger
							className={cn(
								"h-8 w-[120px] rounded-full border-none px-3 text-xs font-medium shadow-none ring-0",
								status === "approved"
									? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
									: "cursor-pointer",
								status === "rejected" &&
									"bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
								status === "pending" &&
									"bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
								status === "eligible_for_payment" &&
									"bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
							)}
						>
							<SelectValue>{statusLabel}</SelectValue>
						</SelectTrigger>
						<SelectContent className="p-1">
							<SelectItem className="cursor-pointer py-2 text-xs" value="pending">
								Pending
							</SelectItem>
							<SelectItem
								className="cursor-pointer py-2 text-xs"
								value="under_review"
							>
								Under Review
							</SelectItem>
							<SelectItem
								className="cursor-pointer py-2 text-xs"
								value="eligible_for_payment"
							>
								Eligible For Payment
							</SelectItem>
							<SelectItem className="cursor-pointer py-2 text-xs" value="approved">
								Approved
							</SelectItem>
							<SelectItem className="cursor-pointer py-2 text-xs" value="waitlisted">
								Waitlisted
							</SelectItem>
							<SelectItem className="cursor-pointer py-2 text-xs" value="rejected">
								Rejected
							</SelectItem>
						</SelectContent>
					</Select>
				);
			},
		},
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => {
				const app = row.original;
				const approved = isApproved(app);
				return (
					<div className="flex items-center gap-2">
						<Link href={PATHS.ADMISSION.LIST.DETAILS(app.id)} passHref>
							<Button variant="outline" size="icon-sm">
								<span>
									<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</span>
							</Button>
						</Link>
						{!approved && (
							<Link href={PATHS.ADMISSION.LIST.EDIT(app.id)} passHref>
								<Button variant="outline" size="icon-sm">
									<span>
										<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
									</span>
								</Button>
							</Link>
						)}
						<ConfirmationModal
							onConfirm={() => confirmDelete(app.id)}
							title={t("deleteTitle")}
							description={t("deleteDescription")}
							confirmText={tc("delete")}
							variant="destructive"
							isLoading={isDeleting && applicationToDelete === app.id}
						>
							<AlertDialogTrigger asChild>
								<Button variant="destructive" size="icon-sm">
									<Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
								</Button>
							</AlertDialogTrigger>
						</ConfirmationModal>
					</div>
				);
			},
		},
	];

	const resetFilters = () => {
		setFilter(initialFilters);
		setPage(1);
		setLimit(10);
	};

	return (
		<Card className="@container/page p-4 shadow-none ring-0 sm:p-6">
			<CardHeader className="p-0">
				<ApplicationFilterBar filter={filter} setFilter={setFilter} />
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<ApplicationSummary summary={summary} />
				<TableFilter filter={filter} setFilter={setFilter} resetFilters={resetFilters} />

				<DataTable<any>
					data={applications || []}
					isLoading={isLoading}
					pagination={
						meta
							? {
									page: meta.page,
									limit: meta.limit,
									total: meta.total,
									totalPages: meta.totalPages,
									onPageChange: setPage,
									onLimitChange: setLimit,
								}
							: undefined
					}
					columns={columns}
				/>
			</CardContent>

			<ConfirmationModal
				open={!!statusUpdate}
				onOpenChange={(open) => {
					if (!open) {
						setStatusUpdate(null);
						setRoll("");
autoSuggestedRollRef.current = "";
						setPaymentDetails(null);
						setApprovalStep("target");
						setApprovalSections([]);
						setApprovalSectionSetupKey("");
						setApprovalTarget({ sessionId: "", classId: "", sectionId: "" });
					}
				}}
				onConfirm={handleStatusUpdate}
				closeOnConfirm={false}
				contentClassName="w-[calc(100vw-2rem)] sm:!max-w-3xl"
				title={t("statusChangeTitle")}
				description={t("statusChangeDescription", {
					status: statusUpdate?.status ?? "",
				})}
				body={
					statusUpdate?.status === "approved" ? (
						<div className="space-y-4">
							<div className="grid grid-cols-4 gap-2">
								{approvalSteps.map((step, index) => (
									<div
										key={step}
										className={cn(
											"rounded-md border px-3 py-2 text-center text-xs font-medium capitalize",
											approvalStep === step
												? "border-primary bg-primary/10 text-primary"
												: "text-muted-foreground border-border"
										)}
									>
										{index + 1}. {step}
									</div>
								))}
							</div>

							{approvalStep === "payment" && (
								<div className="space-y-4">
									{isPaymentLoading ? (
										<div className="space-y-3">
											<div className="bg-muted h-16 animate-pulse rounded-md" />
											<div className="bg-muted h-10 animate-pulse rounded-md" />
											<div className="grid gap-3 sm:grid-cols-2">
												<div className="bg-muted h-10 animate-pulse rounded-md" />
												<div className="bg-muted h-10 animate-pulse rounded-md" />
											</div>
										</div>
									) : (
										<>
											<div className="mb-1">
												<p className="text-sm font-medium">Admission Payment</p>
												<p className="text-muted-foreground text-xs">
													Record payment now, or continue and keep the remaining amount as due.
												</p>
											</div>
											<div className="border-border/70 rounded-md border p-3 text-sm">
												<div className="grid gap-2 sm:grid-cols-3">
													<div>
														<p className="text-muted-foreground text-xs">Required total</p>
														<p className="font-semibold">
															BDT {formatMoney(paymentDetails?.fee?.requiredTotal)}
														</p>
													</div>
													<div>
														<p className="text-muted-foreground text-xs">Paid</p>
														<p className="font-semibold">
															BDT {formatMoney(paymentDetails?.fee?.alreadyPaid)}
														</p>
													</div>
													<div>
														<p className="text-muted-foreground text-xs">Due now</p>
														<p className="font-semibold">
															BDT {formatMoney(paymentDetails?.fee?.dueAmount)}
														</p>
													</div>
												</div>
											</div>
											{hasApprovalPaymentDue ? (
												<>
													<div className="grid gap-3 sm:grid-cols-2">
														<div className="space-y-2">
															<label className="text-muted-foreground text-xs font-medium">
																Payment Method
															</label>
															<Select
																value={paymentForm.paymentMethod}
																onValueChange={(value) =>
																	setPaymentForm((current) => ({
																		...current,
																		paymentMethod: value,
																	}))
																}
															>
																<SelectTrigger className="!h-10 w-full">
																	<SelectValue placeholder="Select payment method" />
																</SelectTrigger>
																<SelectContent>
																	{(paymentDetails?.paymentMethods || []).map((method: any) => (
																		<SelectItem key={method.value} value={method.value}>
																			{method.label}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														</div>
														<div className="space-y-2">
															<label className="text-muted-foreground text-xs font-medium">
																Amount
															</label>
															<Input
																type="number"
																min={1}
																max={paymentDetails?.fee?.dueAmount || undefined}
																value={paymentForm.amount}
																onChange={(event) =>
																	setPaymentForm((current) => ({
																		...current,
																		amount: event.target.value,
																	}))
																}
																placeholder="Enter amount"
																className="h-10 w-full"
															/>
														</div>
														<div className="space-y-2">
															<label className="text-muted-foreground text-xs font-medium">
																Paid At
															</label>
															<Input
																type="date"
																value={paymentForm.paidAt}
																onChange={(event) =>
																	setPaymentForm((current) => ({
																		...current,
																		paidAt: event.target.value,
																	}))
																}
																className="h-10 w-full"
															/>
														</div>
														<div className="space-y-2">
															<label className="text-muted-foreground text-xs font-medium">
																Transaction ID
															</label>
															<Input
																value={paymentForm.transactionId}
																onChange={(event) =>
																	setPaymentForm((current) => ({
																		...current,
																		transactionId: event.target.value,
																	}))
																}
																placeholder="Enter transaction ID"
																className="h-10 w-full"
															/>
														</div>
													</div>
													<div className="space-y-2">
														<label className="text-muted-foreground text-xs font-medium">
															Payment Note
														</label>
														<Input
															value={paymentForm.note}
															onChange={(event) =>
																setPaymentForm((current) => ({
																	...current,
																	note: event.target.value,
																}))
															}
															placeholder="Optional payment note"
															className="h-10 w-full"
														/>
													</div>
													<div className="flex justify-end">
														<Button
															type="button"
															variant="outline"
															onClick={() => setApprovalStep("target")}
														>
															Continue without payment
														</Button>
													</div>
												</>
											) : (
												<div className="rounded-md border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
													Payment is already complete. Continue to confirm the academic target.
												</div>
											)}
										</>
									)}
								</div>
							)}

							{approvalStep === "target" && (
								<div className="rounded-md border p-4">
									<div className="mb-3">
										<p className="text-sm font-medium">Admission Target</p>
										<p className="text-muted-foreground text-xs">
											Confirm the final session, class, and section before approval.
										</p>
									</div>
									<div className="grid gap-3 md:grid-cols-3">
										<div className="space-y-2">
											<label className="text-muted-foreground text-xs font-medium">
												Session
											</label>
											<SessionSelect
												value={approvalTarget.sessionId}
												onOptionChange={(option) =>
													setApprovalTargetLabels((current) => ({
														...current,
														session: optionLabel(option),
													}))
												}
												onChange={(value) => {
													setApprovalTarget({
														sessionId: value || "",
														classId: "",
														sectionId: "",
													});
													setApprovalTargetLabels((current) => ({
														...current,
														className: "",
														section: "",
													}));
													setApprovalSections([]);
													setApprovalSectionSetupKey("");
													setRoll("");
autoSuggestedRollRef.current = "";
												}}
												placeholder="Select session"
											/>
										</div>
										<div className="space-y-2">
											<label className="text-muted-foreground text-xs font-medium">
												Class
											</label>
											<ClassSelect
												value={approvalTarget.classId}
												sessionId={approvalTarget.sessionId}
												onOptionChange={(option) =>
													setApprovalTargetLabels((current) => ({
														...current,
														className: optionLabel(option),
													}))
												}
												onChange={(value) => {
													setApprovalTarget((current) => ({
														...current,
														classId: value || "",
														sectionId: "",
													}));
													setApprovalTargetLabels((current) => ({
														...current,
														section: "",
													}));
													setApprovalSections([]);
													setApprovalSectionSetupKey("");
													setRoll("");
autoSuggestedRollRef.current = "";
												}}
												placeholder="Select class"
											/>
										</div>
										<div className="space-y-2">
											<label className="text-muted-foreground text-xs font-medium">
												Section
											</label>
											<SectionSelect
												value={approvalTarget.sectionId}
												sessionId={approvalTarget.sessionId}
												classId={approvalTarget.classId}
												onOptionChange={(option) =>
													setApprovalTargetLabels((current) => ({
														...current,
														section: optionLabel(option),
													}))
												}
												onChange={(value) => {
													setApprovalTarget((current) => ({
														...current,
														sectionId: value || "",
													}));
													setRoll("");
autoSuggestedRollRef.current = "";
												}}
												placeholder={
													approvalRequiresSection
														? "Select section"
														: "No section needed"
												}
											/>
										</div>
									</div>
									<p className="text-muted-foreground mt-3 text-xs">
										{isApprovalSectionsLoading
											? "Checking section setup..."
											: approvalRequiresSection
												? "This class session has section setup, so section is required before approval."
												: "This class session has no section setup, so approval will use the selected class only."}
									</p>
								</div>
							)}

							{approvalStep === "roll" && (
								<div className="space-y-4">
									<div className="space-y-2 rounded-md border p-4">
										<label className="text-muted-foreground text-xs font-medium">
											Student Roll Number (3 Digits)
										</label>
										<Input
											placeholder="e.g. 001"
											value={roll}
											onChange={(e) =>
												setRoll(e.target.value.replace(/\D/g, "").slice(0, 3))
											}
											className="h-10 w-full"
											maxLength={3}
											disabled={
												isApprovalSectionsLoading ||
												(approvalRequiresSection && !approvalTarget.sectionId)
											}
										/>
										<p className="text-muted-foreground text-xs">
											The next roll is suggested from the selected session, class, and
											section. You can change it, but duplicate rolls will be rejected.
										</p>
									</div>
									<div className="min-w-0 rounded-md border p-4">
										<div className="mb-2">
											<p className="text-sm font-medium">Current Student List</p>
											<p className="text-muted-foreground text-xs">
												Students already approved in the selected target.
											</p>
										</div>
										{canLoadApprovalStudents ? (
											<StudentRollList
												classId={approvalTarget.classId}
												sessionId={approvalTarget.sessionId}
												section={
													approvalRequiresSection
														? approvalTarget.sectionId
														: undefined
												}
												onSuggestedRoll={(suggestedRoll) => {
													setRoll((current) => {
														if (
															current === "" ||
															current === autoSuggestedRollRef.current
														) {
															autoSuggestedRollRef.current = suggestedRoll;
															return suggestedRoll;
														}
														return current;
													});
												}}
											/>
										) : (
											<div className="text-muted-foreground flex min-h-32 items-center rounded-md border border-dashed p-4 text-sm">
												Select session, class, and section when required to view current
												students.
											</div>
										)}
									</div>
								</div>
							)}

							{approvalStep === "overview" && (
								<div className="space-y-4">
									<div className="rounded-md border p-4">
										<p className="mb-3 text-sm font-medium">Approval Overview</p>
										<div className="grid gap-3 text-sm sm:grid-cols-2">
											<div className="rounded-md border p-3">
												<p className="text-muted-foreground text-xs">Application</p>
												<p className="font-semibold">
													{selectedApplication?.fullName || selectedApplication?.studentName || "-"}
												</p>
												<p className="text-muted-foreground text-xs">
													{selectedApplication?.applicationNo || selectedApplication?.id}
												</p>
											</div>
											<div className="rounded-md border p-3">
												<p className="text-muted-foreground text-xs">Roll Number</p>
												<p className="font-semibold">{roll.padStart(3, "0")}</p>
											</div>
											<div className="rounded-md border p-3">
												<p className="text-muted-foreground text-xs">Payment</p>
												<p className="font-semibold">
													Paid BDT {formatMoney(paymentDetails?.fee?.alreadyPaid)}
												</p>
												<p className="text-muted-foreground text-xs">
													Due BDT {formatMoney(paymentDetails?.fee?.dueAmount)}
												</p>
											</div>
											<div className="rounded-md border p-3">
												<p className="text-muted-foreground text-xs">Target</p>
												<p className="font-semibold">
													{approvalTargetSummary.join(" / ")}
												</p>
												<p className="text-muted-foreground text-xs">
													Final values will be saved with the student profile.
												</p>
											</div>
										</div>
									</div>
									<div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
										Confirming will create the student profile and keep any unpaid amount as due.
									</div>
								</div>
							)}
						</div>
					) : null
				}
				confirmText={
					statusUpdate?.status === "approved"
						? approvalStep === "payment"
							? hasApprovalPaymentDue
								? "Record Payment"
								: "Continue"
							: approvalStep === "target"
								? "Continue"
								: approvalStep === "roll"
									? "Review"
									: "Approve Application"
						: "Confirm"
				}
				footerExtra={
					statusUpdate?.status === "approved" && approvalStepIndex > 0 ? (
						<Button
							type="button"
							variant="outline"
							disabled={isUpdatingStatus}
							onClick={goToPreviousApprovalStep}
						>
							Previous
						</Button>
					) : null
				}
				isLoading={isUpdatingStatus}
			/>
		</Card>
	);
}
