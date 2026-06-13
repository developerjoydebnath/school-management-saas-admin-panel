"use client";

import { LayoutGrid, List } from "lucide-react";

type ViewMode = "grid" | "list";

interface ViewToggleProps {
	viewMode: ViewMode;
	setViewMode: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, setViewMode }: ViewToggleProps) {
	return (
		<div className="bg-muted/30 flex items-center rounded-lg border p-0.5">
			<button
				type="button"
				onClick={() => setViewMode("grid")}
				className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
					viewMode === "grid"
						? "bg-background text-foreground shadow-sm"
						: "text-muted-foreground hover:text-foreground"
				}`}
			>
				<LayoutGrid className="h-3.5 w-3.5" />
				Grid
			</button>
			<button
				type="button"
				onClick={() => setViewMode("list")}
				className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
					viewMode === "list"
						? "bg-background text-foreground shadow-sm"
						: "text-muted-foreground hover:text-foreground"
				}`}
			>
				<List className="h-3.5 w-3.5" />
				List
			</button>
		</div>
	);
}
