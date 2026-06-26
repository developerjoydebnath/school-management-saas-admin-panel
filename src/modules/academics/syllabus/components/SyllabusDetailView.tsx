"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { useSWR } from "@/shared/hooks/use-swr";
import axios from "@/shared/lib/axios";
import { format } from "date-fns";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { SyllabusDetail } from "../dto/syllabus.dto";
import SyllabusForm from "./SyllabusForm";

interface SyllabusDetailViewProps {
	classId: string;
}

export default function SyllabusDetailView({ classId }: SyllabusDetailViewProps) {
	const t = useTranslations("Syllabus");
	const tc = useTranslations("Common");
	const { data: details, isLoading, mutate } = useSWR(`/syllabus_details?classId=${classId}`);

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingDetail, setEditingDetail] = useState<SyllabusDetail | null>(null);

	const handleCreate = async (data: any) => {
		try {
			await axios.post("/syllabus_details", { ...data, classId });
			toast.success(t("addSuccess"));
			mutate();
			setIsCreateOpen(false);
		} catch (error) {
			toast.error(t("addError"));
		}
	};

	const handleEdit = async (data: any) => {
		if (!editingDetail) return;
		try {
			await axios.put(`/syllabus_details/${editingDetail.id}`, { ...data, classId });
			toast.success(t("updateSuccess"));
			mutate();
			setEditingDetail(null);
		} catch (error) {
			toast.error(t("updateError"));
		}
	};

	const handleDelete = async (id: string) => {
		if (confirm(t("deleteConfirm"))) {
			try {
				await axios.delete(`/syllabus_details/${id}`);
				toast.success(t("deleteSuccess"));
				mutate();
			} catch (error) {
				toast.error(t("deleteError"));
			}
		}
	};

	if (isLoading) {
		return <Skeleton className="h-64 w-full" />;
	}

	return (
		<div className="space-y-4">
			<div className="flex justify-end">
				<Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
					<DialogTrigger asChild><Button />
						<Plus className="h-4 w-4" />
						{t("addSyllabus")}
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{t("addSyllabusTitle")}</DialogTitle>
						</DialogHeader>
						<ScrollArea className="max-h-[80vh] px-2">
							<SyllabusForm
								onSuccess={handleCreate}
								onCancel={() => setIsCreateOpen(false)}
							/>
						</ScrollArea>
					</DialogContent>
				</Dialog>
			</div>

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{t("subject")}</TableHead>
							<TableHead>{t("term")}</TableHead>
							<TableHead>{t("topics")}</TableHead>
							<TableHead>{t("completionDate")}</TableHead>
							<TableHead>{t("status")}</TableHead>
							<TableHead className="text-right">{t("actions")}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{!details || details.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center">
									{t("noSyllabusData")}
								</TableCell>
							</TableRow>
						) : (
							details?.map((item: SyllabusDetail) => (
								<TableRow key={item.id}>
									<TableCell className="font-medium">{item.subject}</TableCell>
									<TableCell>{item.term}</TableCell>
									<TableCell
										className="max-w-[200px] truncate"
										title={item.topics}
									>
										{item.topics}
									</TableCell>
									<TableCell>
										{format(new Date(item.completionDate), "dd MMM yyyy")}
									</TableCell>
									<TableCell>
										<Badge
											variant={
												item.status === "Completed"
													? "default"
													: item.status === "In Progress"
														? "secondary"
														: "outline"
											}
										>
											{item.status === "Completed"
												? t("completed")
												: item.status === "In Progress"
													? t("inProgress")
													: t("pending")}
										</Badge>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => setEditingDetail(item)}
											>
												<Pencil className="text-muted-foreground h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleDelete(item.id)}
											>
												<Trash2 className="h-4 w-4 text-red-500" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<Dialog open={!!editingDetail} onOpenChange={(open) => !open && setEditingDetail(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("editSyllabusTitle")}</DialogTitle>
					</DialogHeader>
					<ScrollArea className="max-h-[80vh] px-2">
						{editingDetail && (
							<SyllabusForm
								initialData={editingDetail}
								onSuccess={handleEdit}
								onCancel={() => setEditingDetail(null)}
							/>
						)}
					</ScrollArea>
				</DialogContent>
			</Dialog>
		</div>
	);
}
