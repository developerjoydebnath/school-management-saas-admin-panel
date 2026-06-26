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

interface Plan {
	id: string;
	name: string;
}

interface SubscriptionPlanSelectProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export default function SubscriptionPlanSelect({
	value,
	onChange,
	placeholder = "Select subscription plan",
	className,
}: SubscriptionPlanSelectProps) {
	const { data, isLoading } = useSWR("/superadmin/subscription-plans/list");

	const plans: Plan[] = Array.isArray(data)
		? data
		: Array.isArray(data?.data)
			? data.data
			: [];

	const options = plans.map((plan) => ({ label: plan.name, value: plan.id }));

	if (isLoading) return <Skeleton className="h-10 w-full" />;

	return (
		<Select value={value?.toString() || undefined} onValueChange={onChange}>
			<SelectTrigger className={cn("h-10! w-full", className)}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent className="p-1">
				{options.map((plan) => (
					<SelectItem
						key={plan.value}
						value={plan.value}
						className="cursor-pointer py-2"
					>
						{plan.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
