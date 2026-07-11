"use client";

import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import axios from "@/shared/lib/axios";
import { RotateCcw, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { FeeHead } from "../types/types";
import { FeeSummaryBar } from "./FeeBars";
import { FeeClassAmountMatrix } from "./FeeClassAmountMatrix";
import { FeeHeadsTable } from "./FeeHeadsTable";
import { FeeSessionSelector } from "./FeeSessionSelector";

export default function FeeStructureSettings() {
	const t = useTranslations("AdmissionSettings");
	const [session, setSession] = useState("");
	const [isCopying, setIsCopying] = useState(false);

	const { data: currentSettings } = useSWR("/admission/settings/current");
	const activeSessionId = session || currentSettings?.data?.sessionId || "";
	const {
		data: feesResponse,
		isLoading,
		mutate,
	} = useSWR(
		activeSessionId ? `/admission/settings/${activeSessionId}/fee-heads` : null
	);
	const fees: FeeHead[] = feesResponse?.data || [];

	useEffect(() => {
		if (!session && currentSettings?.data?.sessionId) {
			setSession(currentSettings.data.sessionId);
		}
	}, [currentSettings?.data?.sessionId, session]);

	const updateFee = async (id: string, updates: Partial<FeeHead>) => {
		try {
			const current = fees.find((fee) => fee.id === id);
			if (!current) return;

			await axios.patch(`/admission/settings/fee-heads/${id}`, {
				...current,
				...updates,
				amount: Number(updates.amount ?? current.amount ?? 0),
			});
			await mutate();
		} catch {
			toast.error("Failed to update fee head.");
		}
	};

	const deleteFee = async (id: string) => {
		try {
			await axios.delete(`/admission/settings/fee-heads/${id}`);
			await mutate();
		} catch {
			toast.error("Failed to delete fee head.");
		}
	};

	const addFee = async (_fee: FeeHead) => {
		await mutate();
	};

	const copyFromPreviousSession = async () => {
		if (!activeSessionId) return;
		setIsCopying(true);
		try {
			await axios.post(
				`/admission/settings/${activeSessionId}/fee-heads/copy-previous`
			);
			await mutate();
			toast.success("Fee structure copied from previous session.");
		} catch {
			toast.error("Previous session fee structure was not found.");
		} finally {
			setIsCopying(false);
		}
	};

	const handleSave = async () => {
		await mutate();
		toast.success(t("feeSaveSuccess"));
	};

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
				.filter((fee) => fee.isRequired && fee.isShown)
				.reduce((acc, fee) => acc + Number(fee.amount || 0), 0),
		[fees]
	);

	const totalShown = useMemo(
		() =>
			fees
				.filter((fee) => fee.isShown)
				.reduce((acc, fee) => acc + Number(fee.amount || 0), 0),
		[fees]
	);

	return (
		<div className="flex flex-col gap-6 pt-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">
						{t("feeStructureTitle")}
					</h2>
					<p className="text-muted-foreground">{t("feeStructureDescription")}</p>
				</div>
				<div className="flex gap-2">
					<Button variant="destructive" onClick={handleReset}>
						<RotateCcw className="h-4 w-4" />
						{t("feeResetAll")}
					</Button>
					<Button onClick={handleSave}>
						<Save className="h-4 w-4" />
						{t("feeSaveConfiguration")}
					</Button>
				</div>
			</div>

			<FeeSessionSelector
				session={activeSessionId}
				onSessionChange={setSession}
				onCopyPrevious={copyFromPreviousSession}
				isCopying={isCopying}
			/>

			{isLoading ? (
				<Skeleton className="h-72 rounded-lg" />
			) : (
				<FeeHeadsTable
					sessionId={activeSessionId}
					fees={fees}
					onUpdate={updateFee}
					onDelete={deleteFee}
					onAdd={addFee}
				/>
			)}

			<FeeClassAmountMatrix fees={fees} onUpdate={updateFee} />

			<FeeSummaryBar totalRequired={totalRequired} totalShown={totalShown} />
		</div>
	);
}
