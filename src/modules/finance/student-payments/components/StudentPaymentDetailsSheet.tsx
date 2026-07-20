"use client";

import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useStudentPayment } from "../hooks/use-student-payments";

type Props = {
	id: string;
	open: boolean;
};

function money(value?: number | string | null, currency = "BDT") {
	const amount = Number(value || 0);
	return `${currency} ${amount.toLocaleString()}`;
}

function titleCase(value?: string | null) {
	return String(value || "-").replace(/_/g, " ");
}

function CompactPair({ label, value }: { label: string; value?: React.ReactNode }) {
	return (
		<div className="min-w-0">
			<p className="text-muted-foreground text-[11px] leading-4">{label}</p>
			<div className="mt-0.5 truncate text-sm leading-5 capitalize">{value ?? "-"}</div>
		</div>
	);
}

function DetailsSkeleton() {
	return (
		<div className="space-y-4 p-4">
			{Array.from({ length: 4 }).map((_, sectionIndex) => (
				<div key={sectionIndex} className="bg-muted/20 rounded-md border p-4">
					<Skeleton className="h-4 w-36" />
					<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
						{Array.from({ length: 4 }).map((__, itemIndex) => (
							<div key={itemIndex} className="space-y-2">
								<Skeleton className="h-3 w-20" />
								<Skeleton className="h-4 w-32" />
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

export function StudentPaymentDetailsSheet({ id, open }: Props) {
	const t = useTranslations("StudentPayments");
	const { data: payment, isLoading } = useStudentPayment(open ? id : null);

	const content = (() => {
		if (isLoading || !payment) return <DetailsSkeleton />;

		return (
			<div className="space-y-4 p-4">
				<div className="bg-muted/20 rounded-md border p-4">
					<h3 className="text-sm font-normal">{t("sectionPaymentTitle")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair label="Payment No" value={payment.paymentNo} />
						<CompactPair
							label="Status"
							value={
								<Badge variant={payment.paymentStatus === "paid" ? "default" : "secondary"}>
									{titleCase(payment.paymentStatus)}
								</Badge>
							}
						/>
						<CompactPair label="Purpose" value={titleCase(payment.purpose)} />
						<CompactPair label="Source" value={titleCase(payment.source)} />
						<CompactPair label="Method" value={titleCase(payment.paymentMethod)} />
						<CompactPair
							label="Paid At"
							value={payment.paidAt ? format(new Date(payment.paidAt), "PPP") : "-"}
						/>
					</div>
				</div>

				<div className="bg-muted/20 rounded-md border p-4">
					<h3 className="text-sm font-normal">{t("sectionStudentTitle")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair label="Student" value={payment.studentName} />
						<CompactPair label="Student/Application No" value={payment.studentCode || "-"} />
						<CompactPair label="Class" value={payment.className || "-"} />
						<CompactPair label="Section" value={payment.sectionName || "-"} />
						<CompactPair label="Contact" value={payment.contact || "-"} />
						<CompactPair
							label="Admission Application"
							value={payment.admissionApplication?.applicationNo || "-"}
						/>
					</div>
				</div>

				<div className="bg-muted/20 rounded-md border p-4">
					<h3 className="text-sm font-normal">{t("sectionAmountTitle")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair label="Original Amount" value={money(payment.originalAmount)} />
						<CompactPair label="Required Amount" value={money(payment.requiredAmount)} />
						<CompactPair label="Paid Amount" value={money(payment.paidAmount)} />
						<CompactPair label="Due Amount" value={money(payment.dueAmount)} />
						<CompactPair label="Discount Amount" value={money(payment.discountAmount)} />
						<CompactPair label="Discount Source" value={titleCase(payment.discountSource)} />
						<CompactPair label="Discount Type" value={titleCase(payment.discountType)} />
						<CompactPair label="Discount Scope" value={titleCase(payment.discountScope)} />
					</div>
				</div>

				<div className="bg-muted/20 rounded-md border p-4">
					<h3 className="text-sm font-normal">{t("sectionReferenceTitle")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair label="Transaction ID" value={payment.transactionId || "-"} />
						<CompactPair label="Payment ID" value={payment.paymentId || "-"} />
						<CompactPair label="Gateway" value={payment.paymentGateway || "-"} />
						<CompactPair label="Provider" value={payment.gatewayProvider || "-"} />
						<CompactPair label="Receipt No" value={payment.receiptNo || "-"} />
						<CompactPair label="Created By" value={payment.createdByName || "-"} />
					</div>
				</div>

				{payment.notes && (
					<div className="bg-muted/20 rounded-md border p-4">
						<h3 className="mb-3 text-sm font-normal">Notes</h3>
						<div className="text-muted-foreground text-sm whitespace-pre-wrap">
							{payment.notes}
						</div>
					</div>
				)}
			</div>
		);
	})();

	return (
		<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[64vw] @5xl/body:w-[54vw]">
			<SheetHeader className="border-b p-4">
				<SheetTitle className="text-base leading-6 font-normal">
					{t("detailsTitle")}
				</SheetTitle>
				<SheetDescription className="text-xs">{t("detailsDescription")}</SheetDescription>
			</SheetHeader>
			<ScrollArea className="h-[calc(100vh-73px)]">{content}</ScrollArea>
		</SheetContent>
	);
}
