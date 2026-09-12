"use client";

import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";
import { useTranslations } from "next-intl";
import { AlertCircle, Medal, PhoneCall } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useIncidentSummary } from "../hooks/use-behavior-incidents";

const incidentTrendConfig = {
	count: { label: "Incidents", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

export function BehaviorStats() {
	const t = useTranslations("StudentBehavior.stats");
	const { data, isLoading } = useIncidentSummary();

	const stats = [
		{
			key: "total",
			label: t("totalIncidents"),
			desc: t("totalIncidentsDesc"),
			value: data?.totalIncidents,
			icon: AlertCircle,
			valueClass: "",
			iconClass: "text-muted-foreground",
		},
		{
			key: "pending",
			label: t("pendingGuardianMeetings"),
			desc: t("pendingGuardianMeetingsDesc"),
			value: data?.pendingGuardianMeetings,
			icon: PhoneCall,
			valueClass: "text-destructive",
			iconClass: "text-destructive",
			alert: !isLoading && Number(data?.pendingGuardianMeetings || 0) > 0,
		},
		{
			key: "appreciations",
			label: t("recentAppreciations"),
			desc: t("recentAppreciationsDesc"),
			value: data?.recentAppreciations,
			icon: Medal,
			valueClass: "text-emerald-600 dark:text-emerald-400",
			iconClass: "text-emerald-500",
		},
	];

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-3 @md/page:grid-cols-2 @xl/page:grid-cols-3">
				{stats.map((stat) => {
					const Icon = stat.icon;
					return (
						<div
							key={stat.key}
							className={cn(
								"bg-card/70 border-border/70 flex items-start justify-between rounded-md border p-4",
								stat.alert && "border-amber-500/60 bg-amber-500/10"
							)}
						>
							<div className="min-w-0 space-y-1">
								<p className="text-muted-foreground truncate text-xs font-medium">
									{stat.label}
								</p>
								{isLoading ? (
									<div className="bg-muted h-7 w-12 animate-pulse rounded" />
								) : (
									<p className={cn("text-2xl font-semibold tabular-nums", stat.valueClass)}>
										{stat.value ?? 0}
									</p>
								)}
								<p className="text-muted-foreground truncate text-xs">{stat.desc}</p>
							</div>
							<div className="relative shrink-0">
								{stat.alert && (
									<span className="absolute inset-0 rounded-full bg-amber-500/50 animate-ping" />
								)}
								<Icon className={cn("relative size-4", stat.iconClass)} />
							</div>
						</div>
					);
				})}
			</div>

			<div className="bg-card/70 border-border/70 rounded-md border p-4">
				<Tabs defaultValue="day">
					<div className="mb-3 flex flex-col gap-2 @md/page:flex-row @md/page:items-center @md/page:justify-between">
						<div>
							<p className="text-sm font-medium">Incident Trends</p>
							<p className="text-muted-foreground text-xs">This month&rsquo;s activity.</p>
						</div>
						<TabsList>
							<TabsTrigger value="day">Day Wise</TabsTrigger>
							<TabsTrigger value="category">Incident Wise</TabsTrigger>
						</TabsList>
					</div>

					<TabsContent value="day">
						<ChartContainer config={incidentTrendConfig} className="h-50 w-full">
							<LineChart
								data={data?.trend || []}
								margin={{ top: 8, right: 12, left: -18, bottom: 4 }}
							>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
								<YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
								<ChartTooltip content={<ChartTooltipContent />} />
								<Line
									type="monotone"
									dataKey="count"
									stroke="var(--color-count)"
									strokeWidth={2}
									dot={{ r: 2, fill: "var(--color-count)" }}
									activeDot={{ r: 4 }}
								/>
							</LineChart>
						</ChartContainer>
					</TabsContent>

					<TabsContent value="category">
						<ChartContainer config={incidentTrendConfig} className="h-64 w-full">
							<BarChart
								data={data?.byCategory || []}
								margin={{ top: 8, right: 12, left: -18, bottom: 32 }}
							>
								<CartesianGrid strokeDasharray="3 3" vertical={false} />
								<XAxis
									dataKey="label"
									tickLine={false}
									axisLine={false}
									fontSize={11}
									angle={-35}
									textAnchor="end"
									interval={0}
									height={60}
								/>
								<YAxis tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
								<ChartTooltip content={<ChartTooltipContent />} />
								<Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
							</BarChart>
						</ChartContainer>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
