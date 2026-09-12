"use client";

import { LayoutGrid, List } from "lucide-react";

export type PaymentMethodViewMode = "grid" | "list";

interface PaymentMethodViewToggleProps {
	viewMode: PaymentMethodViewMode;
	onChange: (mode: PaymentMethodViewMode) => void;
}

export function PaymentMethodViewToggle({ viewMode, onChange }: PaymentMethodViewToggleProps) {
	return (
		<div className="bg-muted/30 flex items-center rounded-lg border p-0.5">
			<button
				type="button"
				aria-pressed={viewMode === "list"}
				onClick={() => onChange("list")}
				className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
					viewMode === "list"
						? "bg-background text-foreground shadow-sm"
						: "text-muted-foreground hover:text-foreground"
				}`}
			>
				<List className="h-3.5 w-3.5" />
				List
			</button>
			<button
				type="button"
				aria-pressed={viewMode === "grid"}
				onClick={() => onChange("grid")}
				className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
					viewMode === "grid"
						? "bg-background text-foreground shadow-sm"
						: "text-muted-foreground hover:text-foreground"
				}`}
			>
				<LayoutGrid className="h-3.5 w-3.5" />
				Grid
			</button>
		</div>
	);
}
