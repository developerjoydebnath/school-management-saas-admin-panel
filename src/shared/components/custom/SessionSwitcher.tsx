"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { SessionModel } from "@/shared/models/session.model";
import { useSessionStore } from "@/shared/stores/session-store";
import React, { useMemo } from "react";

export function SessionSwitcher() {
	const { data: rawSessions, isLoading } = useSWR("/sessions/active-list");
	const { selectedSessionId, setSelectedSessionId } = useSessionStore();

	const sessions: SessionModel[] = useMemo(() => {
		return Array.isArray(rawSessions?.data)
			? rawSessions.data.map((s: any) => new SessionModel(s))
			: [];
	}, [rawSessions]);

	React.useEffect(() => {
		if (sessions.length > 0 && !selectedSessionId) {
			const activeSession = sessions.find((s) => s.status === "ACTIVE") || sessions[0];
			if (activeSession) {
				setSelectedSessionId(activeSession.id);
			}
		}
	}, [sessions, selectedSessionId, setSelectedSessionId]);

	if (isLoading) {
		return (
			<div className="flex items-center gap-2">
				<Skeleton className="size-8 rounded-lg" />
				<div className="flex flex-col gap-1">
					<Skeleton className="h-2 w-10" />
					<Skeleton className="h-4 w-16" />
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2 select-none">
			<div className="flex flex-col items-start leading-none">
				<Select
					value={selectedSessionId || ""}
					onValueChange={(val) => setSelectedSessionId(val || null)}
					disabled={isLoading || sessions.length === 0}
				>
					<SelectTrigger className="text-foreground hover:text-primary h-5 border-none bg-transparent text-sm font-semibold shadow-none transition-colors focus:ring-0 focus-visible:ring-0 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:ml-1">
						<SelectValue placeholder="Select Session">
							{sessions.find((s) => s.id === selectedSessionId)?.name}
						</SelectValue>
					</SelectTrigger>
					<SelectContent align="start">
						{sessions.map((session) => (
							<SelectItem
								key={session.id}
								value={session.id}
								className="cursor-pointer font-medium"
							>
								{session.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
