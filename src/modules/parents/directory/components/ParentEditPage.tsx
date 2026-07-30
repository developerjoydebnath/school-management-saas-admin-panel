"use client";

import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { PATHS } from "@/shared/configs/paths.config";
import { useSWR } from "@/shared/hooks/use-swr";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ParentRecord } from "../../shared/parent-utils";
import ParentProfileForm from "./ParentProfileForm";

function ParentEditSkeleton() {
	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="space-y-2">
					<Skeleton className="h-8 w-44 rounded-md" />
					<Skeleton className="h-4 w-80 max-w-full rounded-md" />
				</div>
				<Skeleton className="h-10 w-24 rounded-md" />
			</div>
			<div className="mx-auto max-w-7xl space-y-6">
				<Skeleton className="h-80 rounded-md" />
				<Skeleton className="h-20 rounded-md" />
			</div>
		</div>
	);
}

export default function ParentEditPage({ parentId }: { parentId: string }) {
	const { data: parentResponse, isLoading } = useSWR(
		parentId ? `/parents/${parentId}` : null,
		{ sessionId: "all" }
	);
	const parent = parentResponse?.data as ParentRecord | undefined;

	if (isLoading || !parent) return <ParentEditSkeleton />;

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Edit Parent</h1>
					<p className="text-muted-foreground">
						Update parent profile and portal contact information.
					</p>
				</div>
				<Button asChild variant="outline">
					<Link href={PATHS.PARENTS.DIRECTORY.DETAILS(parentId)}>
						<ArrowLeft className="mr-2 size-4" />
						Back
					</Link>
				</Button>
			</div>

			<ParentProfileForm
				parentId={parentId}
				defaultValues={{
					firstName: parent.firstName || "",
					lastName: parent.lastName || "",
					phone: parent.phone || "",
					email: parent.email || "",
				}}
			/>
		</div>
	);
}
