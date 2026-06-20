"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Eye } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useTranslations } from "next-intl";
import { useVoucher } from "../hooks/use-voucher";
import { VoucherDetailsSkeleton } from "./VoucherDetailsSkeleton";
import { useState, useEffect } from "react";

interface VoucherDetailsDialogProps {
	voucherId: string;
}

export function VoucherDetailsDialog({ voucherId }: VoucherDetailsDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);

	useEffect(() => {
		if (isOpen && !hasOpened) {
			setHasOpened(true);
		}
	}, [isOpen, hasOpened]);

	const { data: voucher, isLoading } = useVoucher(hasOpened ? voucherId : null);
	const t = useTranslations("VouchersPage");

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[550px]">
				<DialogHeader>
					<DialogTitle>{t("voucherDetails")}</DialogTitle>
				</DialogHeader>
				{isLoading || !voucher ? (
					<VoucherDetailsSkeleton />
				) : (
					<ScrollArea className="max-h-[70vh] pr-4 -mr-4">
						<div className="flex flex-col gap-4 text-sm mt-2">
							<div className="grid grid-cols-2 gap-y-3">
								<div className="font-medium text-muted-foreground">Code:</div>
								<div className="font-medium">{voucher.code}</div>
								<div className="font-medium text-muted-foreground">Name:</div>
								<div>{voucher.name}</div>
								<div className="font-medium text-muted-foreground">Discount Type:</div>
								<div className="capitalize">{voucher.discountType}</div>
								<div className="font-medium text-muted-foreground">Discount Value:</div>
								<div>
									{voucher.discountType === "percentage" 
										? `${voucher.discountValue}%` 
										: `BDT ${voucher.discountValue.toLocaleString()}`}
								</div>
								<div className="font-medium text-muted-foreground">Max Discount:</div>
								<div>{voucher.maxDiscountBdt ? `BDT ${voucher.maxDiscountBdt.toLocaleString()}` : "No Limit"}</div>
								<div className="font-medium text-muted-foreground">Minimum Bill:</div>
								<div>{voucher.minimumBillBdt ? `BDT ${voucher.minimumBillBdt.toLocaleString()}` : "No Limit"}</div>
								<div className="font-medium text-muted-foreground">Redemptions:</div>
								<div>{voucher.currentRedemptions} / {voucher.maxRedemptions || "Unlimited"}</div>
								<div className="font-medium text-muted-foreground">Duration Cycles:</div>
								<div>{voucher.durationCycles}</div>
								<div className="font-medium text-muted-foreground">Limit 1 Per School:</div>
								<div>{voucher.onePerSchool ? "Yes" : "No"}</div>
								<div className="font-medium text-muted-foreground">Valid From:</div>
								<div>{voucher.validFrom ? new Date(voucher.validFrom).toLocaleString() : "N/A"}</div>
								<div className="font-medium text-muted-foreground">Expires At:</div>
								<div>{voucher.expiresAt ? new Date(voucher.expiresAt).toLocaleString() : "No Expiry"}</div>
								<div className="font-medium text-muted-foreground">Active:</div>
								<div>{voucher.isActive ? "Yes" : "No"}</div>
							</div>

							{voucher.description && (
								<>
									<div className="font-medium text-muted-foreground pt-2 border-t">Description:</div>
									<div 
										className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
										dangerouslySetInnerHTML={{ __html: voucher.description }}
									/>
								</>
							)}

							{voucher.notes && (
								<>
									<div className="font-medium text-muted-foreground pt-2 border-t">Notes:</div>
									<div className="text-muted-foreground">{voucher.notes}</div>
								</>
							)}
						</div>
					</ScrollArea>
				)}
			</DialogContent>
		</Dialog>
	);
}
