"use client";

import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SeatTokenTemplate } from "../dto/seat-planning.dto";
import { downloadBlob, fetchSeatTokensPdfBlob } from "../hooks/use-seat-planning-mutations";

function CardMock({ ink }: { ink: string }) {
	return (
		<div
			className="flex h-full w-full flex-col gap-1 rounded-sm border border-dashed bg-white p-1.5"
			style={{ borderColor: ink }}
		>
			<div className="flex items-center gap-1">
				<div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: ink }} />
				<div className="space-y-0.5">
					<div className="h-1 w-12 rounded-full" style={{ background: ink }} />
					<div className="h-0.5 w-8 rounded-full bg-neutral-300" />
				</div>
			</div>
			<div className="h-1.5 w-full rounded-[1px]" style={{ background: ink }} />
			<div className="flex flex-1 gap-1">
				<div className="flex-1 space-y-0.5">
					<div className="h-0.5 w-full rounded-full bg-neutral-300" />
					<div className="h-0.5 w-full rounded-full bg-neutral-300" />
					<div className="h-0.5 w-full rounded-full bg-neutral-300" />
					<div className="h-1 w-2/3 rounded-full" style={{ background: ink }} />
				</div>
				<div className="w-3 shrink-0 space-y-0.5">
					<div className="h-0.5 w-full rounded-full bg-neutral-300" />
					<div className="h-0.5 w-full rounded-full bg-neutral-300" />
				</div>
			</div>
			<div className="flex items-end gap-1">
				<div className="flex-1 space-y-0.5">
					<div className="h-0.5 w-full rounded-full bg-neutral-200" />
					<div className="h-0.5 w-3/4 rounded-full bg-neutral-200" />
				</div>
				<div className="h-3 w-3 shrink-0 rounded-full border" style={{ borderColor: ink }} />
			</div>
		</div>
	);
}

const PRESETS: {
	id: SeatTokenTemplate;
	name: string;
	description: string;
	ink: string;
}[] = [
	{
		id: "classic",
		name: "Classic",
		description: "Navy ink on cream — school mark, seat table, signature block and ink seal, closest to a formal exam card.",
		ink: "#1c3f66",
	},
	{
		id: "emerald",
		name: "Emerald",
		description: "Same certificate layout in deep emerald ink — a cooler, formal alternative to Classic.",
		ink: "#0f5132",
	},
	{
		id: "crimson",
		name: "Crimson",
		description: "Same certificate layout in deep crimson ink — a warmer, formal alternative to Classic.",
		ink: "#7a2233",
	},
];

export function SeatTokensPlayground({
	examId,
	classRoomId,
}: {
	examId: string;
	classRoomId?: string;
}) {
	const [template, setTemplate] = useState<SeatTokenTemplate | null>(null);
	const [loading, setLoading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const blobRef = useRef<Blob | null>(null);

	useEffect(() => {
		return () => {
			if (previewUrl) window.URL.revokeObjectURL(previewUrl);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const choosePreset = async (preset: SeatTokenTemplate) => {
		setTemplate(preset);
		setLoading(true);
		try {
			const blob = await fetchSeatTokensPdfBlob({ examId, classRoomId, template: preset });
			blobRef.current = blob;
			setPreviewUrl(window.URL.createObjectURL(blob));
		} catch {
			setTemplate(null);
		} finally {
			setLoading(false);
		}
	};

	const changeDesign = () => {
		if (previewUrl) window.URL.revokeObjectURL(previewUrl);
		setPreviewUrl(null);
		blobRef.current = null;
		setTemplate(null);
	};

	const download = () => {
		if (blobRef.current) {
			downloadBlob(blobRef.current, `seat-tokens-${template}.pdf`);
		}
	};

	if (!template) {
		return (
			<Card className="p-5 shadow-none ring-0">
				<h3 className="font-semibold">Choose a card design</h3>
				<p className="text-muted-foreground mt-1 text-sm">
					Pick a preset to generate the real PDF and preview it before downloading.
				</p>
				<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
					{PRESETS.map((preset) => (
						<button
							key={preset.id}
							type="button"
							onClick={() => choosePreset(preset.id)}
							className="border-border hover:border-primary hover:bg-muted/40 flex flex-col gap-3 rounded-lg border p-3 text-left transition-colors"
						>
							<div className="bg-muted/30 h-24 w-full overflow-hidden rounded-md p-2">
								<CardMock ink={preset.ink} />
							</div>
							<div>
								<p className="text-sm font-semibold">{preset.name}</p>
								<p className="text-muted-foreground mt-1 text-xs leading-relaxed">{preset.description}</p>
							</div>
						</button>
					))}
				</div>
			</Card>
		);
	}

	return (
		<Card className="p-5 shadow-none ring-0">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<Button type="button" variant="outline" onClick={changeDesign} disabled={loading}>
					<ArrowLeft className="h-4 w-4" />
					Change Design
				</Button>
				<Button type="button" onClick={download} disabled={loading || !previewUrl}>
					<Download className="h-4 w-4" />
					Download PDF
				</Button>
			</div>

			<div className="mt-4">
				{loading ? (
					<div className="text-muted-foreground flex h-[80vh] w-full items-center justify-center gap-2 rounded-md border text-sm">
						<Loader2 className="h-4 w-4 animate-spin" />
						Generating {template} preview...
					</div>
				) : previewUrl ? (
					<iframe src={previewUrl} className="h-[80vh] w-full rounded-md border" title="Seat tokens preview" />
				) : null}
			</div>
		</Card>
	);
}
