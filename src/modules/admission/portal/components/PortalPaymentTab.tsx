"use client";



import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Switch } from "@/shared/components/ui/switch";
import axios from "axios";
import { Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PortalPaymentTabProps {
	config: any;
	onUpdate: () => void;
}

export default function PortalPaymentTab({ config, onUpdate }: PortalPaymentTabProps) {
	const [isSaving, setIsSaving] = useState(false);
	const [payment, setPayment] = useState({
		isFeeRequired: config.payment?.isFeeRequired || false,
		feeAmount: config.payment?.feeAmount || 0,
		bkashEnabled: config.payment?.bkashEnabled || false,
		nagadEnabled: config.payment?.nagadEnabled || false,
		bkashNumber: config.payment?.bkashNumber || "",
		nagadNumber: config.payment?.nagadNumber || "",
	});

	const handleSave = async () => {
		try {
			setIsSaving(true);
			await axios.patch(`http://localhost:3001/portalConfig`, { payment });
			toast.success("Payment settings updated successfully");
			onUpdate();
		} catch (error) {
			toast.error("Failed to update payment settings");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Application Form Fee</CardTitle>
					<CardDescription>Configure if an online application form fee is required for submission.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="flex items-center justify-between rounded-lg border p-4">
						<div className="space-y-0.5">
							<Label className="text-base">Require Application Fee</Label>
							<p className="text-sm text-muted-foreground">
								Parents must pay a fee before submitting the application online.
							</p>
						</div>
						<Switch
							checked={payment.isFeeRequired}
							onCheckedChange={(checked) => setPayment({ ...payment, isFeeRequired: checked })}
						/>
					</div>

					{payment.isFeeRequired && (
						<div className="grid gap-2 max-w-sm">
							<Label>Fee Amount (BDT)</Label>
							<Input
								type="number"
								min="0"
								value={payment.feeAmount}
								onChange={(e) => setPayment({ ...payment, feeAmount: Number(e.target.value) })}
							/>
						</div>
					)}
				</CardContent>
			</Card>

			{payment.isFeeRequired && (
				<Card>
					<CardHeader>
						<CardTitle>Mobile Banking Integrations</CardTitle>
						<CardDescription>Configure merchant or personal numbers for fee collection.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="grid gap-6 sm:grid-cols-2">
							{/* bKash */}
							<div className="space-y-4 rounded-lg border p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										{/* Mock bKash logo with color */}
										<div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#e2136e] text-white font-bold text-xs">
											bKash
										</div>
										<Label className="font-semibold">Enable bKash</Label>
									</div>
									<Switch
										checked={payment.bkashEnabled}
										onCheckedChange={(checked) => setPayment({ ...payment, bkashEnabled: checked })}
									/>
								</div>
								{payment.bkashEnabled && (
									<div className="space-y-2 pt-2">
										<Label>bKash Number</Label>
										<Input
											placeholder="01XXXXXXXXX"
											value={payment.bkashNumber}
											onChange={(e) => setPayment({ ...payment, bkashNumber: e.target.value })}
										/>
									</div>
								)}
							</div>

							{/* Nagad */}
							<div className="space-y-4 rounded-lg border p-4">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										{/* Mock Nagad logo with color */}
										<div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#ED1C24] text-white font-bold text-xs">
											Nagad
										</div>
										<Label className="font-semibold">Enable Nagad</Label>
									</div>
									<Switch
										checked={payment.nagadEnabled}
										onCheckedChange={(checked) => setPayment({ ...payment, nagadEnabled: checked })}
									/>
								</div>
								{payment.nagadEnabled && (
									<div className="space-y-2 pt-2">
										<Label>Nagad Number</Label>
										<Input
											placeholder="01XXXXXXXXX"
											value={payment.nagadNumber}
											onChange={(e) => setPayment({ ...payment, nagadNumber: e.target.value })}
										/>
									</div>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			<div className="flex justify-end">
				<Button onClick={handleSave} disabled={isSaving}>
					<Save className="h-4 w-4" />
					{isSaving ? "Saving..." : "Save Payment Settings"}
				</Button>
			</div>
		</div>
	);
}
