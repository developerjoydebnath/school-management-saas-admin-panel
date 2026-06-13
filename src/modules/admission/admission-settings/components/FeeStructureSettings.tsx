"use client";

import { Button } from "@/shared/components/ui/button";
import { useSWR } from "@/shared/hooks/use-swr";
import axios from "@/shared/lib/axios";
import { RotateCcw, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { FeeHead } from "../types/types";
import { FeeSummaryBar } from "./FeeBars";
import { FeeHeadsTable } from "./FeeHeadsTable";
import { FeeSessionSelector } from "./FeeSessionSelector";

export default function FeeStructureSettings() {
	const t = useTranslations("AdmissionSettings");
	const [session, setSession] = useState("");

	// Load from API — json-server serves GET /feeHeads
	const { data: fees = [], mutate } = useSWR("/feeHeads");

	const updateFee = async (id: string, updates: Partial<FeeHead>) => {
		try {
			await axios.patch(`/feeHeads/${id}`, updates);
			mutate();
		} catch {
			toast.error("Failed to update fee head.");
		}
	};

	const deleteFee = async (id: string) => {
		try {
			await axios.delete(`/feeHeads/${id}`);
			mutate();
		} catch {
			toast.error("Failed to delete fee head.");
		}
	};

	const addFee = async (_fee: FeeHead) => {
		// Revalidate the full list from the server so all rows appear correctly
		await mutate();
	};

	const handleSave = () => toast.success(t("feeSaveSuccess"));

	const handleReset = async () => {
		try {
			await mutate();
			toast.info(t("feeResetSuccess"));
		} catch {
			toast.error("Failed to reload fee heads.");
		}
	};

	const totalRequired = useMemo(
		() =>
			fees
				.filter((f: FeeHead) => f.isRequired && f.isShown)
				.reduce((acc: number, f: FeeHead) => acc + f.amount, 0),
		[fees]
	);

	const totalShown = useMemo(
		() =>
			fees
				.filter((f: FeeHead) => f.isShown)
				.reduce((acc: number, f: FeeHead) => acc + f.amount, 0),
		[fees]
	);

	return (
		<div className="flex flex-col gap-6 pt-4">
			{/* Header — matches Field Configuration style */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">{t("feeStructureTitle")}</h2>
					<p className="text-muted-foreground">{t("feeStructureDescription")}</p>
				</div>
				<div className="flex gap-2">
					<Button variant="destructive" onClick={handleReset}>
						<RotateCcw className="mr-2 h-4 w-4" />
						{t("feeResetAll")}
					</Button>
					<Button onClick={handleSave}>
						<Save className="mr-2 h-4 w-4" />
						{t("feeSaveConfiguration")}
					</Button>
				</div>
			</div>

			<FeeSessionSelector session={session} onSessionChange={setSession} />

			<FeeHeadsTable fees={fees} onUpdate={updateFee} onDelete={deleteFee} onAdd={addFee} />

			<FeeSummaryBar totalRequired={totalRequired} totalShown={totalShown} />
		</div>
	);
}
