"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Switch } from "@/shared/components/ui/switch";
import { useSWR } from "@/shared/hooks/use-swr";
import axios from "@/shared/lib/axios";
import { ClassModel } from "@/shared/models/class.model";
import { StatusEnum } from "@/shared/types/enums";
import { getLocalizedName } from "@/shared/utils/localization";
import { Pencil, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import ClassForm from "./ClassForm";

export default function ClassList() {
	const { data: classes, isLoading, mutate } = useSWR("/classes");
	const [editingClass, setEditingClass] = useState<ClassModel | null>(null);
	const [classToDelete, setClassToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);
	const t = useTranslations("Classes");
	const tc = useTranslations("Common");
	const locale = useLocale();

	const [classToChangeStatus, setClassToChangeStatus] = useState<ClassModel | null>(null);
	const [isChangingStatus, setIsChangingStatus] = useState(false);

	// serialize the data
	const serializedClasses = classes?.map((cls: any) => new ClassModel(cls));

	const confirmDelete = async (id: string) => {
		setClassToDelete(id);
		setIsDeleting(true);
		try {
			await axios.delete(`/classes/${id}`);
			toast.success("Class deleted successfully");
			mutate();
		} catch (err: any) {
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
			const status = newStatus ? "Active" : "Inactive";
			await axios.patch(`/classes/${cls.id}`, { status });
			toast.success(`Status updated to ${status}`);
			mutate();
		} catch (err: any) {
			toast.error("Failed to update status.");
		} finally {
			setIsChangingStatus(false);
			setClassToChangeStatus(null);
		}
	};

	return (
		<>
			<Card className="w-full shadow-none ring-0">
				<CardHeader>
					<CardTitle className="text-lg">{t("classList")}</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-4">
							<Skeleton className="h-[88px] w-full" />
							<Skeleton className="h-[88px] w-full" />
							<Skeleton className="h-[88px] w-full" />
						</div>
					) : !serializedClasses || serializedClasses.length === 0 ? (
						<p className="text-muted-foreground text-sm">{t("noClassesFound")}</p>
					) : (
						<div className="space-y-4">
							{serializedClasses.map((cls: ClassModel) => (
								<div
									key={cls.id}
									className="bg-card group flex items-center justify-between rounded-md border p-4"
								>
									<div className="space-y-1.5">
										<p className="flex items-center gap-2 text-lg font-medium">
											{getLocalizedName(cls.name, locale)}
											{cls.sections && cls.sections.length > 0 && (
												<span className="flex items-center gap-1">
													{cls.sections.map((sec) => (
														<Badge
															key={sec.name}
															variant="outline"
															className="bg-accent h-5 rounded-sm px-1.5 py-0 text-xs font-normal"
														>
															{sec.name}
														</Badge>
													))}
												</span>
											)}
										</p>
										<div className="text-muted-foreground space-y-1 text-sm">
											{cls.sections && cls.sections.length > 0 ? (
												cls.sections.map((sec) => (
													<div
														key={sec.name}
														className="flex items-center gap-2"
													>
														<span className="text-foreground font-medium">
															Section {sec.name}:
														</span>
														<span>Room {sec.roomNumber}</span>
														<span>|</span>
														<span>{sec.capacity} students</span>
														<span>|</span>
														<Badge
															variant="secondary"
															className="h-5 py-0 text-[10px] font-bold uppercase"
														>
															{sec.shift}
														</Badge>
													</div>
												))
											) : (
												<div className="flex items-center gap-2">
													<span>Room {cls.roomNumber}</span>
													<span>|</span>
													<span>{cls.capacity} students</span>
													<span>|</span>
													{cls.shift && (
														<Badge
															variant="secondary"
															className="h-5 py-0 text-[10px] font-bold uppercase"
														>
															{cls.shift}
														</Badge>
													)}
												</div>
											)}
										</div>
									</div>
									<div className="flex items-center gap-6">
										<div className="flex items-center gap-2">
											<ConfirmationModal
												onConfirm={() =>
													confirmStatusChange(
														cls,
														cls.status !== StatusEnum.ACTIVE
													)
												}
												title={t("statusChangeTitle")}
												description={
													cls.status === StatusEnum.ACTIVE
														? tc("changeToInactiveDesc")
														: tc("changeToActiveDesc")
												}
												confirmText={tc("changeStatus")}
												variant="default"
												isLoading={
													isChangingStatus &&
													classToChangeStatus?.id === cls.id
												}
											>
												<AlertDialogTrigger
													nativeButton={false}
													render={
														<Switch
															checked={
																cls.status === StatusEnum.ACTIVE
															}
														/>
													}
												/>
											</ConfirmationModal>
											<div
												className={`rounded-full px-2.5 py-1 text-xs font-medium ${
													cls.status === StatusEnum.ACTIVE
														? "bg-green-100 text-green-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{cls.status === StatusEnum.ACTIVE
													? "Active"
													: "Inactive"}
											</div>
										</div>
										<div className="flex items-center gap-2">
											<Button
												title={t("editClassTitle")}
												variant="outline"
												size="icon"
												onClick={() => setEditingClass(cls)}
											>
												<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
											</Button>
											<ConfirmationModal
												onConfirm={() => confirmDelete(cls.id)}
												title={t("deleteClassTitle")}
												description={t("deleteClassDescription")}
												confirmText={tc("delete")}
												variant="destructive"
												isLoading={isDeleting && classToDelete === cls.id}
											>
												<AlertDialogTrigger
													render={
														<Button
															title={t("deleteClassTitle")}
															variant="outline"
															size="icon"
														>
															<Trash2 className="h-4 w-4 text-red-500 hover:text-red-600" />
														</Button>
													}
												/>
											</ConfirmationModal>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<Dialog open={!!editingClass} onOpenChange={(open) => !open && setEditingClass(null)}>
				<DialogContent className="px-0">
					<DialogHeader className="px-6">
						<DialogTitle>{t("editClassTitle")}</DialogTitle>
					</DialogHeader>
					<ScrollArea className="max-h-[80vh] px-4">
						{editingClass && (
							<ClassForm
								initialData={editingClass}
								onSuccess={() => setEditingClass(null)}
							/>
						)}
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</>
	);
}
