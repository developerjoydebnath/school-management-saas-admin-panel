"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Switch } from "@/shared/components/ui/switch";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { SessionModel } from "@/shared/models/session.model";
import { useAuthStore } from "@/shared/stores/authStore";
import { StatusEnum } from "@/shared/types/enums";
import { hasAccess } from "@/shared/utils/permission";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { deleteSession, updateSession } from "../hooks/use-session-mutations";
import { useSessions } from "../hooks/use-sessions";
import { SessionCreate } from "./SessionCreate";
import SessionFilterBar from "./SessionFilterBar";
import SessionForm from "./SessionForm";

export type SessionFilter = {
	search: string;
};

const initialFilters: SessionFilter = { search: "" };

export default function SessionList() {
	const [filter, setFilter] = useState<SessionFilter>(initialFilters);
	const t = useTranslations("Sessions");
	const tc = useTranslations("Common");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const [editingSession, setEditingSession] = useState<SessionModel | null>(null);
	const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const [sessionToChangeStatus, setSessionToChangeStatus] = useState<SessionModel | null>(null);
	const [isChangingStatus, setIsChangingStatus] = useState(false);

	const { user } = useAuthStore((state) => state.auth);

	const {
		data: sessions,
		meta,
		isLoading,
	} = useSessions({
		page,
		limit,
		search: filter.search,
	});

	const confirmDelete = async (id: string) => {
		setSessionToDelete(id);
		setIsDeleting(true);
		try {
			await deleteSession(id);
			toast.success("Session deleted successfully");
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
			await updateSession(session.id, { status });
			toast.success(`Status updated to ${status}`);
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
				const isActive = session.status === StatusEnum.ACTIVE;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={
								[
									PERMISSIONS.ACADEMICS.SESSIONS.EDIT,
									PERMISSIONS.ACADEMICS.ALL,
								].filter(Boolean) as string[]
							}
						>
							<ConfirmationModal
								onConfirm={() =>
									confirmStatusChange(
										session,
										!isActive
									)
								}
								title={t("statusChangeTitle")}
								description={
									isActive
										? tc("changeToInactiveDesc")
										: tc("changeToActiveDesc")
								}
								confirmText={tc("changeStatus")}
								variant="default"
								isLoading={
									isChangingStatus && sessionToChangeStatus?.id === session.id
								}
							>
								<AlertDialogTrigger asChild>
									<div className="group flex w-fit cursor-pointer items-center gap-2">
										<Switch checked={isActive} className="pointer-events-none" />
										<span className="text-sm capitalize">
											{isActive ? "Active" : "Inactive"}
										</span>
									</div>
								</AlertDialogTrigger>
							</ConfirmationModal>
						</PermissionGuard>
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
							permissions={
								[
									PERMISSIONS.ACADEMICS.SESSIONS.EDIT,
									PERMISSIONS.ACADEMICS.ALL,
								].filter(Boolean) as string[]
							}
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
							permissions={
								[
									PERMISSIONS.ACADEMICS.SESSIONS.DELETE,
									PERMISSIONS.ACADEMICS.ALL,
								].filter(Boolean) as string[]
							}
						>
							<ConfirmationModal
								onConfirm={() => confirmDelete(session.id)}
								title={t("deleteSessionTitle")}
								description={t("deleteSessionDescription")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && sessionToDelete === session.id}
							>
								<AlertDialogTrigger asChild>
									<Button variant="destructive" size="icon-sm">
										<Trash2 />
									</Button>
								</AlertDialogTrigger>
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
		<Card className="p-6 shadow-none ring-0">
			<CardHeader className="p-0">
				<SessionFilterBar filter={filter} setFilter={setFilter}>
					<SessionCreate />
				</SessionFilterBar>
			</CardHeader>

			<CardContent className="space-y-4 p-0">
				<TableFilter
					filter={filter}
					setFilter={setFilter}
					resetFilters={resetFilters}
					hideExport={
						!hasAccess(user, [
							PERMISSIONS.ACADEMICS.SESSIONS.EXPORT,
							PERMISSIONS.ACADEMICS.ALL,
						])
					}
				/>

				<DataTable<SessionModel>
					data={sessions || []}
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

			<SessionForm
				isOpen={!!editingSession}
				initialData={editingSession}
				onClose={() => setEditingSession(null)}
			/>
		</Card>
	);
}
