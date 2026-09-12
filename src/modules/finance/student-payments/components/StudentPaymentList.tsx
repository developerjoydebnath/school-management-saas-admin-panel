"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Sheet, SheetTrigger } from "@/shared/components/ui/sheet";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { StudentPaymentDetails, StudentPaymentListItem } from "../dto/student-payment.dto";
import { deleteStudentPayment } from "../hooks/use-student-payment-mutations";
import { useStudentPaymentSummary, useStudentPayments } from "../hooks/use-student-payments";
import PaymentCollectionSummary from "./PaymentCollectionSummary";
import PaymentFormDialog from "./PaymentFormDialog";
import { StudentPaymentDetailsSheet } from "./StudentPaymentDetailsSheet";
import StudentPaymentFilterBar from "./StudentPaymentFilterBar";

export type StudentPaymentFilter = {
	search: string;
	status: string[];
	method: string[];
	source: string[];
	purpose: string[];
	sessionId: string[];
	classId: string[];
	sectionId: string[];
	dateFrom: string;
	dateTo: string;
};

const initialFilters: StudentPaymentFilter = {
	search: "",
	status: [],
	method: [],
	source: [],
	purpose: [],
	sessionId: [],
	classId: [],
	sectionId: [],
	dateFrom: "",
	dateTo: "",
};

function money(value: number) {
	return `BDT ${Number(value || 0).toLocaleString()}`;
}

function titleCase(value?: string | null) {
	return String(value || "-").replace(/_/g, " ");
}

function statusVariant(status: string) {
	if (status === "paid") return "default";
	if (status === "partial") return "secondary";
	if (status === "refunded") return "destructive";
	return "outline";
}

function StudentPaymentDetailsAction({ id }: { id: string }) {
	const [open, setOpen] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);

	return (
		<Sheet
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (nextOpen) setHasOpened(true);
			}}
		>
			<SheetTrigger asChild>
				<Button variant="outline" size="icon-sm">
					<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
				</Button>
			</SheetTrigger>
			<StudentPaymentDetailsSheet id={id} open={hasOpened} />
		</Sheet>
	);
}

