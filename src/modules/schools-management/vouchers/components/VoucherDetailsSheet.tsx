"use client";

import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useVoucher } from "../hooks/use-voucher";

type Props = {
	id: string;
	open: boolean;
};

const formatValue = (value?: string | number | null) => value ?? "-";

function CompactPair({ label, value }: { label: string; value?: React.ReactNode }) {
	return (
		<div className="min-w-0">
			<p className="text-muted-foreground text-[11px] leading-4">{label}</p>
			<div className="mt-0.5 truncate text-sm leading-5">{value ?? "-"}</div>
		</div>
	);
}

function VoucherDetailsSkeleton() {
	return (
		<div className="space-y-4 p-4">
			<div className="bg-muted/20 rounded-md border p-4">
				<Skeleton className="h-4 w-36" />
				<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
					{Array.from({ length: 8 }).map((_, itemIndex) => (
						<div key={itemIndex} className="space-y-2">
							<Skeleton className="h-3 w-20" />
							<Skeleton className="h-4 w-32" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}

export function VoucherDetailsSheet({ id, open }: Props) {
	const t = useTranslations("VouchersPage");
	const { data: voucher, isLoading } = useVoucher(open ? id : null);

	const content = (() => {
		if (isLoading || !voucher) {
			return <VoucherDetailsSkeleton />;
		}

		return (
			<div className="space-y-4 p-4">
				<div className="bg-muted/20 rounded-md border p-4">
					<h3 className="text-sm font-normal">{t("sectionBasicInfo")}</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair label="Code" value={voucher.code} />
						<CompactPair label="Name" value={voucher.name} />
						<CompactPair
							label="Discount Type"
							value={<span className="capitalize">{voucher.discountType}</span>}
						/>
						<CompactPair
							label="Discount Value"
							value={
								voucher.discountType === "percentage"
									? `${voucher.discountValue}%`
									: `BDT ${voucher.discountValue.toLocaleString()}`
							}
						/>
						<CompactPair
							label="Max Discount"
							value={
								voucher.maxDiscountBdt
									? `BDT ${voucher.maxDiscountBdt.toLocaleString()}`
									: "No Limit"
							}
						/>
						<CompactPair
							label="Minimum Bill"
							value={
								voucher.minimumBillBdt
									? `BDT ${voucher.minimumBillBdt.toLocaleString()}`
									: "No Limit"
							}
						/>
						<CompactPair
							label="Redemptions"
							value={`${voucher.currentRedemptions} / ${voucher.maxRedemptions || "Unlimited"}`}
						/>
						<CompactPair label="Duration Cycles" value={voucher.durationCycles} />
						<CompactPair
							label="Limit 1 Per School"
							value={voucher.onePerSchool ? "Yes" : "No"}
						/>
						<CompactPair
							label="Valid From"
							value={
								voucher.validFrom
									? new Date(voucher.validFrom).toLocaleString()
									: "N/A"
							}
						/>
						<CompactPair
							label="Expires At"
							value={
								voucher.expiresAt
									? new Date(voucher.expiresAt).toLocaleString()
									: "No Expiry"
							}
						/>
						<CompactPair label="Active" value={voucher.isActive ? "Yes" : "No"} />
					</div>
				</div>

				{voucher.description && (
					<div className="bg-muted/20 rounded-md border p-4">
						<h3 className="mb-3 text-sm font-normal">{t("description")}</h3>
						<div
							className="prose prose-sm dark:prose-invert text-muted-foreground max-w-none"
							dangerouslySetInnerHTML={{ __html: voucher.description }}
						/>
					</div>
				)}

				{voucher.notes && (
					<div className="bg-muted/20 rounded-md border p-4">
						<h3 className="mb-3 text-sm font-normal">Notes</h3>
						<div className="text-muted-foreground text-sm">{voucher.notes}</div>
					</div>
				)}
			</div>
		);
	})();

	return (
		<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[64vw] @5xl/body:w-[54vw]">
			<SheetHeader className="border-b p-4">
				<SheetTitle className="text-base leading-6 font-normal">
					{t("voucherDetails")}
				</SheetTitle>
				<SheetDescription className="text-xs">{t("description")}</SheetDescription>
			</SheetHeader>
			<ScrollArea className="h-[calc(100vh-73px)]">{content}</ScrollArea>
		</SheetContent>
	);
}
