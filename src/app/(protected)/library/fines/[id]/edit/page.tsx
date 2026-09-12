"use client";

import FineForm from "@/modules/library/fines/components/FineForm";
import { useLibraryFine } from "@/modules/library/shared/hooks/use-library-fines";
import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function EditFinePage() {
	const { id } = useParams<{ id: string }>();
	const { fine, isLoading } = useLibraryFine(id);
	const t = useTranslations("LibraryFines");
	const tNav = useTranslations("Navigation");
	const { setBreadcrumbs } = useBreadcrumbStore();

	useEffect(() => {
		setBreadcrumbs([
			{ label: tNav("dashboard"), href: PATHS.DASHBOARD },
			{ label: tNav("library"), href: PATHS.LIBRARY.CATALOG.ROOT },
			{ label: tNav("library_fines"), href: PATHS.LIBRARY.FINES.ROOT },
			{ label: tNav("edit") },
		]);
	}, [setBreadcrumbs, tNav]);

	if (isLoading) {
		return (
			<div className="@container/page space-y-6">
				<PageHeading routeName="LibraryFines" />
				<div className="flex h-64 items-center justify-center">
					<div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2" />
				</div>
			</div>
		);
	}

	if (!fine) {
		return (
			<div className="@container/page space-y-6">
				<PageHeading routeName="LibraryFines" />
				<div className="flex h-64 items-center justify-center">
					<p className="text-muted-foreground">{t("notFound")}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="@container/page space-y-6">
			<PageHeading routeName="LibraryFines" />
			<FineForm
				id={id}
				isEdit
				defaultValues={{
					reason: fine.reason,
					amount: fine.amount,
					notes: fine.notes || "",
				}}
				existingBorrower={{
					type: fine.borrowerType,
					id: fine.borrowerId,
					name: fine.borrowerName,
					code: fine.borrowerCode,
				}}
			/>
		</div>
	);
}
