"use client";

import DataTable from "@/shared/components/table/DataTable";
import TableFilter from "@/shared/components/table/TableFilter";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { PATHS } from "@/shared/configs/paths.config";
import { cn } from "@/shared/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import {
	EventParticipant,
	EventParticipantStatusEnum,
	participantStatusColors,
	participantStatusOptions,
	participantTypeOptions,
} from "../dto/participant.dto";
import { useParticipants } from "../hooks/use-participants";
import ParticipantsFilterBar from "./ParticipantsFilterBar";

export type ParticipantFilter = {
	search: string;
	participantType: string[];
	status: string[];
};

const initialFilters: ParticipantFilter = { search: "", participantType: [], status: [] };

const formatDate = (value?: string | null) =>
	value
		? new Date(value).toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			})
		: "-";

/** Cross-event roll-up — "who is signed up for what", the view a coordinator
 * wants when they're not already inside one event. */
export default function ParticipantsDirectory() {
	const t = useTranslations("Events");
	const tc = useTranslations("Common");

	const [filter, setFilter] = useState<ParticipantFilter>(initialFilters);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	const { data, meta, isLoading } = useParticipants({
		page,
		limit,
		participantType: filter.participantType.length
			? filter.participantType.join(",")
			: undefined,
		status: filter.status.length ? filter.status.join(",") : undefined,
	});

	const resetFilters = () => {
		setFilter(initialFilters);
		setPage(1);
		setLimit(10);
	};

	const columns: ColumnDef<EventParticipant>[] = [
		{
			id: "participant",
			header: t("participantName"),
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="min-w-0">
						<p className="truncate font-medium">{item.participantName || "-"}</p>
						{item.participantIdentifier && (
							<p className="text-muted-foreground truncate font-mono text-xs">
								{item.participantIdentifier}
							</p>
						)}
					</div>
				);
			},
		},
		{
			id: "participantType",
			header: t("participantType"),
			cell: ({ row }) => (
				<Badge variant="outline" className="font-normal">
					{t(`participantTypeValue.${row.original.participantType}`)}
				</Badge>
			),
		},
		{
			id: "event",
			header: t("event"),
			cell: ({ row }) => {
				const event = row.original.event;
				if (!event) return <span className="text-muted-foreground">-</span>;
				return (
					<div className="min-w-0">
						<p className="truncate font-medium">{event.title}</p>
						<p className="text-muted-foreground truncate text-xs tabular-nums">
							{formatDate(event.startDate)}
						</p>
					</div>
				);
			},
		},
		{
			id: "registeredAt",
			header: t("registeredAt"),
			cell: ({ row }) => (
				<span className="text-sm tabular-nums">{formatDate(row.original.registeredAt)}</span>
			),
		},
		{
			id: "status",
			header: t("status"),
			cell: ({ row }) => {
				const colors =
					participantStatusColors[row.original.status as EventParticipantStatusEnum];
				return (
					<Badge className={cn("border-transparent font-normal", colors?.bg, colors?.text)}>
						{t(`participantStatusValue.${row.original.status}`)}
					</Badge>
				);
			},
		},
		{
			id: "actions",
			header: tc("actions"),
			cell: ({ row }) => {
				const eventId = row.original.eventId;
				return (
					<Button asChild variant="ghost" size="sm" className="gap-2">
						<Link href={PATHS.EVENTS.SCHEDULING.DETAILS(eventId)}>
							<Eye className="size-4" />
							{t("viewEvent")}
						</Link>
					</Button>
				);
			},
		},
	];

	return (
		<div className="space-y-4">
			<ParticipantsFilterBar filter={filter} setFilter={setFilter} />
			<TableFilter filter={filter} setFilter={setFilter} resetFilters={resetFilters} />
			<DataTable
				columns={columns}
				data={data}
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
		</div>
	);
}
