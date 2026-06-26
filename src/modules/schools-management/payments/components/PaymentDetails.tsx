"use client";

import { Badge } from "@/shared/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { PaymentModel } from "../../models/payment.model";

type Props = {
	payment: PaymentModel;
};

const formatValue = (value?: string | null) => value || "N/A";

export function PaymentDetails({ payment }: Props) {
	const t = useTranslations("SchoolsManagementPayments");

	return (
		<div className="grid gap-6">
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("detailsTitle")}</CardTitle>
					<CardDescription>{t("detailsDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
					<div>
						<div className="text-muted-foreground text-sm">School</div>
						<div className="font-medium">{payment.school?.schoolName || "N/A"}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Subscription</div>
						<div className="font-medium">{payment.subscription?.plan?.name || "N/A"}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Status</div>
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
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Paid At</div>
						<div className="font-medium">
							{payment.paidAt ? format(new Date(payment.paidAt), "PPP") : "N/A"}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("sectionPaymentTitle")}</CardTitle>
					<CardDescription>{t("sectionPaymentDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
					<div>
						<div className="text-muted-foreground text-sm">Amount</div>
						<div className="font-medium">
							{payment.amount.toLocaleString()} {payment.currency}
						</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Payment Method</div>
						<div className="font-medium capitalize">
							{payment.method.replace(/_/g, " ")}
						</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Transaction ID</div>
						<div className="font-medium">{formatValue(payment.transactionId)}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Invoice ID</div>
						<div className="font-medium">{formatValue(payment.invoiceId)}</div>
					</div>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("sectionReferenceTitle")}</CardTitle>
					<CardDescription>{t("sectionReferenceDescription")}</CardDescription>
				</CardHeader>
				<CardContent>
					<div>
						<div className="text-muted-foreground text-sm">Notes</div>
						<div className="font-medium whitespace-pre-wrap">{formatValue(payment.notes)}</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
