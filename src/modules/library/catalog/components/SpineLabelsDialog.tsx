"use client";

import { StudentBarcode } from "@/shared/components/custom/StudentBarcode";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Printer } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type Copy = {
	id: string;
	accessionNo: string;
	barcode?: string | null;
	callNumber?: string | null;
	rackNo?: string | null;
};

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	bookTitle: string;
	callNumber?: string | null;
	copies: Copy[];
};

/** The id the print stylesheet keys off. */
export const PRINT_ROOT_ID = "library-print-root";

/**
 * A label sheet is a physical object, so it is always black on white.
 *
 * These are literals rather than theme tokens on purpose. The barcode is drawn
 * by JsBarcode with `lineColor: "currentColor"`, so in dark mode the bars
 * inherited a near-white colour and printed invisibly onto white paper.
 * Pinning `color` gives `currentColor` something correct to resolve to.
 */
const SHEET_STYLE = {
	backgroundColor: "#ffffff",
	color: "#000000",
	printColorAdjust: "exact",
	WebkitPrintColorAdjust: "exact",
} as const;

/**
 * Printable spine labels, browser-rendered rather than server-generated.
 *
 * Deliberate: this app already prints ID cards this way (IdCardPreview), and
 * `jsbarcode` is a frontend dependency — the backend has no barcode library at
 * all. The grid is sized in millimetres so an A4 sheet comes out dimensionally
 * correct, and each label carries dashed cut guides.
 *
 * The sheet is rendered TWICE: once inside the dialog as an on-screen preview,
 * and once into its own node at the end of `document.body` which only exists
 * during printing.
 *
 * That duplication is the fix for a real bug. A Radix dialog is `position:
 * fixed` and centred with a `-50%` transform, and — the part that actually bit
 * — `DialogPortal` renders no element of its own, because Radix merges it away
 * with `asChild`. So there was nothing stable in the DOM to aim a print rule
 * at: the sheet printed clipped to the top-left corner, two labels of ten.
 * Printing from a plain block element in normal body flow has none of those
 * problems and paginates by itself.
 */
export default function SpineLabelsDialog({
	open,
	onOpenChange,
	bookTitle,
	callNumber,
	copies,
}: Props) {
	const t = useTranslations("LibraryCatalog");
	const [selected, setSelected] = useState<Record<string, boolean>>({});
	const [isMounted, setIsMounted] = useState(false);

	// createPortal needs a real document, which the server render does not have.
	useEffect(() => setIsMounted(true), []);

	const chosen = useMemo(() => {
		const picked = copies.filter((copy) => selected[copy.id]);
		// Nothing ticked means "all of them" — the common case is printing the
		// labels for a whole delivery at once.
		return picked.length ? picked : copies;
	}, [copies, selected]);

	const toggle = (id: string) =>
		setSelected((current) => ({ ...current, [id]: !current[id] }));

	/**
	 * Marks the body while this dialog is open so the print stylesheet knows to
	 * swap the app for the sheet.
	 *
	 * Scoped with a class rather than a bare `body > *` rule because the student
	 * ID cards print from an ordinary page: an unscoped rule would hide the app
	 * shell there too and print a blank sheet.
	 */
	useEffect(() => {
		if (!open) return;
		const CLASS = "library-label-print";
		document.body.classList.add(CLASS);
		return () => document.body.classList.remove(CLASS);
	}, [open]);

	const print = () => window.print();

	const sheet = (
		<div
			style={SHEET_STYLE}
			className="grid grid-cols-3 gap-[3mm] rounded-md p-[4mm]"
		>
			{chosen.map((copy) => (
				<div
					key={copy.id}
					style={SHEET_STYLE}
					className="flex h-[28mm] break-inside-avoid flex-col items-center justify-between border border-dashed border-black p-[2mm] text-center"
				>
					<p className="line-clamp-2 text-[7pt] leading-tight font-medium">
						{bookTitle}
					</p>
					{(copy.callNumber || callNumber) && (
						<p className="font-mono text-[8pt] font-semibold">
							{copy.callNumber || callNumber}
						</p>
					)}
					{/* `currentColor` resolves to the #000 pinned above, so the bars are
					    black in both app themes. */}
					<StudentBarcode
						studentId={copy.barcode || copy.accessionNo}
						height={22}
						width={1}
						className="max-w-full"
					/>
					<p className="font-mono text-[7pt]">{copy.accessionNo}</p>
				</div>
			))}
		</div>
	);

	return (
		<>
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
					<DialogHeader>
						<DialogTitle>{t("printLabels")}</DialogTitle>
						<DialogDescription>{t("printLabelsDescription")}</DialogDescription>
					</DialogHeader>

					<div className="space-y-3">
						<p className="text-muted-foreground text-xs">
							{t("labelsSelectHint", { count: chosen.length })}
						</p>
						<div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto @xl:grid-cols-3">
							{copies.map((copy) => (
								<label
									key={copy.id}
									className="hover:bg-accent/40 flex items-center gap-2 rounded border px-2 py-1.5 text-sm"
								>
									<Checkbox
										checked={!!selected[copy.id]}
										onCheckedChange={() => toggle(copy.id)}
									/>
									<span className="truncate font-mono text-xs">
										{copy.accessionNo}
									</span>
								</label>
							))}
						</div>
					</div>

					{sheet}

					<DialogFooter>
						<Button type="button" onClick={print}>
							<Printer className="size-4" />
							{t("print")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* The copy that actually reaches the paper: a plain block at the end of
			    body, hidden on screen and revealed only by the print stylesheet. */}
			{isMounted &&
				open &&
				createPortal(
					<div id={PRINT_ROOT_ID} className="hidden" aria-hidden>
						{sheet}
					</div>,
					document.body,
				)}
		</>
	);
}
