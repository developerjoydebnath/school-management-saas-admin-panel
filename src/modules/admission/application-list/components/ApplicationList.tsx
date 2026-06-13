"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { TOption } from "@/shared/components/form/FilterButton";
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
import { AlertCircle, Eye, List, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import ApplicationFilterBar from "./ApplicationFilterBar";
import StudentRollList from "./StudentRollList";

export type ApplicationFilter = {
	search: string;
	status: TOption[];
};

const initialFilters: ApplicationFilter = { search: "", status: [] };

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
		// page,
		// limit,
		// ...filter,
	});

	const { data: students, mutate: mutateStudents } = useTableData("/students");

	const selectedApplication = statusUpdate
		? (applications as any[])?.find((a: any) => a.id === statusUpdate.id)
		: null;

	const handleStatusUpdate = async () => {
		if (!statusUpdate || !selectedApplication) return;

		if (statusUpdate.status === "Approved") {
			if (!roll) {
				toast.error("Roll number is required for approval");
				return;
			}

			// Check if roll is already taken
			const formattedRoll = roll.padStart(3, "0");
			const isTaken = (students as any[])?.some(
				(s: any) =>
					s.roll === formattedRoll &&
					s.session === selectedApplication?.session &&
					s.class === selectedApplication?.class &&
					s.section === selectedApplication?.section
			);

			if (isTaken) {
				toast.error("This roll number is already taken in this session");
				return;
			}
		}

		setIsUpdatingStatus(true);
		try {
			// Update admission status
			await axios.patch(`/admissions/${statusUpdate.id}`, { status: statusUpdate.status });

			// If approved, add to students
			if (statusUpdate.status === "Approved" && selectedApplication) {
				// Prepare student data
				const formattedRoll = roll.padStart(3, "0");
				const sessionName = selectedApplication.session?.replace("session-", "") || "0000";
				const studentId = `STU-${sessionName}-${formattedRoll}`;
				const studentData = {
					...selectedApplication,
					studentId,
					qrCode: studentId,
					barCode: studentId,
					admissionId: selectedApplication.id,
					roll: formattedRoll,
					status: "ACTIVE",
					joinedDate: new Date().toISOString(),
				};
				// Remove the id from application to let json-server generate a new one
				const { id, ...rest } = studentData;
				await axios.post("/students", rest);
			}

			toast.success(t("statusUpdateSuccess", { status: statusUpdate.status }));
			mutate();
			setRoll("");
		} catch (err: any) {
			toast.error(tc("updateFailed"));
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
					<span className="text-muted-foreground text-xs">{row.original.id}</span>
				</div>
			),
		},
		{
			id: "class",
			accessorKey: "class",
			header: t("class"),
			cell: ({ row }) => <span className="text-sm font-medium">{row.original.class}</span>,
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
			id: "status",
			header: t("status"),
			cell: ({ row }) => {
				const app = row.original;
				const status = app.status || "Pending";

				return (
					<Select
						value={status}
						onValueChange={(val) => setStatusUpdate({ id: app.id, status: val })}
						disabled={status === "Approved"}
					>
						<SelectTrigger
							className={cn(
								"h-8 w-[120px] rounded-full border-none px-3 text-xs font-medium shadow-none ring-0",
								status === "Approved"
									? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
									: "cursor-pointer",
								status === "Rejected" &&
									"bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
								status === "Pending" &&
									"bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
							)}
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent className="p-1">
							<SelectItem className="cursor-pointer py-2 text-xs" value="Pending">
								Pending
							</SelectItem>
							<SelectItem className="cursor-pointer py-2 text-xs" value="Approved">
								Approved
							</SelectItem>
							<SelectItem className="cursor-pointer py-2 text-xs" value="Rejected">
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
				return (
					<div className="flex items-center gap-2">
						<Link href={PATHS.ADMISSION.LIST.DETAILS(app.id)} passHref>
							<Button variant="outline" size="icon-sm">
								<span>
									<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</span>
							</Button>
						</Link>
						<Link href={PATHS.ADMISSION.LIST.EDIT(app.id)} passHref>
							<Button variant="outline" size="icon-sm">
								<span>
									<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</span>
							</Button>
						</Link>
						<ConfirmationModal
							onConfirm={() => confirmDelete(app.id)}
							title={t("deleteTitle")}
							description={t("deleteDescription")}
							confirmText={tc("delete")}
							variant="destructive"
							isLoading={isDeleting && applicationToDelete === app.id}
						>
							<AlertDialogTrigger
								render={
									<Button variant="destructive" size="icon-sm">
										<Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
									</Button>
								}
							/>
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
		<Card className="p-4 shadow-none ring-0 sm:p-6">
			<CardHeader className="p-0">
				<ApplicationFilterBar filter={filter} setFilter={setFilter} />
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter filter={filter} setFilter={setFilter} resetFilters={resetFilters} />

				<DataTable<any>
					data={applications || []}
					isLoading={isLoading}
					pagination={{
						page: meta.page,
						limit: meta.limit,
						total: meta.total,
						totalPages: meta.totalPages,
						onPageChange: setPage,
						onLimitChange: setLimit,
					}}
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
					statusUpdate?.status === "Approved" ? (
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
											if (open) mutateStudents();
										}}
									>
										<DialogTrigger
											render={
												<Button variant="outline" type="button">
													<List className="h-4 w-4" />
													<span>{t("studentListButton")}</span>
												</Button>
											}
										/>
										<DialogContent className="max-w-2xl">
											<DialogHeader>
												<DialogTitle>{t("rollListTitle")}</DialogTitle>
											</DialogHeader>
											<StudentRollList
												classId={selectedApplication?.class}
												sessionId={selectedApplication?.session}
												section={selectedApplication?.section}
											/>
										</DialogContent>
									</Dialog>
								</div>
								{roll &&
									(students as any[])?.some(
										(s: any) =>
											s.roll === roll.padStart(3, "0") &&
											s.session === selectedApplication?.session &&
											s.class === selectedApplication?.class &&
											s.section === selectedApplication?.section
									) && (
										<div className="flex items-center gap-1.5 text-xs text-red-500">
											<AlertCircle className="h-3.5 w-3.5" />
											<span>{t("rollAlreadyTaken")}</span>
										</div>
									)}
							</div>
						</div>
					) : null
				}
				isLoading={isUpdatingStatus}
			/>
		</Card>
	);
}
