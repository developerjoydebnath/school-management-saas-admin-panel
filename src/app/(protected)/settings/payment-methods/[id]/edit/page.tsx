"use client";

import { PaymentMethodForm } from "@/modules/settings/payment-methods/components/PaymentMethodForm";
import { usePaymentMethod } from "@/modules/settings/payment-methods/hooks/use-payment-method-settings";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useParams } from "next/navigation";

export default function EditPaymentMethodPage() {
	const params = useParams<{ id: string }>();
	const { method, isLoading } = usePaymentMethod(params.id);

	if (isLoading || !method) {
		return (
			<div className="mx-auto max-w-7xl space-y-4">
				<Skeleton className="h-8 w-64" />
				<Skeleton className="h-96 w-full" />
			</div>
		);
	}

	return <PaymentMethodForm mode="edit" initialValue={method} />;
}
