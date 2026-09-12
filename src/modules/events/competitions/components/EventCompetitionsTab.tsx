"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { getLocalizedName } from "@/shared/utils/localization";
import { ListOrdered, Pencil, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { EventCompetition } from "../dto/competition.dto";
import { deleteCompetition, useCompetitions } from "../hooks/use-competitions";
import CompetitionEntriesDialog from "./CompetitionEntriesDialog";
import CompetitionFormDialog from "./CompetitionFormDialog";

export default function EventCompetitionsTab({ eventId }: { eventId: string }) {
	const t = useTranslations("Events");
	const tc = useTranslations("Common");
	const locale = useLocale();

	const { data: competitions, isLoading } = useCompetitions(eventId);
	const [formOpen, setFormOpen] = useState(false);
	const [editing, setEditing] = useState<EventCompetition | null>(null);
	const [entriesFor, setEntriesFor] = useState<EventCompetition | null>(null);
	const [busyId, setBusyId] = useState<string | null>(null);

	const openCreate = () => {
		setEditing(null);
		setFormOpen(true);
	};

	const openEdit = (competition: EventCompetition) => {
		setEditing(competition);
		setFormOpen(true);
	};

	const handleDelete = async (id: string) => {
		setBusyId(id);
		try {
			await deleteCompetition(id);
			toast.success(t("competitionDeleted"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setBusyId(null);
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-3">
				<p className="text-muted-foreground text-sm">{t("competitionsHint")}</p>
				<PermissionGuard
					permissions={[
						PERMISSIONS.EVENTS.ALL,
						PERMISSIONS.EVENTS.SCHEDULING.ALL,
						PERMISSIONS.EVENTS.SCHEDULING.CREATE,
					]}
				>
					<Button onClick={openCreate}>
						<Plus className="size-4" />
						{t("addCompetition")}
					</Button>
				</PermissionGuard>
			</div>

			{isLoading ? (
				<div className="space-y-2">
					{Array.from({ length: 3 }).map((_, i) => (
						<Skeleton key={i} className="h-20 w-full" />
					))}
				</div>
			) : !competitions.length ? (
				<div className="rounded-lg border border-dashed p-10 text-center">
					<p className="text-muted-foreground text-sm">{t("noCompetitions")}</p>
				</div>
			) : (
				<div className="space-y-3">
					{competitions.map((competition) => (
						<div
							key={competition.id}
							className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
						>
							<div className="min-w-0 space-y-1">
								<div className="flex flex-wrap items-center gap-2">
									<p className="font-medium">{competition.name}</p>
									{competition.category && (
										<Badge variant="outline" className="font-normal">
											{competition.category}
										</Badge>
									)}
									{competition.gender && (
										<Badge variant="secondary" className="font-normal capitalize">
											{competition.gender}
										</Badge>
									)}
								</div>
								<div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
									{competition.competitionType && <span>{competition.competitionType}</span>}
									{competition.class && (
										<span>
											{getLocalizedName(
												{ en: competition.class.enName, bn: competition.class.bnName },
												locale
											)}
										</span>
									)}
									<span>
										{t("entriesCount", { count: competition._count?.entries ?? 0 })}
									</span>
								</div>
							</div>

							<div className="flex shrink-0 items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setEntriesFor(competition)}
								>
									<ListOrdered className="size-4" />
									{t("manageResults")}
								</Button>
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
										title={t("editCompetition")}
										onClick={() => openEdit(competition)}
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
										onConfirm={() => handleDelete(competition.id)}
										title={t("deleteCompetitionTitle")}
										description={t("deleteCompetitionDesc")}
										confirmText={tc("delete")}
										variant="destructive"
										isLoading={busyId === competition.id}
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

			<CompetitionFormDialog
				eventId={eventId}
				open={formOpen}
				onOpenChange={setFormOpen}
				competition={editing}
			/>
			{entriesFor && (
				<CompetitionEntriesDialog
					competitionId={entriesFor.id}
					competitionName={entriesFor.name}
					open={!!entriesFor}
					onOpenChange={(open) => !open && setEntriesFor(null)}
				/>
			)}
		</div>
	);
}
