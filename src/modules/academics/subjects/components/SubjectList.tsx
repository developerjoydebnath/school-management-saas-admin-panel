"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { TOption } from "@/shared/components/form/FilterButton";
import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Switch } from "@/shared/components/ui/switch";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { useSWR } from "@/shared/hooks/use-swr";
import { useTableData } from "@/shared/hooks/use-table-data";
import axios from "@/shared/lib/axios";
import { Subject } from "@/shared/models/subject.model";
import { StatusEnum } from "@/shared/types/enums";
import { getLocalizedName } from "@/shared/utils/localization";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import SubjectFilterBar from "./SubjectFilterBar";
import SubjectForm from "./SubjectForm";

export type SubjectFilter = {
	search: string;
	subjectType: TOption[];
	status: TOption[];
};

const initialFilters: SubjectFilter = { search: "", subjectType: [], status: [] };

export default function SubjectList() {
	const [filter, setFilter] = useState<SubjectFilter>(initialFilters);
	const t = useTranslations("Subjects");
	const tc = useTranslations("Common");
	const locale = useLocale();
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
	const [viewingSubject, setViewingSubject] = useState<Subject | null>(null);
	const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const [subjectToChangeStatus, setSubjectToChangeStatus] = useState<Subject | null>(null);
	const [isChangingStatus, setIsChangingStatus] = useState(false);

	const {
		data: subjects,
		meta,
		isLoading,
		mutate,
	} = useTableData("/subjects", {
		// page,
		// limit,
		// ...filter
	});

	const { data: classesData } = useSWR("/classes");

	// serialize the data
	const serializedSubjects = subjects?.map((subject: any) => new Subject(subject));

	const confirmDelete = async (id: string) => {
		setSubjectToDelete(id);
		setIsDeleting(true);
		try {
			await axios.delete(`/subjects/${id}`);
			toast.success("Subject deleted successfully");
			mutate();
		} catch (err: any) {
			toast.error("Failed to delete the subject. Please try again.");
		} finally {
			setIsDeleting(false);
			setSubjectToDelete(null);
		}
	};

	const confirmStatusChange = async (subject: Subject, newStatus: boolean) => {
		setSubjectToChangeStatus(subject);
		setIsChangingStatus(true);
		try {
			const status = newStatus ? StatusEnum.ACTIVE : StatusEnum.INACTIVE;
			await axios.patch(`/subjects/${subject.id}`, { status });
			toast.success(`Status updated to ${status}`);
			mutate();
		} catch (err: any) {
			toast.error("Failed to update status.");
		} finally {
			setIsChangingStatus(false);
			setSubjectToChangeStatus(null);
		}
	};

	const columns: ColumnDef<Subject>[] = [
		{
			id: "name",
			accessorKey: "name",
			header: t("subjectName"),
			cell: ({ row }) => (
				<span className="font-medium">{getLocalizedName(row.original.name, locale)}</span>
			),
		},
		{
			id: "code",
			accessorKey: "code",
			header: t("subjectCode"),
			cell: ({ row }) =>
				row.original.code ? (
					<Badge variant="secondary" className="h-5 rounded-sm px-1.5 py-0 text-xs">
						{row.original.code}
					</Badge>
				) : (
					<span className="text-muted-foreground">-</span>
				),
		},
		{
			id: "type",
			accessorKey: "type",
			header: t("subjectType"),
			cell: ({ row }) => row.original.type,
		},
		{
			id: "classes",
			accessorKey: "classes",
			header: t("assignedClasses"),
			cell: ({ row }) => {
				const classes = row.original.classes;
				if (!classes || classes.length === 0)
					return <span className="text-muted-foreground">-</span>;

				const displayedClasses = classes.slice(0, 2);
				const extraCount = classes.length - 2;

				return (
					<div className="flex max-w-[200px] flex-wrap items-center gap-1">
						{displayedClasses.map((clsId: string) => {
							const cls = classesData?.find((c: any) => c.id === clsId);
							return (
								<Badge
									key={clsId}
									variant="outline"
									className="bg-accent h-6 rounded-sm px-1.5 py-0 text-xs font-normal"
								>
									{cls ? getLocalizedName(cls.name, locale) : clsId}
								</Badge>
							);
						})}
						{extraCount > 0 && (
							<Badge
								variant="outline"
								className="bg-accent text-muted-foreground h-6 rounded-sm px-1.5 py-0 text-xs font-normal"
							>
								+{extraCount}
							</Badge>
						)}
					</div>
				);
			},
		},
		{
			id: "status",
			accessorKey: "status",
			header: t("status"),
			cell: ({ row }) => {
				const sub = row.original;
				return (
					<div className="flex items-center gap-2">
						<ConfirmationModal
							onConfirm={() =>
								confirmStatusChange(sub, sub.status !== StatusEnum.ACTIVE)
							}
							title={t("statusChangeTitle")}
							description={
								sub.status === StatusEnum.ACTIVE
									? tc("changeToInactiveDesc")
									: tc("changeToActiveDesc")
							}
							confirmText={tc("changeStatus")}
							variant="default"
							isLoading={isChangingStatus && subjectToChangeStatus?.id === sub.id}
						>
							<AlertDialogTrigger
								nativeButton={false}
								render={<Switch checked={sub.status === StatusEnum.ACTIVE} />}
							/>
						</ConfirmationModal>
						<div
							className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${
								sub.status === StatusEnum.ACTIVE
									? "bg-green-100 text-green-800"
									: "bg-red-100 text-red-800"
							}`}
						>
							{sub.status}
						</div>
					</div>
				);
			},
		},
		{
			id: "actions",
			header: t("actions"),
			cell: ({ row }) => {
				const sub = row.original;
				return (
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon-sm"
							onClick={() => setViewingSubject(sub)}
						>
							<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
						</Button>

						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.ALL,
								PERMISSIONS.ACADEMICS.SUBJECTS.ALL,
								PERMISSIONS.ACADEMICS.SUBJECTS.EDIT,
							]}
						>
							<Button
								variant="outline"
								size="icon-sm"
								onClick={() => setEditingSubject(sub)}
							>
								<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
							</Button>
						</PermissionGuard>
						<PermissionGuard
							permissions={[
								PERMISSIONS.ACADEMICS.ALL,
								PERMISSIONS.ACADEMICS.SUBJECTS.ALL,
								PERMISSIONS.ACADEMICS.SUBJECTS.DELETE,
							]}
						>
							<ConfirmationModal
								onConfirm={() => confirmDelete(sub.id)}
								title={t("deleteSubjectTitle")}
								description={t("deleteSubjectDesc")}
								confirmText={tc("delete")}
								variant="destructive"
								isLoading={isDeleting && subjectToDelete === sub.id}
							>
								<AlertDialogTrigger
									render={
										<Button variant="destructive" size="icon-sm">
											<Trash2 className="h-4 w-4" />
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

	// reset filters
	const resetFilters = () => {
		setFilter(initialFilters);
		setPage(1);
		setLimit(10);
	};

	return (
		<>
			<Card className="p-6 shadow-none ring-0">
				<CardHeader className="p-0">
					<SubjectFilterBar filter={filter} setFilter={setFilter} />
				</CardHeader>
				<CardContent className="space-y-4 p-0">
					<TableFilter
						filter={filter}
						setFilter={setFilter}
						resetFilters={resetFilters}
					/>

					<DataTable<Subject>
						data={serializedSubjects || []}
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
				open={!!viewingSubject}
				onOpenChange={(open) => !open && setViewingSubject(null)}
			>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>{t("subjectDetails")}</DialogTitle>
					</DialogHeader>
					{viewingSubject && (
						<div className="mt-4 space-y-6">
							<div className="grid grid-cols-2 gap-x-4 gap-y-6">
								<div>
									<p className="text-muted-foreground mb-1 text-xs font-medium">
										{t("subjectName")}
									</p>
									<p className="text-foreground text-sm font-medium">
										{getLocalizedName(viewingSubject.name, locale)}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground mb-1 text-xs font-medium">
										{t("subjectCode")}
									</p>
									<p className="text-foreground text-sm font-medium">
										{viewingSubject.code || "-"}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground mb-1 text-xs font-medium">
										{t("subjectType")}
									</p>
									<p className="text-foreground text-sm font-medium capitalize">
										{viewingSubject.type.toLowerCase()}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground mb-1 text-xs font-medium">
										{t("status")}
									</p>
									<Badge
										variant="outline"
										className={
											viewingSubject.status === StatusEnum.ACTIVE
												? "border-green-200 bg-green-100 text-green-800"
												: "border-red-200 bg-red-100 text-red-800"
										}
									>
										{viewingSubject.status === StatusEnum.ACTIVE
											? "Active"
											: "Inactive"}
									</Badge>
								</div>
							</div>
							<div>
								<p className="text-muted-foreground mb-2 text-xs font-medium">
									{t("assignedClasses")}
								</p>
								<div className="flex flex-wrap gap-2">
									{!viewingSubject.classes ||
									viewingSubject.classes.length === 0 ? (
										<span className="text-muted-foreground text-sm">-</span>
									) : (
										viewingSubject.classes.map((clsId: string) => {
											const cls = classesData?.find(
												(c: any) => c.id === clsId
											);
											return (
												<Badge
													key={clsId}
													variant="outline"
													className="bg-accent/50 text-foreground h-7 px-3 py-1 text-sm font-normal"
												>
													{cls
														? getLocalizedName(cls.name, locale)
														: clsId}
												</Badge>
											);
										})
									)}
								</div>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			<Dialog
				open={!!editingSubject}
				onOpenChange={(open) => !open && setEditingSubject(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("editSubjectTitle")}</DialogTitle>
					</DialogHeader>
					{editingSubject && (
						<SubjectForm
							initialData={editingSubject}
							onSuccess={() => setEditingSubject(null)}
						/>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
