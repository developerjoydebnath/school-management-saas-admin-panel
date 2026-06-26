"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { cn } from "@/shared/lib/utils";

type Props = {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
};

export default function VoucherSelect({
	value,
	onChange,
	placeholder = "Select voucher",
	className,
	disabled = false,
}: Props) {
	const { data, isLoading } = useSWR("/vouchers", {
		page: 1,
		limit: 100,
		isActive: true,
	});

	const vouchers = data?.data?.items || [];
	const options = [
		{ label: "No Voucher", value: "none" },
		...vouchers.map((voucher: any) => ({
			label: `${voucher.code} - ${voucher.name}`,
			value: voucher.code,
		})),
	];

	if (isLoading) return <Skeleton className="h-10 w-full" />;

	return (
		<Select
			value={value?.toString() || undefined}
			onValueChange={onChange}
			disabled={disabled}
		>
			<SelectTrigger className={cn("h-10! w-full", className)}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent className="p-1">
				{options.map((voucher) => (
					<SelectItem
						key={voucher.value}
						value={voucher.value}
						className="cursor-pointer py-2"
					>
						{voucher.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
