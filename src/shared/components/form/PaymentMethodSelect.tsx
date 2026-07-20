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
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
};

function listFromResponse(response: any) {
	if (Array.isArray(response?.data)) return response.data;
	if (Array.isArray(response)) return response;
	return [];
}

export default function PaymentMethodSelect({
	value,
	onChange,
	placeholder = "Select payment method",
	className,
	disabled,
}: Props) {
	const { data: response, isLoading } = useSWR("/settings/payment-methods/active-options");
	const methods = listFromResponse(response);

	if (isLoading) return <Skeleton className="h-10 w-full" />;

	return (
		<Select
			value={value?.toString() || undefined}
			onValueChange={onChange}
			disabled={disabled || methods.length === 0}
		>
			<SelectTrigger className={cn("h-10! w-full", className)}>
				<SelectValue placeholder={methods.length ? placeholder : "No active payment method"} />
			</SelectTrigger>
			<SelectContent className="p-1">
				{methods.map((method: any) => (
					<SelectItem key={method.value} value={method.value} className="cursor-pointer py-2">
						{method.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
