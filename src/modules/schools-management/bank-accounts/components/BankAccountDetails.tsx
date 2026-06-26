"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useTranslations } from "next-intl";
import { BankAccountModel } from "../../models/bank-account.model";

type Props = {
	account: BankAccountModel;
};

const formatValue = (value?: string | null) => value || "N/A";

export function BankAccountDetails({ account }: Props) {
	const t = useTranslations("SchoolsManagementBankAccounts");

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
						<div className="font-medium">{account.school?.schoolName || "N/A"}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Account Label</div>
						<div className="font-medium">{account.accountLabel}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Account Purpose</div>
						<div className="font-medium capitalize">
							{account.accountPurpose.replace(/_/g, " ")}
						</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Status</div>
						<div className="flex items-center gap-2">
							<Badge variant={account.isActive ? "default" : "secondary"}>
								{account.isActive ? "Active" : "Inactive"}
							</Badge>
							{account.isPrimary && <Badge variant="outline">Primary</Badge>}
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("sectionBankTitle")}</CardTitle>
					<CardDescription>{t("sectionBankDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
					<div>
						<div className="text-muted-foreground text-sm">Bank Name</div>
						<div className="font-medium">{account.bankName}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Bank Branch</div>
						<div className="font-medium">{formatValue(account.bankBranch)}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Bank Routing No</div>
						<div className="font-medium">{formatValue(account.bankRoutingNo)}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Account No</div>
						<div className="font-medium">{account.accountNo}</div>
					</div>
					<div className="@2xl/page:col-span-2">
						<div className="text-muted-foreground text-sm">Account Name</div>
						<div className="font-medium">{account.accountName}</div>
					</div>
				</CardContent>
			</Card>

			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{t("sectionMobileTitle")}</CardTitle>
					<CardDescription>{t("sectionMobileDescription")}</CardDescription>
				</CardHeader>
				<CardContent className="grid grid-cols-1 gap-4 @2xl/page:grid-cols-2">
					<div>
						<div className="text-muted-foreground text-sm">Mobile Banking Provider</div>
						<div className="font-medium">{formatValue(account.mobileBankingProvider)}</div>
					</div>
					<div>
						<div className="text-muted-foreground text-sm">Mobile Banking No</div>
						<div className="font-medium">{formatValue(account.mobileBankingNo)}</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
