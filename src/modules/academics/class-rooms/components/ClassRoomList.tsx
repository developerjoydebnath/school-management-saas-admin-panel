"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Sheet, SheetTrigger } from "@/shared/components/ui/sheet";
import { Switch } from "@/shared/components/ui/switch";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useAuthStore } from "@/shared/stores/authStore";
import { StatusEnum } from "@/shared/types/enums";
import { hasAccess } from "@/shared/utils/permission";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { deleteClassRoom, updateClassRoom } from "../hooks/use-class-room-mutations";
import { useClassRooms } from "../hooks/use-class-rooms";
import { ClassRoomModel } from "../models/class-room.model";
import { ClassRoomCreate } from "./ClassRoomCreate";
import { ClassRoomDetailsSheet } from "./ClassRoomDetailsSheet";
import ClassRoomFilterBar from "./ClassRoomFilterBar";

export type ClassRoomFilter = {
	search: string;
	status: string[];
};

const initialFilters: ClassRoomFilter = { search: "", status: [] };

function ClassRoomDetailsAction({ id }: { id: string }) {
	const [open, setOpen] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);
	const t = useTranslations("ClassRooms");

	return (
		<Sheet
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (nextOpen) setHasOpened(true);
			}}
		>
			<SheetTrigger asChild>
				<Button variant="outline" size="icon-sm" title={t("viewDetails")}>
					<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
				</Button>
			</SheetTrigger>
			<ClassRoomDetailsSheet id={id} open={hasOpened} />
		</Sheet>
	);
}

export default function ClassRoomList() {
	const [filter, setFilter] = useState<ClassRoomFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [roomToChangeStatus, setRoomToChangeStatus] = useState<ClassRoomModel | null>(null);
	const [isChangingStatus, setIsChangingStatus] = useState(false);
	const t = useTranslations("ClassRooms");
	const tc = useTranslations("Common");
	const { user } = useAuthStore((state) => state.auth);

	const { data: rooms, meta, isLoading } = useClassRooms({
		page,
		limit,
		search: filter.search,
		status: filter.status,
	});

	const confirmDelete = async (id: string) => {
		setRoomToDelete(id);
		setIsDeleting(true);
		try {
			await deleteClassRoom(id);
			toast.success("Class room deleted successfully");
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsDeleting(false);
			setRoomToDelete(null);
		}
	};

	const confirmStatusChange = async (room: ClassRoomModel, newStatus: boolean) => {
		setRoomToChangeStatus(room);
		setIsChangingStatus(true);
		try {
			const status = newStatus ? StatusEnum.ACTIVE : StatusEnum.INACTIVE;
			await updateClassRoom(room.id, { status });
			toast.success(`Status updated to ${status}`);
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsChangingStatus(false);
			setRoomToChangeStatus(null);
		}
	};

	const columns: ColumnDef<ClassRoomModel>[] = [
		{
			id: "name",
			header: t("roomName"),
			cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
		},
		{
			id: "roomNo",
			header: t("roomNo"),
			cell: ({ row }) => <span className="font-medium">{row.original.roomNo}</span>,
		},
		{
			id: "capacity",
			header: t("capacity"),
			cell: ({ row }) => <span className="font-medium">{row.original.capacity}</span>,
		},
		{
			id: "building",
			header: t("building"),
			cell: ({ row }) => (
				<span className="font-medium">
					{[row.original.building, row.original.floor].filter(Boolean).join(" / ") || "-"}
				</span>
			),
		},
		{
			id: "furniture",
			header: t("furniture"),
			cell: ({ row }) => (
				<span className="text-sm">
					Bench {row.original.highBench + row.original.lowBench}, Chair {row.original.chair}, Table {row.original.table}
				</span>
			),
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => {
				const room = row.original;
				const isActive = room.status === StatusEnum.ACTIVE;
				return (
					<PermissionGuard
						permissions={[
							PERMISSIONS.ACADEMICS.CLASS_ROOMS.EDIT,
							PERMISSIONS.ACADEMICS.CLASS_ROOMS.ALL,
							PERMISSIONS.ACADEMICS.ALL,
						]}
					>
						<ConfirmationModal
							onConfirm={() => confirmStatusChange(room, !isActive)}
							title={t("statusChangeTitle")}
							description={isActive ? tc("changeToInactiveDesc") : tc("changeToActiveDesc")}
							confirmText={tc("changeStatus")}
							variant="default"
							isLoading={isChangingStatus && roomToChangeStatus?.id === room.id}
						>
							<AlertDialogTrigger asChild>
								<div className="group flex w-fit cursor-pointer items-center gap-2">
									<Switch checked={isActive} className="pointer-events-none" />
									<span className="text-sm">{isActive ? "Active" : "Inactive"}</span>
								</div>
							</AlertDialogTrigger>
						</ConfirmationModal>
					</PermissionGuard>
				);
			},
		},
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => {
				const room = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.CLASS_ROOMS.EDIT,
								PERMISSIONS.ACADEMICS.CLASS_ROOMS.ALL,
								PERMISSIONS.ACADEMICS.ALL,
							]}
						>
							<ClassRoomDetailsAction id={room.id} />
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.CLASS_ROOMS.EDIT,
								PERMISSIONS.ACADEMICS.CLASS_ROOMS.ALL,
								PERMISSIONS.ACADEMICS.ALL,
							]}
						>
							<Button
								asChild
								variant="outline"
								size="icon-sm"
							>
								<Link href={PATHS.ACADEMICS.CLASS_ROOMS.EDIT(room.id)}>
									<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.CLASS_ROOMS.DELETE,
								PERMISSIONS.ACADEMICS.CLASS_ROOMS.ALL,
								PERMISSIONS.ACADEMICS.ALL,
							]}
						>
							<ConfirmationModal
								onConfirm={() => confirmDelete(room.id)}
								title={t("deleteTitle")}
								description={t("deleteDescription")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && roomToDelete === room.id}
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
				<ClassRoomFilterBar filter={filter} setFilter={setFilter}>
					<ClassRoomCreate />
				</ClassRoomFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter
					filter={filter}
					setFilter={setFilter}
					resetFilters={resetFilters}
					hideExport={
						!hasAccess(user, [
							PERMISSIONS.ACADEMICS.CLASS_ROOMS.ALL,
							PERMISSIONS.ACADEMICS.ALL,
						])
					}
				/>
				<DataTable
					columns={columns}
					data={rooms || []}
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
				/>
			</CardContent>
		</Card>
	);
}
