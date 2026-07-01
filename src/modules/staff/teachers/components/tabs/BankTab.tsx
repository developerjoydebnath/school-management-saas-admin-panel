import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Banknote } from "lucide-react";

export function BankTab({ teacher }: { teacher: any }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Banknote className="text-muted-foreground h-5 w-5" /> Bank Information
				</CardTitle>
			</CardHeader>
			<CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<div className="space-y-4">
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Bank Name</div>
						<div className="col-span-2 font-medium">{teacher.bankName || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Branch Name</div>
						<div className="col-span-2 font-medium">{teacher.bankBranch || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Account Number</div>
						<div className="col-span-2 font-medium">{teacher.bankAccountNo || "N/A"}</div>
					</div>
				</div>
				<div className="space-y-4">
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Mobile Wallet Type</div>
						<div className="col-span-2 font-medium">{teacher.mobileWalletType || "N/A"}</div>
					</div>
					<div className="grid grid-cols-3 gap-4">
						<div className="text-muted-foreground text-sm">Mobile Wallet No</div>
						<div className="col-span-2 font-medium">{teacher.mobileWalletNo || "N/A"}</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
