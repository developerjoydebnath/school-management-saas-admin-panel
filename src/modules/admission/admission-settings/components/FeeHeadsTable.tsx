"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Switch } from "@/shared/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { cn } from "@/shared/lib/utils";
import { LayoutGrid, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { FeeHead, FeeType } from "../types/types";
import { AddFeeHeadDialog } from "./AddFeeHeadForm";

interface FeeHeadsTableProps {
	fees: FeeHead[];
	onUpdate: (id: string, updates: Partial<FeeHead>) => void;
	onDelete: (id: string) => void;
	onAdd: (fee: FeeHead) => void;
}

export function FeeHeadsTable({ fees, onUpdate, onDelete, onAdd }: FeeHeadsTableProps) {
	const t = useTranslations("AdmissionSettings");

	return (
		<Card className="gap-0 rounded-lg py-0 shadow-none">
			<CardHeader className="flex flex-row items-center justify-between border-b bg-blue-100/10 pt-4 pb-4! dark:bg-black/20">
				<div className="flex items-center gap-3">
					<LayoutGrid className="h-5 w-5" />
					<div>
						<CardTitle className="text-base font-bold">{t("feeHeadsTitle")}</CardTitle>
						<CardDescription className="mt-0.5 text-sm">
							{t("feeHeadsDesc")}
						</CardDescription>
					</div>
				</div>
				<AddFeeHeadDialog onAdd={onAdd} />
			</CardHeader>

			<CardContent className="p-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[280px] pl-6">
								{t("feeHeadNameHeader")}
							</TableHead>
							<TableHead className="w-[150px]">{t("feeTypeHeader")}</TableHead>
							<TableHead className="w-[150px] text-right">
								{t("feeAmountHeader")}
							</TableHead>
							<TableHead className="w-[120px] text-center">
								{t("feeIsShownHeader")}
							</TableHead>
							<TableHead className="w-[200px]">{t("feeRequiredHeader")}</TableHead>
							<TableHead className="pr-6 text-right">
								{t("feeActionsHeader")}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{fees.map((fee) => (
							<FeeTableRow
								key={fee.id}
								fee={fee}
								onUpdate={onUpdate}
								onDelete={onDelete}
							/>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}

// ─── Row sub-component ────────────────────────────────────────────────────────

interface FeeTableRowProps {
	fee: FeeHead;
	onUpdate: (id: string, updates: Partial<FeeHead>) => void;
	onDelete: (id: string) => void;
}

function FeeTableRow({ fee, onUpdate, onDelete }: FeeTableRowProps) {
	const t = useTranslations("AdmissionSettings");
	const isMandatoryLocked = fee.isSystem && fee.name === "Admission Fee";

	return (
		<TableRow>
			{/* Name + badge — data from DB, not translated */}
			<TableCell className="pl-6 font-medium">
				<div className="flex items-center gap-2">
					{fee.name}
					{fee.isSystem ? (
						<Badge
							variant="secondary"
							className="h-4 border-none bg-gray-100 px-1.5 text-[10px] font-medium text-gray-600"
						>
							System
						</Badge>
					) : (
						<Badge
							variant="outline"
							className="h-4 border-blue-200 bg-blue-50 px-1.5 text-[10px] font-medium text-blue-600"
						>
							Custom
						</Badge>
					)}
				</div>
			</TableCell>

			{/* Type selector — values are stored strings, not translated */}
			<TableCell>
				<Select
					value={fee.type}
					onValueChange={(val) => val && onUpdate(fee.id, { type: val as FeeType })}
				>
					<SelectTrigger className="hover:border-input focus:border-input focus:ring-ring h-8 border-transparent bg-transparent shadow-none transition-colors focus:ring-1">
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="p-1">
						<SelectItem value="One-time">One-time</SelectItem>
						<SelectItem value="Monthly">Monthly</SelectItem>
						<SelectItem value="Yearly">Yearly</SelectItem>
					</SelectContent>
				</Select>
			</TableCell>

			{/* Amount — raw number from DB */}
			<TableCell>
				<Input
					type="number"
					className="hover:border-input focus:border-input focus:ring-ring h-8 w-full border-transparent bg-transparent text-right shadow-none transition-colors focus:ring-1"
					value={fee.amount}
					onChange={(e) => onUpdate(fee.id, { amount: Number(e.target.value) || 0 })}
				/>
			</TableCell>

			{/* Is Shown */}
			<TableCell className="text-center">
				<Switch
					checked={fee.isShown}
					onCheckedChange={(val) => onUpdate(fee.id, { isShown: val })}
				/>
			</TableCell>

			{/* Required at Admission — label is translated, value is not */}
			<TableCell>
				{isMandatoryLocked ? (
					<div className="flex items-center gap-2">
						<Switch checked disabled />
						<span className="text-xs font-semibold text-green-600">
							{t("feeMandatory")}
						</span>
					</div>
				) : (
					<div className="flex items-center gap-2">
						<Switch
							checked={fee.isRequired}
							onCheckedChange={(val) => onUpdate(fee.id, { isRequired: val })}
						/>
						<span
							className={cn(
								"text-xs font-medium",
								fee.isRequired ? "text-blue-600" : "text-gray-400"
							)}
						>
							{fee.isRequired ? t("feeMandatory") : t("feeOptional")}
						</span>
					</div>
				)}
			</TableCell>

			{/* Actions */}
			<TableCell className="pr-6 text-right">
				{fee.isSystem ? (
					<span className="text-muted-foreground mr-4">—</span>
				) : (
					<ConfirmationModal
						title={t("feeRemoveTitle")}
						description={t("feeRemoveDesc")}
						onConfirm={() => onDelete(fee.id)}
						confirmText={t("feeRemoveConfirm")}
						variant="destructive"
					>
						<AlertDialogTrigger
							render={
								<Button
									variant="ghost"
									size="icon"
									className="text-muted-foreground h-8 w-8 hover:bg-red-50 hover:text-red-600"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							}
						/>
					</ConfirmationModal>
				)}
			</TableCell>
		</TableRow>
	);
}
