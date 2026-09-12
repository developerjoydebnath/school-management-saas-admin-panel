"use client";

import InputField from "@/shared/components/form/InputField";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { PATHS } from "@/shared/configs/paths.config";
import { uploadImage } from "@/shared/services/uploadApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
	ACQUISITION_SOURCES,
	LANGUAGES,
} from "../../shared/dto/library.dto";
import {
	createLibraryBook,
	updateLibraryBook,
	useLibraryCategoryOptions,
} from "../../shared/hooks/use-library";
import { BookFormValues, bookSchema } from "../dto/book.dto";

type Props = {
	id?: string;
	defaultValues: BookFormValues;
	isEdit?: boolean;
};

const clean = (value?: string | null) => (value ? value : undefined);

/**
 * Adding a title, and accessioning its first copies in the same act.
 *
 * A book arriving at the desk is one event. Making the librarian save a title
 * and then navigate to a second screen to record the physical volumes is how
 * catalogues end up full of titles with no copies behind them — so the copy
 * details are part of this form on create, and disappear on edit (further
 * copies are added from the title's own page, where the register lives).
 */
export default function BookForm({ id, defaultValues, isEdit = false }: Props) {
	const router = useRouter();
	const t = useTranslations("LibraryCatalog");
	const ft = useTranslations("Forms");
	const tc = useTranslations("Common");
	const { options: categories, isLoading: isLoadingCategories } =
		useLibraryCategoryOptions();

	const form = useForm<BookFormValues>({
		resolver: zodResolver(bookSchema as any),
		shouldFocusError: false,
		defaultValues,
	});

	const coverPlaceholder = useWatch({
		control: form.control,
		name: "coverPlaceholder",
	});
	const isReference = useWatch({ control: form.control, name: "isReference" });

	// Same split as the Add copies dialog: the figure entered is the delivery's
	// bill, and each copy carries its share.
	const initialCopies = useWatch({ control: form.control, name: "initialCopies" });
	const initialPrice = useWatch({ control: form.control, name: "initialPrice" });
	const perCopy = useMemo(() => {
		const total = Number(initialPrice);
		const count = Number(initialCopies);
		if (!total || !count || count < 1) return null;
		return (total / count).toFixed(2);
	}, [initialPrice, initialCopies]);

	const categoryOptions = useMemo(
		() =>
			(categories as any[]).map((category) => ({
				label: category.nameBn
					? `${category.name} — ${category.nameBn}`
					: category.name,
				value: category.id,
			})),
		[categories],
	);

	const languageOptions = useMemo(
		() =>
			LANGUAGES.map((language) => ({
				label: t(`languageValue.${language.labelKey}`),
				value: language.value,
			})),
		[t],
	);

	const sourceOptions = useMemo(
		() =>
			ACQUISITION_SOURCES.map((source) => ({
				label: t(`sourceValue.${source}`),
				value: source,
			})),
		[t],
	);

	const onSubmit = async (data: BookFormValues) => {
		const payload: Record<string, unknown> = {
			title: data.title,
			titleBn: clean(data.titleBn),
			author: data.author,
			coAuthors: clean(data.coAuthors),
			translator: clean(data.translator),
			publisher: clean(data.publisher),
			edition: clean(data.edition),
			publishYear: data.publishYear,
			isbn: clean(data.isbn),
			language: data.language,
			categoryId: data.categoryId,
			ddcNumber: clean(data.ddcNumber),
			callNumber: clean(data.callNumber),
			pages: data.pages,
			subject: clean(data.subject),
			classLevel: clean(data.classLevel),
			isReference: data.isReference,
			summary: clean(data.summary),
			coverPlaceholder: clean(data.coverPlaceholder),
		};

		try {
			// The cover is held as a File until submit, then uploaded and replaced
			// by its URL — the convention every form in this app uses.
			if (data.coverUrl instanceof File) {
				const uploaded = await uploadImage(data.coverUrl, "library_book");
				payload.coverUrl = uploaded.url;
				payload.coverPlaceholder = uploaded.placeholder;
				payload.coverMediaId = uploaded.mediaId;
			} else if (typeof data.coverUrl === "string" && data.coverUrl) {
				payload.coverUrl = data.coverUrl;
			}

			if (isEdit && id) {
				await updateLibraryBook(id, payload);
				toast.success(t("updateSuccess"));
				router.push(PATHS.LIBRARY.CATALOG.DETAILS(id));
				return;
			}

			const copies = Number(data.initialCopies || 0);
			if (copies > 0) {
				payload.initialCopies = copies;
				payload.initialCopyDetails = {
					count: copies,
					price: data.initialPrice,
					rackNo: clean(data.initialRackNo),
					source: data.initialSource,
					accessionDate: clean(data.initialAccessionDate),
					donorName: clean(data.initialDonorName),
					billNo: clean(data.initialBillNo),
				};
			}

			const response = await createLibraryBook(payload);
			toast.success(t("createSuccess"));
			const newId = response?.data?.id;
			router.push(
				newId ? PATHS.LIBRARY.CATALOG.DETAILS(newId) : PATHS.LIBRARY.CATALOG.ROOT,
			);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="mx-auto max-w-5xl space-y-6"
		>
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{isEdit ? t("editTitle") : t("createTitle")}</CardTitle>
					<CardDescription>
						{isEdit ? t("editDescription") : t("createDescription")}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
					<InputField
						control={form.control}
						name="title"
						label={t("bookTitle")}
						type="text"
						placeholder="e.g. Pather Panchali"
						required
					/>
					<InputField
						control={form.control}
						name="titleBn"
						label={t("titleBn")}
						type="text"
						placeholder="যেমন: পথের পাঁচালী"
					/>
					<InputField
						control={form.control}
						name="author"
						label={t("author")}
						type="text"
						placeholder="e.g. Bibhutibhushan Bandyopadhyay"
						required
					/>
					<InputField
						control={form.control}
						name="coAuthors"
						label={t("coAuthors")}
						type="text"
					/>
					<InputField
						control={form.control}
						name="translator"
						label={t("translator")}
						type="text"
					/>
					<InputField
						control={form.control}
						name="publisher"
						label={t("publisher")}
						type="text"
						placeholder="e.g. Bangla Academy"
					/>
					<InputField
						control={form.control}
						name="edition"
						label={t("edition")}
						type="text"
						placeholder="e.g. 5th"
					/>
					<InputField
						control={form.control}
						name="publishYear"
						label={t("publishYear")}
						type="number"
						placeholder="e.g. 2019"
					/>
					<InputField
						control={form.control}
						name="isbn"
						label={t("isbn")}
						type="text"
						helperText={t("isbnHelper")}
					/>
					<InputField
						control={form.control}
						name="language"
						label={t("language")}
						type="select"
						options={languageOptions}
					/>
					<InputField
						control={form.control}
						name="categoryId"
						label={t("category")}
						type="select"
						placeholder={
							isLoadingCategories ? tc("loading") : t("selectCategory")
						}
						options={categoryOptions}
					/>
					<InputField
						control={form.control}
						name="classLevel"
						label={t("classLevel")}
						type="text"
						placeholder="e.g. Class 6-8"
						helperText={t("classLevelHelper")}
					/>
					{/* DDC is what BD school and college libraries are taught to use;
					    the call number is the DDC class plus the author cutter that
					    actually goes on the spine label. Neither is mandatory — the
					    Bangla collection is usually shelved by category alone. */}
					<InputField
						control={form.control}
						name="ddcNumber"
						label={t("ddcNumber")}
						type="text"
						placeholder="e.g. 891.443"
						helperText={t("ddcHelper")}
					/>
					<InputField
						control={form.control}
						name="callNumber"
						label={t("callNumber")}
						type="text"
						placeholder="e.g. 891.443 BAN"
					/>
					<InputField
						control={form.control}
						name="subject"
						label={t("subject")}
						type="text"
					/>
					<InputField
						control={form.control}
						name="pages"
						label={t("pages")}
						type="number"
					/>
					<InputField
						control={form.control}
						name="coverUrl"
						label={t("cover")}
						type="file"
						placeholderBase64={coverPlaceholder}
						fieldClass="col-span-full @3xl/page:col-span-1"
					/>
					{/* A switch renders its own inline label, so without this it would
					    sit a label's height higher than the upload box beside it. */}
					<InputField
						control={form.control}
						name="isReference"
						label={t("isReference")}
						type="switch"
						alignWithLabel
						helperText={
							isReference ? t("isReferenceOnHelper") : t("isReferenceHelper")
						}
					/>
					<InputField
						control={form.control}
						name="summary"
						label={t("summary")}
						type="textarea"
						fieldClass="col-span-full"
					/>
				</CardContent>
			</Card>

			{!isEdit && (
				<Card className="shadow-none ring-0">
					<CardHeader>
						<CardTitle>{t("accessionTitle")}</CardTitle>
						<CardDescription>{t("accessionDescription")}</CardDescription>
					</CardHeader>
					<CardContent className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
						<InputField
							control={form.control}
							name="initialCopies"
							label={t("copyCount")}
							type="number"
							min={0}
							helperText={t("copyCountHelper")}
						/>
						<InputField
							control={form.control}
							name="initialAccessionDate"
							label={t("accessionDate")}
							type="date"
						/>
						<InputField
							control={form.control}
							name="initialSource"
							label={t("source")}
							type="select"
							options={sourceOptions}
						/>
						<InputField
							control={form.control}
							name="initialPrice"
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
							name="initialRackNo"
							label={t("rackNo")}
							type="text"
							placeholder="e.g. R-01"
						/>
						<InputField
							control={form.control}
							name="initialBillNo"
							label={t("billNo")}
							type="text"
						/>
						<InputField
							control={form.control}
							name="initialDonorName"
							label={t("donorName")}
							type="text"
							helperText={t("donorHelper")}
							fieldClass="col-span-full @3xl/page:col-span-1"
						/>
					</CardContent>
				</Card>
			)}

			<div className="bg-background/95 sticky bottom-0 z-10 flex justify-end gap-3 rounded-md p-4 shadow-lg backdrop-blur">
				<Button
					variant="outline"
					type="button"
					onClick={() => router.push(PATHS.LIBRARY.CATALOG.ROOT)}
					disabled={form.formState.isSubmitting}
				>
					{ft("cancel")}
				</Button>
				<Button type="submit" disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting
						? isEdit
							? ft("updateLoading")
							: ft("saveLoading")
						: isEdit
							? ft("update")
							: ft("save")}
				</Button>
			</div>
		</form>
	);
}
