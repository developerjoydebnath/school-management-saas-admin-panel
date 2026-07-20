"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/components/ui/dialog";
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
import axios from "@/shared/lib/axios";
import { cn } from "@/shared/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, List, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
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

export default function ApplicationList() {
	const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [statusUpdate, setStatusUpdate] = useState<{ id: string; status: string } | null>(null);
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
	const [roll, setRoll] = useState("");
	const [showRollList, setShowRollList] = useState(false);

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

	const selectedApplication = statusUpdate
		? (applications as any[])?.find((a: any) => a.id === statusUpdate.id)
		: null;

	const handleStatusUpdate = async () => {
		if (!statusUpdate || !selectedApplication) return;

		if (statusUpdate.status === "approved") {
			if (!roll) {
				toast.error("Roll number is required for approval");
				return;
			}
		}

		setIsUpdatingStatus(true);
		try {
			let response: any;
			if (statusUpdate.status === "approved") {
				response = await axios.post(`/admissions/${statusUpdate.id}/approve`, {
					rollNumber: roll.padStart(3, "0"),
				});
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
		} catch (err: any) {
			toast.error(err?.response?.data?.message || tc("updateFailed"));
		} finally {
			setIsUpdatingStatus(false);
			setStatusUpdate(null);
		}
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
						{String(row.original.source || "-").replace("_", " ")}
					</span>
					<span className="text-muted-foreground text-xs capitalize">
						{row.original.paymentStatus || "pending"}
					</span>
				</div>
			),
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
							if (val !== status) setStatusUpdate({ id: app.id, status: val });
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
				const isApproved = String(app.status || "").toLowerCase() === "approved";
				return (
					<div className="flex items-center gap-2">
						<Link href={PATHS.ADMISSION.LIST.DETAILS(app.id)} passHref>
							<Button variant="outline" size="icon-sm">
								<span>
									<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</span>
							</Button>
						</Link>
						{!isApproved && (
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
					}
				}}
				onConfirm={handleStatusUpdate}
				title={t("statusChangeTitle")}
				description={t("statusChangeDescription", {
					status: statusUpdate?.status ?? "",
				})}
				body={
					statusUpdate?.status === "approved" ? (
						<div className="space-y-4">
							<div className="flex flex-col gap-2">
								<label className="text-muted-foreground text-xs font-medium">
									Student Roll Number (3 Digits)
								</label>
								<div className="flex items-center gap-2">
									<Input
										placeholder="e.g. 001"
										value={roll}
										onChange={(e) => setRoll(e.target.value)}
										className="w-full"
										maxLength={3}
									/>
									<Dialog
										open={showRollList}
										onOpenChange={(open) => {
											setShowRollList(open);
										}}
									>
										<DialogTrigger asChild>
											<Button variant="outline" type="button">
												<List className="h-4 w-4" />
												<span>{t("studentListButton")}</span>
											</Button>
										</DialogTrigger>
										<DialogContent className="max-w-2xl">
											<DialogHeader>
												<DialogTitle>{t("rollListTitle")}</DialogTitle>
											</DialogHeader>
											<StudentRollList
												classId={selectedApplication?.classId}
												sessionId={selectedApplication?.sessionId}
												section={selectedApplication?.sectionId}
												onSuggestedRoll={(suggestedRoll) =>
													setRoll((current) => current || suggestedRoll)
												}
											/>
										</DialogContent>
									</Dialog>
								</div>
							</div>
						</div>
					) : null
				}
				isLoading={isUpdatingStatus}
			/>
		</Card>
	);
}
