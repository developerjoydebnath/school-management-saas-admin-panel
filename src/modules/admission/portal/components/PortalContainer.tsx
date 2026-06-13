"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useSWR } from "@/shared/hooks/use-swr";
import { Loader2 } from "lucide-react";
import PortalOverviewTab from "./PortalOverviewTab";
import PortalPaymentTab from "./PortalPaymentTab";
import PortalSettingsTab from "./PortalSettingsTab";

export default function PortalContainer() {
	const { data, isLoading, mutate } = useSWR("/portalConfig");

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!data) {
		return (
			<div className="py-10 text-center text-red-500">
				Failed to load portal configuration.
			</div>
		);
	}

	const config = data;

	return (
		<div className="space-y-6">
			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="mb-4 grid w-full grid-cols-3 lg:w-[600px]">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="settings">Settings & Dates</TabsTrigger>
					<TabsTrigger value="payment">Payment Setup</TabsTrigger>
				</TabsList>

				<TabsContent value="overview">
					<PortalOverviewTab config={config} onUpdate={() => mutate()} />
				</TabsContent>

				<TabsContent value="settings">
					<PortalSettingsTab config={config} onUpdate={() => mutate()} />
				</TabsContent>

				<TabsContent value="payment">
					<PortalPaymentTab config={config} onUpdate={() => mutate()} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
