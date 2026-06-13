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
import { useSessionStore } from "@/shared/stores/session-store";
import { CalendarDays } from "lucide-react";
import React from "react";

export function SessionSwitcher() {
	const { data: sessions, isLoading } = useSWR("/sessions");
	const { selectedSessionId, setSelectedSessionId } = useSessionStore();

	React.useEffect(() => {
		if (sessions && sessions.length > 0 && !selectedSessionId) {
			const activeSession = sessions.find((s: any) => s.status === "ACTIVE") || sessions[0];
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
			<div className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 hover:bg-primary/20">
				<CalendarDays className="size-4" />
			</div>
			<div className="flex flex-col items-start leading-none">
				<Select
					value={selectedSessionId || ""}
					onValueChange={(val) => setSelectedSessionId(val || null)}
				>
					<SelectTrigger className="h-5 border-none bg-transparent text-sm font-semibold text-foreground transition-colors hover:text-primary focus:ring-0 focus-visible:ring-0 shadow-none *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:ml-1">
						<SelectValue placeholder="Select Session" />
					</SelectTrigger>
					<SelectContent align="start">
						{sessions?.map((session: any) => (
							<SelectItem key={session.id} value={session.id} className="font-medium cursor-pointer">
								{session.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	);
}
