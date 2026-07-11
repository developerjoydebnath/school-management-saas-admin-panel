"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { useSWR } from "@/shared/hooks/use-swr";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import PortalOverviewTab from "./PortalOverviewTab";
import PortalPaymentTab from "./PortalPaymentTab";
import PortalSettingsTab from "./PortalSettingsTab";

export default function PortalContainer() {
	const t = useTranslations("Portal");
	const { data, isLoading, mutate } = useSWR("/admission/portal/config");

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

	const config = data?.data || data;

	return (
		<div>
			<Tabs defaultValue="overview" className="w-full">
				<TabsList className="mb-2 h-12! gap-2 border">
					<TabsTrigger value="overview" className="h-10 cursor-pointer px-4">
						{t("overview")}
					</TabsTrigger>
					<TabsTrigger value="settings" className="h-10 cursor-pointer px-4">
						{t("portalForm")}
					</TabsTrigger>
					<TabsTrigger value="payment" className="h-10 cursor-pointer px-4">
						{t("feePreview")}
					</TabsTrigger>
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
