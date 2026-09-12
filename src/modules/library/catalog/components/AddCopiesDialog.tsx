"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
	ACQUISITION_SOURCES,
	BOOK_CONDITIONS,
} from "../../shared/dto/library.dto";
import { addBookCopies } from "../../shared/hooks/use-library";
import { AddCopiesFormValues, addCopiesSchema } from "../dto/book.dto";

const clean = (value?: string | null) => (value ? value : undefined);

/**
 * Accessioning more volumes of a title already in the catalog.
 *
 * A dialog rather than a route: this is an action on the title you are already
 * looking at, not a form for a new entity. Accession numbers are allocated
 * server-side from an atomically reserved block, so nothing here has to
 * (or may) name them.
 */
export default function AddCopiesDialog({
	open,
	onOpenChange,
	bookId,
	bookTitle,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	bookId: string;
	bookTitle: string;
}) {
	const t = useTranslations("LibraryCatalog");
	const ft = useTranslations("Forms");

	const form = useForm<AddCopiesFormValues>({
		resolver: zodResolver(addCopiesSchema as any),
		shouldFocusError: false,
		defaultValues: {
			count: 1,
			accessionDate: new Date().toISOString().slice(0, 10),
			source: "PURCHASE",
			condition: "NEW",
			donorName: "",
			billNo: "",
			rackNo: "",
			shelfNo: "",
			remarks: "",
		},
	});

	// The bill total is split across the copies, so the librarian is shown what
	// each one will actually be worth before saving.
	const watchedCount = useWatch({ control: form.control, name: "count" });
	const watchedPrice = useWatch({ control: form.control, name: "price" });
	const perCopy = useMemo(() => {
		const total = Number(watchedPrice);
		const count = Number(watchedCount);
		if (!total || !count || count < 1) return null;
		return (total / count).toFixed(2);
	}, [watchedPrice, watchedCount]);

	const sourceOptions = useMemo(
		() =>
			ACQUISITION_SOURCES.map((source) => ({
				label: t(`sourceValue.${source}`),
				value: source,
			})),
		[t],
	);

	const conditionOptions = useMemo(
		() =>
			BOOK_CONDITIONS.map((condition) => ({
				label: t(`conditionValue.${condition}`),
				value: condition,
			})),
		[t],
	);

	const onSubmit = async (data: AddCopiesFormValues) => {
		try {
			const response = await addBookCopies(bookId, {
				count: Number(data.count),
				accessionDate: clean(data.accessionDate),
				source: data.source,
				donorName: clean(data.donorName),
				billNo: clean(data.billNo),
				price: data.price,
				rackNo: clean(data.rackNo),
				shelfNo: clean(data.shelfNo),
				condition: data.condition,
				remarks: clean(data.remarks),
			});
			const numbers: string[] = response?.data?.accessionNumbers || [];
			toast.success(
				t("copiesAdded", {
					count: numbers.length,
					range: numbers.length
						? `${numbers[0]}${numbers.length > 1 ? ` – ${numbers[numbers.length - 1]}` : ""}`
						: "",
				}),
			);
			form.reset();
			onOpenChange(false);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{t("addCopies")}</DialogTitle>
					<DialogDescription>
						{t("addCopiesDescription", { title: bookTitle })}
					</DialogDescription>
				</DialogHeader>

				<form
					id="add-copies-form"
					onSubmit={form.handleSubmit(onSubmit)}
					className="grid grid-cols-1 gap-4 sm:grid-cols-2"
				>
					<InputField
						control={form.control}
						name="count"
						label={t("copyCount")}
						type="number"
						min={1}
						required
					/>
					<InputField
						control={form.control}
						name="accessionDate"
						label={t("accessionDate")}
						type="date"
					/>
					<InputField
						control={form.control}
						name="source"
						label={t("source")}
						type="native_select"
						options={sourceOptions}
					/>
					<InputField
						control={form.control}
						name="condition"
						label={t("condition")}
						type="native_select"
						options={conditionOptions}
					/>
					<InputField
						control={form.control}
						name="price"
						label={t("totalPrice")}
						type="number"
						step="0.01"
						min={0}
						placeholder="0.00"
						helperText={
							perCopy
								? t("totalPricePerCopy", { amount: perCopy })
								: t("totalPriceHelper")
						}
					/>
					<InputField
						control={form.control}
						name="rackNo"
						label={t("rackNo")}
						type="text"
					/>
					<InputField
						control={form.control}
						name="billNo"
						label={t("billNo")}
						type="text"
					/>
					<InputField
						control={form.control}
						name="donorName"
						label={t("donorName")}
						type="text"
					/>
					<InputField
						control={form.control}
						name="remarks"
						label={t("remarks")}
						type="textarea"
						fieldClass="sm:col-span-2"
					/>
				</form>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={form.formState.isSubmitting}
					>
						{ft("cancel")}
					</Button>
					<Button
						type="submit"
						form="add-copies-form"
						disabled={form.formState.isSubmitting}
					>
						{form.formState.isSubmitting ? ft("saveLoading") : ft("save")}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
