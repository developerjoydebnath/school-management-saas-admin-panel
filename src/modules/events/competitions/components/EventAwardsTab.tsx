"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { Award, Medal, Pencil, Plus, Trash2, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { EventAward } from "../dto/competition.dto";
import { deleteAward, useAwards } from "../hooks/use-competitions";
import AwardFormDialog from "./AwardFormDialog";

export default function EventAwardsTab({ eventId }: { eventId: string }) {
	const t = useTranslations("Events");
	const tc = useTranslations("Common");

	const { data: awards, isLoading } = useAwards(eventId);
	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState<EventAward | null>(null);
	const [busyId, setBusyId] = useState<string | null>(null);

	const openCreate = () => {
		setEditing(null);
		setFormOpen(true);
	};

	const openEdit = (award: EventAward) => {
		setEditing(award);
		setFormOpen(true);
	};

	const handleDelete = async (id: string) => {
		setBusyId(id);
		try {
			await deleteAward(id);
			toast.success(t("awardDeleted"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setBusyId(null);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-3">
				<p className="text-muted-foreground text-sm">{t("awardsHint")}</p>
				<PermissionGuard
					permissions={[
						PERMISSIONS.EVENTS.ALL,
						PERMISSIONS.EVENTS.SCHEDULING.ALL,
						PERMISSIONS.EVENTS.SCHEDULING.CREATE,
					]}
				>
					<Button onClick={openCreate}>
						<Plus className="size-4" />
						{t("addAward")}
					</Button>
				</PermissionGuard>
			</div>

			{isLoading ? (
				<div className="space-y-2">
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={i} className="h-20 w-full" />
					))}
				</div>
			) : !awards.length ? (
				<div className="rounded-lg border border-dashed p-10 text-center">
					<p className="text-muted-foreground text-sm">{t("noAwards")}</p>
				</div>
			) : (
				<div className="space-y-3">
					{awards.map((award) => (
						<div
							key={award.id}
							className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
						>
							<div className="min-w-0 space-y-1">
								<div className="flex flex-wrap items-center gap-2">
									<Award className="text-muted-foreground size-4 shrink-0" />
									<p className="font-medium">{award.awardName}</p>
									{award.position != null && (
										<Badge variant="secondary" className="font-normal">
											#{award.position}
										</Badge>
									)}
									{award.competition ? (
										<Badge variant="outline" className="font-normal">
											{award.competition.name}
										</Badge>
									) : (
										<Badge variant="outline" className="font-normal">
											{t("standaloneAward")}
										</Badge>
									)}
								</div>
								{award.winnerName && (
									<p className="text-sm">{award.winnerName}</p>
								)}
								{award.prizeDescription && (
									<p className="text-muted-foreground text-xs">{award.prizeDescription}</p>
								)}
								<div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
									{award.certificateIssued && (
										<span className="flex items-center gap-1">
											<Award className="size-3" />
											{t("certificateIssued")}
										</span>
									)}
									{award.medalIssued && (
										<span className="flex items-center gap-1">
											<Medal className="size-3" />
											{t("medalIssued")}
										</span>
									)}
									{award.trophyIssued && (
										<span className="flex items-center gap-1">
											<Trophy className="size-3" />
											{t("trophyIssued")}
										</span>
									)}
								</div>
							</div>

							<div className="flex shrink-0 items-center gap-2">
								<PermissionGuard
									permissions={[
										PERMISSIONS.EVENTS.ALL,
										PERMISSIONS.EVENTS.SCHEDULING.ALL,
										PERMISSIONS.EVENTS.SCHEDULING.EDIT,
									]}
								>
									<Button
										variant="outline"
										size="icon-sm"
										title={t("editAward")}
										onClick={() => openEdit(award)}
									>
										<Pencil className="size-4" />
									</Button>
								</PermissionGuard>
								<PermissionGuard
									permissions={[
										PERMISSIONS.EVENTS.ALL,
										PERMISSIONS.EVENTS.SCHEDULING.ALL,
										PERMISSIONS.EVENTS.SCHEDULING.DELETE,
									]}
								>
									<ConfirmationModal
										onConfirm={() => handleDelete(award.id)}
										title={t("deleteAwardTitle")}
										description={t("deleteAwardDesc")}
										confirmText={tc("delete")}
										variant="destructive"
										isLoading={busyId === award.id}
									>
										<AlertDialogTrigger asChild>
											<Button variant="destructive" size="icon-sm">
												<Trash2 className="size-4" />
											</Button>
										</AlertDialogTrigger>
									</ConfirmationModal>
								</PermissionGuard>
							</div>
						</div>
					))}
				</div>
			)}

			<AwardFormDialog
				eventId={eventId}
				open={formOpen}
				onOpenChange={setFormOpen}
				award={editing}
			/>
		</div>
	);
}
