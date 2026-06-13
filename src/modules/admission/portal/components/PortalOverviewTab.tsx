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
import axios from "axios";
import { CheckCircle2, Copy, Globe, QrCode, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PortalOverviewTabProps {
	config: any;
	onUpdate: () => void;
}

export default function PortalOverviewTab({ config, onUpdate }: PortalOverviewTabProps) {
	const [isUpdating, setIsUpdating] = useState(false);

	const handleStatusToggle = async (checked: boolean) => {
		try {
			setIsUpdating(true);
			await axios.patch(`http://localhost:3001/portalConfig`, {
				isActive: checked,
			});
			toast.success(`Online Admission Portal is now ${checked ? "Active" : "Inactive"}`);
			onUpdate();
		} catch (error) {
			toast.error("Failed to update portal status");
		} finally {
			setIsUpdating(false);
		}
	};

	const copyLink = () => {
		navigator.clipboard.writeText("https://school.edu.bd/apply");
		toast.success("Public Portal link copied to clipboard");
	};

	return (
		<div className="space-y-6">
			{/* Master Switch */}
			<Card className="border-primary/20 bg-primary/5">
				<CardContent className="flex items-center justify-between p-6">
					<div className="space-y-1">
						<div className="flex items-center gap-2">
							<h3 className="text-lg font-semibold">Portal Status</h3>
							<Badge variant={config.isActive ? "default" : "secondary"}>
								{config.isActive ? "Live" : "Offline"}
							</Badge>
						</div>
						<p className="text-muted-foreground text-sm">
							Enable or disable the public admission portal. When offline, parents
							cannot submit new applications.
						</p>
					</div>
					<Switch
						checked={config.isActive}
						onCheckedChange={handleStatusToggle}
						disabled={isUpdating}
						className="data-[state=checked]:bg-primary"
					/>
				</CardContent>
			</Card>

			<div className="grid gap-6 md:grid-cols-2">
				{/* Quick Links */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Public Portal URL</CardTitle>
						<CardDescription>
							Share this link on your school&apos;s website or Facebook page.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex space-x-2">
							<Input readOnly value="https://school.edu.bd/apply" />
							<Button variant="secondary" onClick={copyLink}>
								<Copy className="mr-2 h-4 w-4" />
								Copy
							</Button>
						</div>
						<div className="flex items-center gap-4 pt-4">
							<div className="bg-muted flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed">
								<QrCode className="text-muted-foreground h-10 w-10" />
							</div>
							<div className="space-y-2">
								<h4 className="text-sm font-medium">QR Code</h4>
								<p className="text-muted-foreground text-xs">
									Print this QR code on admission flyers or banners for easy
									mobile access.
								</p>
								<Button size="sm" variant="outline">
									Download QR
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Quick Stats */}
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">Admission Stats</CardTitle>
						<CardDescription>
							Overview of the current online admission session.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="rounded-lg border p-3">
								<div className="text-muted-foreground flex items-center gap-2">
									<Globe className="h-4 w-4" />
									<span className="text-sm font-medium">Total Received</span>
								</div>
								<div className="mt-2 text-2xl font-bold">
									{config.stats.totalApplications}
								</div>
							</div>
							<div className="rounded-lg border p-3">
								<div className="flex items-center gap-2 text-orange-500">
									<Users className="h-4 w-4" />
									<span className="text-sm font-medium">Pending Review</span>
								</div>
								<div className="mt-2 text-2xl font-bold text-orange-500">
									{config.stats.pendingReview}
								</div>
							</div>
							<div className="rounded-lg border p-3 sm:col-span-2">
								<div className="flex items-center gap-2 text-green-600">
									<CheckCircle2 className="h-4 w-4" />
									<span className="text-sm font-medium">Approved & Admitted</span>
								</div>
								<div className="mt-2 text-2xl font-bold text-green-600">
									{config.stats.approved}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
