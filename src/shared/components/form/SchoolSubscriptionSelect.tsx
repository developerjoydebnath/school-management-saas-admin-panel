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
	schoolId?: string;
};

export default function SchoolSubscriptionSelect({
	value,
	onChange,
	placeholder = "Select subscription",
	className,
	schoolId,
}: Props) {
	const { data, isLoading } = useSWR("/superadmin/school-subscriptions", {
		page: 1,
		limit: 100,
		...(schoolId ? { schoolId } : {}),
	});

	const subscriptions = data?.data?.items || [];
	const options = subscriptions.map((subscription: any) => ({
		label: `${subscription.school?.schoolName || "School"} - ${subscription.plan?.name || "Plan"} (${subscription.status})`,
		value: subscription.id,
	}));

	if (isLoading) return <Skeleton className="h-10 w-full" />;

	return (
		<Select value={value?.toString() || undefined} onValueChange={onChange}>
			<SelectTrigger className={cn("h-10! w-full", className)}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent className="p-1">
				{options.map((subscription: { label: string; value: string }) => (
					<SelectItem
						key={subscription.value}
						value={subscription.value}
						className="cursor-pointer py-2"
					>
						{subscription.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