export function StudentPaymentList() {
	const t = useTranslations("StudentPayments");
	const tc = useTranslations("Common");
	const [filter, setFilter] = useState<StudentPaymentFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [editingPayment, setEditingPayment] = useState<StudentPaymentDetails | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const { data, meta, isLoading, isError } = useStudentPayments({
		page,
		limit,
		search: filter.search,
		status: filter.status,
		method: filter.method,
		source: filter.source,
		purpose: filter.purpose,
		sessionId: filter.sessionId[0] || "",
		classId: filter.classId[0] || "",
		sectionId: filter.sectionId[0] || "",
		dateFrom: filter.dateFrom,
		dateTo: filter.dateTo,
	});

	const { data: summary } = useStudentPaymentSummary({
		sessionId: filter.sessionId[0] || undefined,
	});

	const handleSelectPurpose = (purpose: string | null) => {
		setFilter({ ...filter, purpose: purpose ? [purpose] : [] });
	};

	const confirmDelete = async (id: string) => {
		setDeletingId(id);
		try {
			await deleteStudentPayment(id);
			toast.success(t("deleteSuccess"));
		} catch {
			// Global axios interceptor already shows a toast for the error.
		} finally {
			setDeletingId(null);
		}
	};

	const columns: ColumnDef<StudentPaymentListItem>[] = [
		{
			id: "paymentNo",
			header: t("paymentNo"),
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span className="font-medium">{row.original.paymentNo}</span>
					<span className="text-muted-foreground text-xs">
						{row.original.transactionId || "-"}
					</span>
				</div>
			),
		},
		{
			id: "student",
			header: t("student"),
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span className="font-medium">{row.original.studentName}</span>
					<span className="text-muted-foreground text-xs">
						{row.original.studentCode || row.original.contact || "-"}
					</span>
				</div>
			),
		},
		{
			id: "class",
			header: t("class"),
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span>{row.original.className || "-"}</span>
					<span className="text-muted-foreground text-xs">
						{row.original.sectionName || "No section"}
					</span>
				</div>
			),
		},
		{
			id: "amount",
			header: t("amount"),
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span className="font-medium">{money(row.original.paidAmount)}</span>
					<span className="text-muted-foreground text-xs">
						Due {money(row.original.dueAmount)}
					</span>
				</div>
			),
		},
		{
			id: "method",
			header: t("method"),
			cell: ({ row }) => (
				<div className="flex flex-col capitalize">
					<span>{titleCase(row.original.paymentMethod)}</span>
					<span className="text-muted-foreground text-xs">
						{titleCase(row.original.source)}
					</span>
				</div>
			),
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => (
				<Badge variant={statusVariant(row.original.paymentStatus) as any} className="capitalize">
					{titleCase(row.original.paymentStatus)}
				</Badge>
			),
		},
		{
			id: "paidAt",
			header: t("paidAt"),
			cell: ({ row }) => (
				<span className="text-muted-foreground text-sm">
					{row.original.paidAt
						? format(new Date(row.original.paidAt), "MMM d, yyyy")
						: "-"}
				</span>
			),
		},
		{
			id: "actions",
			header: tc("actions"),
			cell: ({ row }) => (
				<div className="flex items-center gap-2">
					<PermissionGuard permissions={[PERMISSIONS.FINANCE.STUDENT_PAYMENTS.VIEW]}>
						<StudentPaymentDetailsAction id={row.original.id} />
					</PermissionGuard>
					<PermissionGuard
						permissions={[
							PERMISSIONS.FINANCE.STUDENT_PAYMENTS.EDIT,
							PERMISSIONS.FINANCE.STUDENT_PAYMENTS.ALL,
						]}
					>
						<Button
							variant="outline"
							size="icon-sm"
							title={t("editPaymentTitle")}
							onClick={() => setEditingPayment(row.original as unknown as StudentPaymentDetails)}
						>
							<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
						</Button>
					</PermissionGuard>
					<PermissionGuard
						permissions={[
							PERMISSIONS.FINANCE.STUDENT_PAYMENTS.DELETE,
							PERMISSIONS.FINANCE.STUDENT_PAYMENTS.ALL,
						]}
					>
						<ConfirmationModal
							onConfirm={() => confirmDelete(row.original.id)}
							title={t("deleteTitle")}
							description={t("deleteDescription")}
							confirmText={tc("delete")}
							variant="destructive"
							isLoading={deletingId === row.original.id}
						>
							<AlertDialogTrigger asChild>
								<Button variant="destructive" size="icon-sm">
									<Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
								</Button>
							</AlertDialogTrigger>
						</ConfirmationModal>
					</PermissionGuard>
				</div>
			),
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
				<StudentPaymentFilterBar filter={filter} setFilter={setFilter} />
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<PaymentCollectionSummary
					summary={summary}
					selectedPurpose={filter.purpose[0]}
					onSelectPurpose={handleSelectPurpose}
				/>
				<TableFilter filter={filter} setFilter={setFilter} resetFilters={resetFilters} />
				<DataTable
					columns={columns}
					data={data || []}
					isLoading={isLoading}
					error={isError}
					pagination={{
						total: meta.total,
						page,
						limit,
						totalPages: meta.totalPages,
						onPageChange: setPage,
						onLimitChange: (nextLimit) => {
							setLimit(nextLimit);
							setPage(1);
						},
					}}
				/>
			</CardContent>

			<PaymentFormDialog
				open={!!editingPayment}
				onOpenChange={(open) => {
					if (!open) setEditingPayment(null);
				}}
				mode="edit"
				initialData={editingPayment}
				onSuccess={() => setEditingPayment(null)}
			/>
		</Card>
	);
}
