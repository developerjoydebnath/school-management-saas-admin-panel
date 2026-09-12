"use client";

import { cn } from "@/shared/lib/utils";
import {
	Bus,
	BookOpen,
	FileText,
	GraduationCap,
	Home,
	Library,
	LucideIcon,
	Package,
} from "lucide-react";

export type PaymentCollectionSummaryByPurpose = {
	purpose: string;
	total: number;
	count: number;
};

export type PaymentCollectionSummaryData = {
	month: string;
	byPurpose: PaymentCollectionSummaryByPurpose[];
	totalCollected: number;
	totalCount: number;
};

type PaymentCollectionSummaryProps = {
	summary?: PaymentCollectionSummaryData;
	selectedPurpose?: string;
	onSelectPurpose: (purpose: string | null) => void;
};

function money(value: number) {
	return `BDT ${Number(value || 0).toLocaleString()}`;
}

const PURPOSE_CARDS: { purpose: string; icon: LucideIcon; label: string }[] = [
	{ purpose: "admission_fee", icon: GraduationCap, label: "Admission Fee" },
	{ purpose: "tuition_fee", icon: BookOpen, label: "Tuition Fee" },
	{ purpose: "exam_fee", icon: FileText, label: "Exam Fee" },
	{ purpose: "transport_fee", icon: Bus, label: "Transport Fee" },
	{ purpose: "library_fee", icon: Library, label: "Library Fee" },
	{ purpose: "hostel_fee", icon: Home, label: "Hostel Fee" },
	{ purpose: "other", icon: Package, label: "Other" },
];

export default function PaymentCollectionSummary({
	summary,
	selectedPurpose,
	onSelectPurpose,
}: PaymentCollectionSummaryProps) {
	if (!summary) {
		return (
			<div className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-4">
				{Array.from({ length: 7 }).map((_, index) => (
					<div
						key={index}
						className="border-border/70 bg-card/70 h-28 animate-pulse rounded-md border"
					/>
				))}
			</div>
		);
	}

	const byPurpose = new Map(
		(summary.byPurpose || []).map((item) => [item.purpose, item])
	);

	return (
		<div className="space-y-3">
			<div className="flex flex-col gap-1 @3xl:flex-row @3xl:items-center @3xl:justify-between">
				<p className="text-sm font-medium">This Month</p>
				<p className="text-muted-foreground text-xs">
					{summary.month} &middot; {money(summary.totalCollected)} collected across{" "}
					{summary.totalCount} payments
				</p>
			</div>
			<div className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-4">
				{PURPOSE_CARDS.map((card) => {
					const Icon = card.icon;
					const stat = byPurpose.get(card.purpose);
					const total = stat?.total || 0;
					const count = stat?.count || 0;
					const isSelected = selectedPurpose === card.purpose;

					return (
						<button
							key={card.purpose}
							type="button"
							onClick={() => onSelectPurpose(isSelected ? null : card.purpose)}
							className={cn(
								"bg-card/70 border-border/70 flex min-h-28 w-full flex-col items-start gap-2 rounded-md border p-4 text-left transition-colors hover:bg-card",
								isSelected && "border-primary bg-primary/10"
							)}
						>
							<Icon
								className={cn(
									"size-4",
									isSelected ? "text-primary" : "text-muted-foreground"
								)}
							/>
							<div className="space-y-1">
								<p className="text-muted-foreground text-sm">{card.label}</p>
								<p className="text-2xl font-semibold tabular-nums">{money(total)}</p>
								<p className="text-muted-foreground text-xs">
									{count} payments this month
								</p>
							</div>
						</button>
					);
				})}
			</div>
		</div>
	);
}
