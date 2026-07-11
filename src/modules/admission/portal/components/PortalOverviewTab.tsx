"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Switch } from "@/shared/components/ui/switch";
import axios from "@/shared/lib/axios";
import { CheckCircle2, Clock, Copy, ExternalLink, Globe, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface PortalOverviewTabProps {
	config: any;
	onUpdate: () => void;
}

function formatDate(value?: string | null) {
	if (!value) return "Not set";
	return new Intl.DateTimeFormat("en-BD", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value));
}

export default function PortalOverviewTab({ config, onUpdate }: PortalOverviewTabProps) {
	const t = useTranslations("Portal");
	const slug = config.onlinePortalSlug || "";
	const publicPath = `/admission-form?tenant=${encodeURIComponent(slug)}&slug=${encodeURIComponent(slug)}`;
	const publicUrl =
		typeof window === "undefined" ? publicPath : `${window.location.origin}${publicPath}`;
	const isLive = Boolean(config.onlinePortalEnabled);

	const handleStatusToggle = async (checked: boolean) => {
		await axios.put("/admission/portal/config", {
			sessionId: config.sessionId,
			onlinePortalEnabled: checked,
			onlinePortalSlug: slug,
			onlinePortalOpensAt: config.onlinePortalOpensAt,
			onlinePortalClosesAt: config.onlinePortalClosesAt,
		});
		toast.success(`Online admission portal is now ${checked ? "open" : "closed"}.`);
		onUpdate();
	};

	const copyLink = async () => {
		await navigator.clipboard.writeText(publicUrl);
		toast.success("Public portal link copied.");
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardContent className="flex flex-col gap-4 px-6 md:flex-row md:items-center md:justify-between">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<CardTitle className="text-lg">{t("portalStatus")}</CardTitle>
							<Badge variant={isLive ? "default" : "secondary"}>
								{isLive ? "Open" : "Closed"}
							</Badge>
						</div>
						<CardDescription>{t("portalStatusDesc")}</CardDescription>
					</div>
					<Switch checked={isLive} onCheckedChange={handleStatusToggle} />
				</CardContent>
			</Card>

			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<Globe className="h-4 w-4" /> {t("statOnline")}
						</CardDescription>
						<CardTitle>{config.stats?.onlineApplications || 0}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<Users className="h-4 w-4" /> {t("statManual")}
						</CardDescription>
						<CardTitle>{config.stats?.manualApplications || 0}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<Clock className="h-4 w-4" /> {t("statPending")}
						</CardDescription>
						<CardTitle>{config.stats?.pendingOnlineApplications || 0}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="flex items-center gap-2">
							<CheckCircle2 className="h-4 w-4" /> {t("statApproved")}
						</CardDescription>
						<CardTitle>{config.stats?.approvedOnlineApplications || 0}</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">{t("publicUrlTitle")}</CardTitle>
					<CardDescription>{t("publicUrlDesc")}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => window.open(publicUrl, "_blank", "noopener,noreferrer")}
						>
							<ExternalLink className="h-4 w-4" />
							Open
						</Button>
						<Input value={publicUrl} readOnly />
						<Button type="button" variant="secondary" onClick={copyLink}>
							<Copy className="h-4 w-4" />
							Copy
						</Button>
					</div>
					<div className="grid gap-3 text-sm md:grid-cols-2">
						<div className="rounded-lg border p-3">
							<div className="text-muted-foreground">{t("openingTime")}</div>
							<div className="font-medium">
								{formatDate(config.onlinePortalOpensAt)}
							</div>
						</div>
						<div className="rounded-lg border p-3">
							<div className="text-muted-foreground">{t("closingTime")}</div>
							<div className="font-medium">
								{formatDate(config.onlinePortalClosesAt)}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
