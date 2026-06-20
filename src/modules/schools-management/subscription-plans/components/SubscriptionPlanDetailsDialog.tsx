"use client";

import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/components/ui/dialog";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useSubscriptionPlan } from "../../hooks/use-subscription-plan";
import { SubscriptionPlanDetailsSkeleton } from "./SubscriptionPlanDetailsSkeleton";

interface SubscriptionPlanDetailsDialogProps {
	planId: string;
}

export function SubscriptionPlanDetailsDialog({ planId }: SubscriptionPlanDetailsDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);

	useEffect(() => {
		if (isOpen && !hasOpened) {
			setHasOpened(true);
		}
	}, [isOpen, hasOpened]);

	const { data: plan, isLoading } = useSubscriptionPlan(hasOpened ? planId : null);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<Eye className="text-muted-foreground hover:text-foreground h-4 w-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[550px]">
				<DialogHeader>
					<DialogTitle>Plan Details</DialogTitle>
				</DialogHeader>
				{isLoading || !plan ? (
					<SubscriptionPlanDetailsSkeleton />
				) : (
					<ScrollArea className="max-h-[70vh] pr-4 -mr-4">
						<div className="flex flex-col gap-4 text-sm mt-2">
							<div className="grid grid-cols-2 gap-y-3">
								<div className="text-muted-foreground font-medium">Name:</div>
								<div className="font-medium">{plan.name}</div>
								<div className="text-muted-foreground font-medium">Tagline:</div>
								<div>{plan.tagline || "-"}</div>
								<div className="text-muted-foreground font-medium">Price:</div>
								<div>BDT {plan.price.toLocaleString()}</div>
								<div className="text-muted-foreground font-medium">Setup Fee:</div>
								<div>BDT {plan.original.setupFeeBdt ? Number(plan.original.setupFeeBdt).toLocaleString() : 0}</div>
								<div className="text-muted-foreground font-medium">Billing Cycle:</div>
								<div className="capitalize">{plan.billingCycle}</div>
								<div className="text-muted-foreground font-medium">Max Students:</div>
								<div>{plan.maxStudents || "Unlimited"}</div>
								<div className="text-muted-foreground font-medium">Max Teachers:</div>
								<div>{plan.maxTeachers || "Unlimited"}</div>
								<div className="text-muted-foreground font-medium">Max Staff:</div>
								<div>{plan.maxStaff || "Unlimited"}</div>
								<div className="text-muted-foreground font-medium">Max Classes:</div>
								<div>{plan.maxClasses || "Unlimited"}</div>
								<div className="text-muted-foreground font-medium">Storage (GB):</div>
								<div>{plan.original.storageGb || "Unlimited"}</div>
								<div className="text-muted-foreground font-medium">Status:</div>
								<div className="capitalize">{plan.status}</div>
								<div className="text-muted-foreground font-medium">Public:</div>
								<div>{plan.isPublic ? "Yes" : "No"}</div>
								<div className="text-muted-foreground font-medium">Trial Days:</div>
								<div>{plan.trialDays || 0}</div>
								<div className="text-muted-foreground font-medium">Grace Period (Days):</div>
								<div>{plan.original.gracePeriodDays || 0}</div>
							</div>

							{plan.description && (
								<>
									<div className="text-muted-foreground font-medium pt-2 border-t">Description:</div>
									<div 
										className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
										dangerouslySetInnerHTML={{ __html: plan.description }}
									/>
								</>
							)}

							{plan.original.notes && (
								<>
									<div className="text-muted-foreground font-medium pt-2 border-t">Notes:</div>
									<div className="text-muted-foreground">{plan.original.notes}</div>
								</>
							)}
						</div>
					</ScrollArea>
				)}
			</DialogContent>
		</Dialog>
	);
}
