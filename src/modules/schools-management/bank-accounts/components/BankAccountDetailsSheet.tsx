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
import { useTranslations } from "next-intl";
import { useBankAccount } from "../../hooks/use-bank-accounts";

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

function BankAccountDetailsSkeleton() {
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

export function BankAccountDetailsSheet({ id, open }: Props) {
	const t = useTranslations("SchoolsManagementBankAccounts");
	const { data: account, isLoading } = useBankAccount(open ? id : null);

	const content = (() => {
		if (isLoading || !account) {
			return <BankAccountDetailsSkeleton />;
		}

		return (
			<div className="space-y-4 p-4">
				<div className="bg-muted/20 rounded-md border p-4">
					<h3 className="text-sm font-normal">{t("sectionAssignmentTitle")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair label="School" value={account.school?.schoolName || "N/A"} />
						<CompactPair label="Account Label" value={account.accountLabel} />
						<CompactPair
							label="Account Purpose"
							value={
								<span className="capitalize">
									{account.accountPurpose.replace(/_/g, " ")}
								</span>
							}
						/>
						<CompactPair
							label="Status"
							value={
								<div className="flex items-center gap-2">
									<Badge variant={account.isActive ? "default" : "secondary"}>
										{account.isActive ? "Active" : "Inactive"}
									</Badge>
									{account.isPrimary && <Badge variant="outline">Primary</Badge>}
								</div>
							}
						/>
					</div>
				</div>

				<div className="bg-muted/20 rounded-md border p-4">
					<h3 className="text-sm font-normal">{t("sectionBankTitle")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair label="Bank Name" value={account.bankName} />
						<CompactPair label="Bank Branch" value={formatValue(account.bankBranch)} />
						<CompactPair
							label="Bank Routing No"
							value={formatValue(account.bankRoutingNo)}
						/>
						<CompactPair label="Account No" value={account.accountNo} />
						<div className="@xl/body:col-span-2">
							<CompactPair label="Account Name" value={account.accountName} />
						</div>
					</div>
				</div>

				<div className="bg-muted/20 rounded-md border p-4">
					<h3 className="text-sm font-normal">{t("sectionMobileTitle")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair
							label="Mobile Banking Provider"
							value={formatValue(account.mobileBankingProvider)}
						/>
						<CompactPair
							label="Mobile Banking No"
							value={formatValue(account.mobileBankingNo)}
						/>
					</div>
				</div>
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
