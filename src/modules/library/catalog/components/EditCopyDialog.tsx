"use client";

import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BOOK_CONDITIONS } from "../../shared/dto/library.dto";
import { updateLibraryCopy } from "../../shared/hooks/use-library";

type Copy = {
	id: string;
	accessionNo: string;
	rackNo?: string | null;
	shelfNo?: string | null;
	price?: number | null;
	condition?: string | null;
	remarks?: string | null;
};

/**
 * One physical volume, corrected.
 *
 * Shelf position moves — a section is rearranged, a rack is renumbered — and it
 * moves per copy, not per title: the library may hold five copies of a set text
 * with two on the reading-room rack and three in the store.
 *
 * Price is here for the same reason. It arrives as this copy's share of the
 * delivery's bill, and a single volume can be revalued afterwards without
 * touching its siblings or rewriting the expense the school actually paid.
 */
export default function EditCopyDialog({
	copy,
	onOpenChange,
}: {
	copy: Copy | null;
	onOpenChange: (open: boolean) => void;
}) {
	const t = useTranslations("LibraryCatalog");
	const ft = useTranslations("Forms");

	const [rackNo, setRackNo] = useState("");
	const [shelfNo, setShelfNo] = useState("");
	const [price, setPrice] = useState("");
	const [condition, setCondition] = useState("GOOD");
	const [remarks, setRemarks] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (!copy) return;
		setRackNo(copy.rackNo || "");
		setShelfNo(copy.shelfNo || "");
		setPrice(copy.price === null || copy.price === undefined ? "" : String(copy.price));
		setCondition(copy.condition || "GOOD");
		setRemarks(copy.remarks || "");
	}, [copy]);

	const save = async () => {
		if (!copy) return;
		setIsSaving(true);
		try {
			await updateLibraryCopy(copy.id, {
				rackNo: rackNo.trim() || null,
				shelfNo: shelfNo.trim() || null,
				// "" clears the price rather than sending NaN.
				price: price.trim() === "" ? null : Number(price),
				condition,
				remarks: remarks.trim() || null,
			});
			toast.success(t("copyUpdated", { accessionNo: copy.accessionNo }));
			onOpenChange(false);
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={!!copy} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{t("editCopy")}</DialogTitle>
					<DialogDescription>
						{t("editCopyDescription", { accessionNo: copy?.accessionNo ?? "" })}
					</DialogDescription>
				</DialogHeader>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div className="space-y-1.5">
						<Label className="text-xs">{t("rackNo")}</Label>
						<Input
							value={rackNo}
							onChange={(event) => setRackNo(event.target.value)}
							placeholder="e.g. Rack No - C/6"
							autoFocus
						/>
					</div>
					<div className="space-y-1.5">
						<Label className="text-xs">{t("shelfNo")}</Label>
						<Input
							value={shelfNo}
							onChange={(event) => setShelfNo(event.target.value)}
							placeholder="e.g. 3"
						/>
					</div>
					<div className="space-y-1.5">
						<Label className="text-xs">{t("copyPrice")}</Label>
						<Input
							type="number"
							min={0}
							step="0.01"
							value={price}
							onChange={(event) => setPrice(event.target.value)}
							placeholder="0.00"
						/>
						<p className="text-muted-foreground text-xs">{t("copyPriceHelper")}</p>
					</div>
					<div className="space-y-1.5">
						<Label className="text-xs">{t("condition")}</Label>
						<div className="flex flex-wrap gap-1.5">
							{BOOK_CONDITIONS.map((value) => (
								<Button
									key={value}
									type="button"
									size="sm"
									variant={condition === value ? "default" : "outline"}
									onClick={() => setCondition(value)}
								>
									{t(`conditionValue.${value}`)}
								</Button>
							))}
						</div>
					</div>
					<div className="space-y-1.5 sm:col-span-2">
						<Label className="text-xs">{t("remarks")}</Label>
						<Input
							value={remarks}
							onChange={(event) => setRemarks(event.target.value)}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={isSaving}
					>
						{ft("cancel")}
					</Button>
					<Button type="button" onClick={save} disabled={isSaving}>
						{isSaving ? ft("updateLoading") : ft("update")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
