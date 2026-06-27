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
import { usePayment } from "../../hooks/use-payments";

type Props = {
	id: string;
	open: boolean;
};

const formatValue = (value?: string | null) => value || "N/A";

function CompactPair({ label, value }: { label: string; value?: React.ReactNode }) {
	return (
		<div className="min-w-0">
			<p className="text-muted-foreground text-[11px] leading-4">{label}</p>
			<div className="mt-0.5 truncate text-sm leading-5">{value ?? "-"}</div>
		</div>
	);
}

function PaymentDetailsSkeleton() {
	return (
		<div className="space-y-4 p-4">
			{Array.from({ length: 3 }).map((_, sectionIndex) => (
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

export function PaymentDetailsSheet({ id, open }: Props) {
	const t = useTranslations("SchoolsManagementPayments");
	const { data: payment, isLoading } = usePayment(open ? id : null);

	const content = (() => {
		if (isLoading || !payment) {
			return <PaymentDetailsSkeleton />;
		}

		return (
			<div className="space-y-4 p-4">
				<div className="bg-muted/20 rounded-md border p-4">
					<h3 className="text-sm font-normal">{t("sectionAssignmentTitle")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair label="School" value={payment.school?.schoolName || "N/A"} />
						<CompactPair
							label="Subscription"
							value={payment.subscription?.plan?.name || "N/A"}
						/>
						<CompactPair
							label="Status"
							value={
								<Badge
									variant={
										payment.status === "completed"
											? "default"
											: payment.status === "failed"
												? "destructive"
												: "secondary"
									}
									className="capitalize"
								>
									{payment.status}
								</Badge>
							}
						/>
						<CompactPair
							label="Paid At"
							value={payment.paidAt ? format(new Date(payment.paidAt), "PPP") : "N/A"}
						/>
					</div>
				</div>

				<div className="bg-muted/20 rounded-md border p-4">
					<h3 className="text-sm font-normal">{t("sectionPaymentTitle")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair
							label="Amount"
							value={`${payment.amount.toLocaleString()} ${payment.currency}`}
						/>
						<CompactPair
							label="Payment Method"
							value={
								<span className="capitalize">
									{payment.method.replace(/_/g, " ")}
								</span>
							}
						/>
						<CompactPair
							label="Transaction ID"
							value={formatValue(payment.transactionId)}
						/>
						<CompactPair label="Invoice ID" value={formatValue(payment.invoiceId)} />
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
