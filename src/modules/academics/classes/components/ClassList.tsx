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
import { Switch } from "@/shared/components/ui/switch";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { ClassModel } from "@/shared/models/class.model";
import { useAuthStore } from "@/shared/stores/authStore";
import { StatusEnum } from "@/shared/types/enums";
import { getLocalizedName } from "@/shared/utils/localization";
import { hasAccess } from "@/shared/utils/permission";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { deleteClass, updateClass } from "../hooks/use-class-mutations";
import { useClasses } from "../hooks/use-classes";
import { ClassCreate } from "./ClassCreate";
import { ClassDetailsSheet } from "./ClassDetailsSheet";
import ClassFilterBar from "./ClassFilterBar";

export type ClassFilter = {
	search: string;
	status: string[];
	shiftId: string[];
	classRoomId: string[];
};

const initialFilters: ClassFilter = {
	search: "",
	status: [],
	shiftId: [],
	classRoomId: [],
};

function ClassDetailsAction({ id }: { id: string }) {
	const [open, setOpen] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);
	const t = useTranslations("Classes");

	return (
		<Sheet
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (nextOpen) setHasOpened(true);
			}}
		>
			<SheetTrigger asChild>
				<Button title={t("viewDetails")} variant="outline" size="icon-sm">
					<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
				</Button>
			</SheetTrigger>
			<ClassDetailsSheet id={id} open={hasOpened} />
		</Sheet>
	);
}

export default function ClassList() {
	const [filter, setFilter] = useState<ClassFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [classToDelete, setClassToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const [classToChangeStatus, setClassToChangeStatus] = useState<ClassModel | null>(null);
	const [isChangingStatus, setIsChangingStatus] = useState(false);
	const t = useTranslations("Classes");
	const tc = useTranslations("Common");
	const { user } = useAuthStore((state) => state.auth);

	const { data: classes, meta, isLoading } = useClasses({
		page,
		limit,
		search: filter.search,
		status: filter.status,
		shiftId: filter.shiftId,
		classRoomId: filter.classRoomId,
	});

	const confirmDelete = async (id: string) => {
		setClassToDelete(id);
		setIsDeleting(true);
		try {
			await deleteClass(id);
			toast.success("Class deleted successfully");
		} catch {
			toast.error("Failed to delete the class. Please try again.");
		} finally {
			setIsDeleting(false);
			setClassToDelete(null);
		}
	};

	const confirmStatusChange = async (cls: ClassModel, newStatus: boolean) => {
		setClassToChangeStatus(cls);
		setIsChangingStatus(true);
		try {
			const status = newStatus ? StatusEnum.ACTIVE : StatusEnum.INACTIVE;
			await updateClass(cls.id, { status });
			toast.success(`Status updated to ${status}`);
		} catch {
			toast.error("Failed to update status.");
		} finally {
			setIsChangingStatus(false);
			setClassToChangeStatus(null);
		}
	};

	const columns: ColumnDef<ClassModel>[] = [
		{
			id: "name",
			header: t("className"),
			cell: ({ row }) => (
				<div className="font-medium">{getLocalizedName(row.original.name, "en")}</div>
			),
		},
		{
			id: "sections",
			header: t("sections"),
			cell: ({ row }) => {
				const sections = row.original.sections || [];
				if (!sections.length) {
					return <span className="text-muted-foreground text-sm">-</span>;
				}
				return (
					<div className="flex flex-wrap gap-1">
						{sections.map((section: any) => (
							<Badge key={section.id || section.name} variant="outline">
								{section.name}
							</Badge>
						))}
					</div>
				);
			},
		},
		{
			id: "classRoom",
			header: t("classRoom"),
			cell: ({ row }) => {
				const sections = row.original.sections || [];
				if (sections.length) {
					return (
						<div className="flex flex-wrap gap-1">
							{sections.map((section: any) => (
								<Badge key={section.id || section.name} variant="secondary">
									{section.name}: {section.classRoom?.roomNo || "-"}
								</Badge>
							))}
						</div>
					);
				}
				const room = row.original.classRoom;
				return <span className="font-medium">{room?.roomNo || "-"}</span>;
			},
		},
		{
			id: "capacity",
			header: t("capacity"),
			cell: ({ row }) => {
				const sections = row.original.sections || [];
				const totalCapacity = sections.length
					? sections.reduce(
							(sum, section: any) => sum + Number(section.classRoom?.capacity || 0),
							0
						)
					: row.original.classRoom?.capacity;
				return <span className="font-medium">{totalCapacity || "-"}</span>;
			},
		},
		{
			id: "shift",
			header: t("shift"),
			cell: ({ row }) => {
				const sections = row.original.sections || [];
				if (sections.length) {
					return (
						<div className="flex flex-wrap gap-1">
							{sections.map((section: any) => (
								<Badge key={section.id || section.name} variant="secondary">
									{section.shift?.name || section.shift || "-"}
								</Badge>
							))}
						</div>
					);
				}
				return <span className="font-medium">{row.original.shift || "-"}</span>;
			},
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => {
				const cls = row.original;
				const isActive = cls.status === StatusEnum.ACTIVE;
				return (
					<PermissionGuard
						permissions={[
							PERMISSIONS.ACADEMICS.CLASSES.EDIT,
							PERMISSIONS.ACADEMICS.CLASSES.ALL,
							PERMISSIONS.ACADEMICS.ALL,
						]}
					>
						<ConfirmationModal
							onConfirm={() => confirmStatusChange(cls, !isActive)}
							title={t("statusChangeTitle")}
							description={
								isActive ? tc("changeToInactiveDesc") : tc("changeToActiveDesc")
							}
							confirmText={tc("changeStatus")}
							variant="default"
							isLoading={isChangingStatus && classToChangeStatus?.id === cls.id}
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
				const cls = row.original;
				return (
					<div className="flex items-center gap-2">
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.CLASSES.EDIT,
								PERMISSIONS.ACADEMICS.CLASSES.ALL,
								PERMISSIONS.ACADEMICS.ALL,
							]}
						>
							<ClassDetailsAction id={cls.id} />
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.CLASSES.EDIT,
								PERMISSIONS.ACADEMICS.CLASSES.ALL,
								PERMISSIONS.ACADEMICS.ALL,
							]}
						>
							<Button
								asChild
								title={t("editClassTitle")}
								variant="outline"
								size="icon-sm"
							>
								<Link href={PATHS.ACADEMICS.CLASSES.EDIT(cls.id)}>
									<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
								</Link>
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.CLASSES.DELETE,
								PERMISSIONS.ACADEMICS.CLASSES.ALL,
								PERMISSIONS.ACADEMICS.ALL,
							]}
						>
							<ConfirmationModal
								onConfirm={() => confirmDelete(cls.id)}
								title={t("deleteClassTitle")}
								description={t("deleteClassDescription")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && classToDelete === cls.id}
							>
								<AlertDialogTrigger asChild>
									<Button title={t("deleteClassTitle")} variant="destructive" size="icon-sm">
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
				<ClassFilterBar filter={filter} setFilter={setFilter}>
					<ClassCreate />
				</ClassFilterBar>
			</CardHeader>
			<CardContent className="space-y-4 p-0">
				<TableFilter
					filter={filter}
					setFilter={setFilter}
					resetFilters={resetFilters}
					hideExport={
						!hasAccess(user, [
							PERMISSIONS.ACADEMICS.CLASSES.ALL,
							PERMISSIONS.ACADEMICS.ALL,
						])
					}
				/>

				<DataTable
					columns={columns}
					data={classes || []}
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
