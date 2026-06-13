"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { useTranslations } from "next-intl";
import { AlertCircle, Medal, PhoneCall } from "lucide-react";

export function BehaviorStats() {
	const t = useTranslations("StudentBehavior.stats");
	const { data, isLoading } = useSWR("/behaviorSummary");

	return (
		<div className="grid gap-4 md:grid-cols-3">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						{t("totalIncidents")}
					</CardTitle>
					<AlertCircle className="h-4 w-4 text-muted-foreground" />
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Skeleton className="h-8 w-16 mb-1" />
					) : (
						<div className="text-2xl font-bold">{data?.totalIncidents || 0}</div>
					)}
					<p className="text-xs text-muted-foreground">
						{t("totalIncidentsDesc")}
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						{t("pendingGuardianMeetings")}
					</CardTitle>
					<PhoneCall className="h-4 w-4 text-destructive" />
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Skeleton className="h-8 w-16 mb-1 bg-destructive/20" />
					) : (
						<div className="text-2xl font-bold text-destructive">
							{data?.pendingGuardianMeetings || 0}
						</div>
					)}
					<p className="text-xs text-muted-foreground">
						{t("pendingGuardianMeetingsDesc")}
					</p>
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
					<CardTitle className="text-sm font-medium">
						{t("recentAppreciations")}
					</CardTitle>
					<Medal className="h-4 w-4 text-emerald-500" />
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<Skeleton className="h-8 w-16 mb-1 bg-emerald-500/20" />
					) : (
						<div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
							{data?.recentAppreciations || 0}
						</div>
					)}
					<p className="text-xs text-muted-foreground">
						{t("recentAppreciationsDesc")}
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
