"use client";

import PageHeading from "@/shared/components/custom/PageHeading";
import { PATHS } from "@/shared/configs/paths.config";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { useEffect } from "react";

import TransferContainer from "@/modules/admission/transfer/components/TransferContainer";

export default function TransferStudentsPage() {
	const { setBreadcrumbs } = useBreadcrumbStore();

	useEffect(() => {
		setBreadcrumbs([
			{ label: "Home", href: "/" },
			{ label: "Dashboard", href: PATHS.DASHBOARD },
			{ label: "Admission Management", href: PATHS.ADMISSION.ROOT },
			{ label: "Transfer Students", href: PATHS.ADMISSION.TRANSFER.ROOT },
		]);
	}, [setBreadcrumbs]);

	return (
		<div className="space-y-6 print:space-y-0 print:m-0 print:p-0">
			<div className="print:hidden">
				<PageHeading routeName="TransferStudents" />
			</div>

			<TransferContainer />
		</div>
	);
}
