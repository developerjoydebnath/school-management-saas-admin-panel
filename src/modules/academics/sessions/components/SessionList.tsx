"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Switch } from "@/shared/components/ui/switch";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useTableData } from "@/shared/hooks/use-table-data";
import axios from "@/shared/lib/axios";
import { SessionModel } from "@/shared/models/session.model";
import { StatusEnum } from "@/shared/types/enums";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import SessionForm from "./SessionForm";

export type SessionFilter = {
	search: string;
};

const initialFilters: SessionFilter = { search: "" };

export default function SessionList() {
	const [filter, setFilter] = useState<SessionFilter>(initialFilters);
	const t = useTranslations("Sessions");
	const tc = useTranslations("Common");
	const tf = useTranslations("Forms");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const [editingSession, setEditingSession] = useState<SessionModel | null>(null);
	const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const [sessionToChangeStatus, setSessionToChangeStatus] = useState<SessionModel | null>(null);
	const [isChangingStatus, setIsChangingStatus] = useState(false);

	const {
		data: sessions,
		meta,
		isLoading,
		mutate,
	} = useTableData("/sessions", {
		page,
		limit,
		search: filter.search,
	});

	const serializedSessions = sessions?.map((session: any) => new SessionModel(session));

	const confirmDelete = async (id: string) => {
		setSessionToDelete(id);
		setIsDeleting(true);
		try {
			await axios.delete(`/sessions/${id}`);
			toast.success("Session deleted successfully");
			mutate();
		} catch (err: any) {
			toast.error("Failed to delete the session. Please try again.");
		} finally {
			setIsDeleting(false);
			setSessionToDelete(null);
		}
	};

	const confirmStatusChange = async (session: SessionModel, newStatus: boolean) => {
		setSessionToChangeStatus(session);
		setIsChangingStatus(true);
		try {
			const status = newStatus ? "ACTIVE" : "INACTIVE";
			await axios.patch(`/sessions/${session.id}`, { status });
			toast.success(`Status updated to ${status}`);
			mutate();
		} catch (err: any) {
			toast.error("Failed to update status.");
		} finally {
			setIsChangingStatus(false);
			setSessionToChangeStatus(null);
		}
	};

	const columns: ColumnDef<SessionModel>[] = [
		{
			id: "name",
			accessorKey: "name",
			header: t("sessionName"),
			cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
		},
		{
			id: "year",
			accessorKey: "year",
			header: t("sessionYear"),
			cell: ({ row }) => <span className="font-medium">{row.original.year}</span>,
		},
		{
			id: "status",
			accessorKey: "status",
			header: t("status"),
			cell: ({ row }) => {
				const session = row.original;
				return (
					<div className="flex items-center gap-2">
						<ConfirmationModal
							onConfirm={() =>
								confirmStatusChange(session, session.status !== StatusEnum.ACTIVE)
							}
							title={t("statusChangeTitle")}
							description={
								session.status === StatusEnum.ACTIVE
									? tc("changeToInactiveDesc")
									: tc("changeToActiveDesc")
							}
							confirmText={tc("changeStatus")}
							variant="default"
							isLoading={isChangingStatus && sessionToChangeStatus?.id === session.id}
						>
							<AlertDialogTrigger
								nativeButton={false}
								render={<Switch checked={session.status === StatusEnum.ACTIVE} />}
							/>
						</ConfirmationModal>
						<div
							className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
								session.status === StatusEnum.ACTIVE
									? "bg-green-100 text-green-800"
									: "bg-red-100 text-red-800"
							}`}
						>
							{session.status}
						</div>
					</div>
				);
			},
		},
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => {
				const session = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={[PERMISSIONS.ACADEMICS.ALL].filter(Boolean) as string[]}
						>
							<Button
								variant="outline"
								size="icon-sm"
								onClick={() => setEditingSession(session)}
							>
								<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[PERMISSIONS.ACADEMICS.ALL].filter(Boolean) as string[]}
						>
							<ConfirmationModal
								onConfirm={() => confirmDelete(session.id)}
								title={t("deleteSessionTitle")}
								description={t("deleteSessionDescription")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && sessionToDelete === session.id}
							>
								<AlertDialogTrigger
									render={
										<Button variant="destructive" size="icon-sm">
											<Trash2 />
										</Button>
									}
								/>
							</ConfirmationModal>
						</PermissionGuard>
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
		<>
			<Card className="p-6 shadow-none ring-0">
				<CardContent className="space-y-4 p-0">
					<TableFilter
						filter={filter}
						setFilter={setFilter}
						resetFilters={resetFilters}
					/>

					<DataTable<SessionModel>
						data={serializedSessions || []}
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
			</Card>

			<Dialog
				open={!!editingSession}
				onOpenChange={(open) => !open && setEditingSession(null)}
			>
				<DialogContent className="px-0">
					<DialogHeader className="px-6">
						<DialogTitle>{t("editSession")}</DialogTitle>
					</DialogHeader>
					<ScrollArea className="max-h-[80vh] px-4">
						{editingSession && (
							<SessionForm
								initialData={editingSession}
								onSuccess={() => setEditingSession(null)}
							/>
						)}
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</>
	);
}
