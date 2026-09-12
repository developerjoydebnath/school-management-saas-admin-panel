"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/shared/components/ui/native-select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { cn } from "@/shared/lib/utils";
import { Trash2, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import {
	EventParticipantStatusEnum,
	participantStatusColors,
	participantStatusOptions,
} from "../dto/participant.dto";
import {
	removeParticipant,
	updateParticipantStatus,
	useEventRoster,
} from "../hooks/use-participants";
import AddParticipantsDialog from "./AddParticipantsDialog";

const formatDate = (value?: string | null) =>
	value
		? new Date(value).toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			})
		: "-";

export default function EventParticipantsTab({
	eventId,
	approvalRequired,
}: {
	eventId: string;
	approvalRequired?: boolean;
}) {
	const t = useTranslations("Events");
	const tc = useTranslations("Common");
	const [addOpen, setAddOpen] = useState(false);
	const [busyId, setBusyId] = useState<string | null>(null);

	const { participants, tally, total, isLoading } = useEventRoster(eventId);

	const handleStatus = async (id: string, status: EventParticipantStatusEnum) => {
		setBusyId(id);
		try {
			await updateParticipantStatus(id, status);
			toast.success(t("participantStatusUpdated"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setBusyId(null);
		}
	};

	const handleRemove = async (id: string) => {
		setBusyId(id);
		try {
			await removeParticipant(id);
			toast.success(t("participantRemoved"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setBusyId(null);
		}
	};

	// An event that doesn't gate on approval never uses the APPROVED state,
	// so offering it in the dropdown would just produce a 400 from the API.
	const statusChoices = approvalRequired
		? participantStatusOptions
		: participantStatusOptions.filter(
				(option) => option.value !== EventParticipantStatusEnum.APPROVED
			);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap items-center gap-2 text-sm">
					<Badge variant="secondary" className="font-normal">
						{t("totalParticipants")}: {total}
					</Badge>
					{Object.entries(tally).map(([status, count]) => {
						const colors =
							participantStatusColors[status as EventParticipantStatusEnum];
						return (
							<Badge
								key={status}
								className={cn("border-transparent font-normal", colors?.bg, colors?.text)}
							>
								{t(`participantStatusValue.${status}`)}: {count}
							</Badge>
						);
					})}
				</div>
				<PermissionGuard
					permissions={[
						PERMISSIONS.EVENTS.ALL,
						PERMISSIONS.EVENTS.PARTICIPANTS.ALL,
						PERMISSIONS.EVENTS.PARTICIPANTS.CREATE,
					]}
				>
					<Button onClick={() => setAddOpen(true)}>
						<UserPlus className="size-4" />
						{t("addParticipants")}
					</Button>
				</PermissionGuard>
			</div>

			{isLoading ? (
				<div className="space-y-2">
					{Array.from({ length: 5 }).map((_, i) => (
						<Skeleton key={i} className="h-12 w-full" />
					))}
				</div>
			) : !participants.length ? (
				<div className="rounded-lg border border-dashed p-10 text-center">
					<p className="text-muted-foreground text-sm">{t("noParticipants")}</p>
				</div>
			) : (
				<div className="overflow-x-auto rounded-md border">
					<Table>
						<TableHeader>
							<TableRow className="bg-muted/50">
								<TableHead>{t("participantName")}</TableHead>
								<TableHead>{t("participantType")}</TableHead>
								<TableHead>{t("registeredAt")}</TableHead>
								<TableHead className="w-[180px]">{t("status")}</TableHead>
								<TableHead className="text-right">{tc("actions")}</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{participants.map((participant) => (
								<TableRow key={participant.id}>
									<TableCell>
										<div className="min-w-0">
											<p className="truncate font-medium">
												{participant.participantName || "-"}
											</p>
											{participant.participantIdentifier && (
												<p className="text-muted-foreground truncate font-mono text-xs">
													{participant.participantIdentifier}
												</p>
											)}
										</div>
									</TableCell>
									<TableCell>
										<Badge variant="outline" className="font-normal">
											{t(`participantTypeValue.${participant.participantType}`)}
										</Badge>
									</TableCell>
									<TableCell className="text-sm tabular-nums">
										{formatDate(participant.registeredAt)}
									</TableCell>
									<TableCell>
										<PermissionGuard
											permissions={[
												PERMISSIONS.EVENTS.ALL,
												PERMISSIONS.EVENTS.PARTICIPANTS.ALL,
												PERMISSIONS.EVENTS.PARTICIPANTS.EDIT,
											]}
											fallback={
												<Badge
													className={cn(
														"border-transparent font-normal",
														participantStatusColors[participant.status]?.bg,
														participantStatusColors[participant.status]?.text
													)}
												>
													{t(`participantStatusValue.${participant.status}`)}
												</Badge>
											}
										>
											<NativeSelect
												name={`status-${participant.id}`}
												value={participant.status}
												disabled={busyId === participant.id}
												onChange={(e) =>
													handleStatus(
														participant.id,
														e.target.value as EventParticipantStatusEnum
													)
												}
												className="h-9"
											>
												{statusChoices.map((option) => (
													<NativeSelectOption key={option.value} value={option.value}>
														{t(`participantStatusValue.${option.value}`)}
													</NativeSelectOption>
												))}
											</NativeSelect>
										</PermissionGuard>
									</TableCell>
									<TableCell className="text-right">
										<PermissionGuard
											permissions={[
												PERMISSIONS.EVENTS.ALL,
												PERMISSIONS.EVENTS.PARTICIPANTS.ALL,
												PERMISSIONS.EVENTS.PARTICIPANTS.DELETE,
											]}
										>
											<ConfirmationModal
												onConfirm={() => handleRemove(participant.id)}
												title={t("removeParticipantTitle")}
												description={t("removeParticipantDesc")}
												confirmText={tc("delete")}
												variant="destructive"
												isLoading={busyId === participant.id}
											>
												<AlertDialogTrigger asChild>
													<Button variant="destructive" size="icon-sm">
														<Trash2 className="size-4" />
													</Button>
												</AlertDialogTrigger>
											</ConfirmationModal>
										</PermissionGuard>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}

			<AddParticipantsDialog
				eventId={eventId}
				open={addOpen}
				onOpenChange={setAddOpen}
				existingIds={participants.map((p) => p.participantId)}
			/>
		</div>
	);
}
