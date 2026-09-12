"use client";

import BookForm from "@/modules/library/catalog/components/BookForm";
import { BookFormValues, emptyBook } from "@/modules/library/catalog/dto/book.dto";
import { useLibraryBook } from "@/modules/library/shared/hooks/use-library";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function EditBookPage() {
	const { id } = useParams<{ id: string }>();
	const { book, isLoading } = useLibraryBook(id);
	const t = useTranslations("LibraryCatalog");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("library"), href: PATHS.LIBRARY.CATALOG.ROOT },
			{ label: tNav("library_catalog"), href: PATHS.LIBRARY.CATALOG.ROOT },
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	if (isLoading) {
		return (
			<div className="@container/page space-y-6">
				<PageHeading routeName="LibraryCatalog" />
				<div className="flex h-64 items-center justify-center">
					<div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
				</div>
			</div>
		);
	}

	if (!book) {
		return (
			<div className="@container/page space-y-6">
				<PageHeading routeName="LibraryCatalog" />
				<div className="flex h-64 items-center justify-center">
					<p className="text-muted-foreground">{t("notFound")}</p>
				</div>
			</div>
		);
	}

	const defaultValues: BookFormValues = {
		...emptyBook,
		title: book.title,
		titleBn: book.titleBn || "",
		author: book.author,
		coAuthors: book.coAuthors || "",
		translator: book.translator || "",
		publisher: book.publisher || "",
		edition: book.edition || "",
		publishYear: book.publishYear ?? undefined,
		isbn: book.isbn || "",
		language: book.language || "bn",
		categoryId: book.categoryId || undefined,
		ddcNumber: book.ddcNumber || "",
		callNumber: book.callNumber || "",
		pages: book.pages ?? undefined,
		subject: book.subject || "",
		classLevel: book.classLevel || "",
		isReference: !!book.isReference,
		summary: book.summary || "",
		coverUrl: book.coverUrl || null,
		coverPlaceholder: book.coverPlaceholder || null,
		// Copies are accessioned from the title's own page, never re-created by
		// an edit — the accession block is not rendered in edit mode.
		initialCopies: 0,
	};

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="LibraryCatalog" />
			<BookForm id={id} defaultValues={defaultValues} isEdit />
		</div>
	);
}
