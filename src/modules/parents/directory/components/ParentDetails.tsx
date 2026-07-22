"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import axios from "@/shared/lib/axios";
import {
	ArrowLeft,
	Eye,
	Mail,
	Phone,
	Power,
	PowerOff,
	ShieldCheck,
	UserRound,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
	formatDateTime,
	formatNumber,
	getInitials,
	ParentChild,
	ParentRecord,
	portalBadgeClass,
	studentStatusClass,
} from "../../shared/parent-utils";

function DetailsSkeleton() {
	return (
		<div className="space-y-4">
			<Skeleton className="h-24 rounded-md" />
			<div className="grid gap-4 xl:grid-cols-[360px_1fr]">
				<Skeleton className="h-96 rounded-md" />
				<Skeleton className="h-96 rounded-md" />
			</div>
		</div>
	);
}

function ChildCard({ child }: { child: ParentChild }) {
	return (
		<div className="border-border/70 bg-muted/20 flex flex-col gap-3 rounded-md border p-4 md:flex-row md:items-center md:justify-between">
			<div className="space-y-1">
				<div className="flex flex-wrap items-center gap-2">
					<h3 className="font-semibold">{child.fullName || "Student"}</h3>
					<span
						className={`rounded-full px-2 py-0.5 text-xs font-medium ${studentStatusClass(
							child.status
						)}`}
					>
						{child.status || "Unknown"}
					</span>
				</div>
				<p className="text-muted-foreground font-mono text-xs">
					{child.studentIdNo || "-"}
				</p>
			</div>
			<div className="grid gap-3 text-sm sm:grid-cols-3 md:min-w-[360px]">
				<div>
					<p className="text-muted-foreground text-xs">Class</p>
					<p className="font-medium">{child.className || "-"}</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">Section</p>
					<p className="font-medium">{child.sectionName || "-"}</p>
				</div>
				<div>
					<p className="text-muted-foreground text-xs">Roll</p>
					<p className="font-medium">{child.rollNumber || "-"}</p>
				</div>
			</div>
			{child.classId ? (
				<Button asChild variant="outline" size="sm" className="w-full md:w-auto">
					<Link href={`/students/directory/${child.classId}/${child.id}`}>
						<Eye className="mr-2 size-4" />
						View Student
					</Link>
				</Button>
			) : null}
		</div>
	);
}

export default function ParentDetails({ parentId }: { parentId: string }) {
	const [updating, setUpdating] = useState(false);
	const { data: parentResponse, isLoading, mutate } = useSWR(
		parentId ? `/parents/${parentId}` : null,
		{ sessionId: "all" }
	);
	const parent = parentResponse?.data as ParentRecord | undefined;

	const togglePortal = async () => {
		if (!parent) return;
		setUpdating(true);
		try {
			const response = await axios.patch(`/parents/${parent.id}/portal-access`, {
				isActive: !parent.isActive,
			});
			toast.success(response.data?.message || "Parent portal access updated.");
			await mutate?.();
		} catch (error: any) {
			toast.error(
				error?.response?.data?.message || "Failed to update parent portal access."
			);
		} finally {
			setUpdating(false);
		}
	};

	if (isLoading || !parent) return <DetailsSkeleton />;

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Parent Details</h1>
					<p className="text-muted-foreground">
						Review parent account, portal access, and linked children.
					</p>
				</div>
				<Button asChild variant="outline">
					<Link href="/parents/directory">
						<ArrowLeft className="mr-2 size-4" />
						Back
					</Link>
				</Button>
			</div>

			<div className="grid gap-4 xl:grid-cols-[380px_1fr]">
				<div className="space-y-4">
					<Card className="rounded-md">
						<CardContent className="space-y-5 p-6">
							<div className="flex flex-col items-center text-center">
								<div className="bg-muted border-border flex size-28 items-center justify-center rounded-md border text-3xl font-semibold">
									{getInitials(parent.name)}
								</div>
								<h2 className="mt-4 text-xl font-semibold">{parent.name || "Parent"}</h2>
								<p className="text-muted-foreground font-mono text-xs">
									{parent.username || "-"}
								</p>
								<span
									className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${portalBadgeClass(
										parent.isActive
									)}`}
								>
									{parent.isActive ? "Portal Active" : "Portal Disabled"}
								</span>
							</div>

							<div className="border-border/70 space-y-3 border-t pt-4">
								<div className="flex items-center gap-3 text-sm">
									<Phone className="text-muted-foreground size-4" />
									<span>{parent.phone || "-"}</span>
								</div>
								<div className="flex items-center gap-3 text-sm">
									<Mail className="text-muted-foreground size-4" />
									<span>{parent.email || "-"}</span>
								</div>
							</div>

							<ConfirmationModal
								title={
									parent.isActive
										? "Disable parent portal access?"
										: "Enable parent portal access?"
								}
								description={
									parent.isActive
										? "The parent will no longer be able to sign in to the parent portal."
										: "The parent will be able to sign in and view linked children."
								}
								confirmText={parent.isActive ? "Disable" : "Enable"}
								variant={parent.isActive ? "destructive" : "default"}
								isLoading={updating}
								onConfirm={togglePortal}
							>
								<AlertDialogTrigger asChild>
									<Button className="w-full" variant={parent.isActive ? "destructive" : "default"}>
										{parent.isActive ? (
											<PowerOff className="mr-2 size-4" />
										) : (
											<Power className="mr-2 size-4" />
										)}
										{parent.isActive ? "Disable Portal" : "Enable Portal"}
									</Button>
								</AlertDialogTrigger>
							</ConfirmationModal>
						</CardContent>
					</Card>

					<div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
						<Card className="rounded-md">
							<CardContent className="flex items-center justify-between p-4">
								<div>
									<p className="text-muted-foreground text-sm">Linked Children</p>
									<p className="text-2xl font-semibold">
										{formatNumber(parent.childCount)}
									</p>
								</div>
								<Users className="text-muted-foreground size-4" />
							</CardContent>
						</Card>
						<Card className="rounded-md">
							<CardContent className="flex items-center justify-between p-4">
								<div>
									<p className="text-muted-foreground text-sm">Active Children</p>
									<p className="text-2xl font-semibold">
										{formatNumber(parent.activeChildCount)}
									</p>
								</div>
								<ShieldCheck className="text-muted-foreground size-4" />
							</CardContent>
						</Card>
						<Card className="rounded-md">
							<CardContent className="p-4">
								<p className="text-muted-foreground text-sm">Last Login</p>
								<p className="mt-2 font-medium">{formatDateTime(parent.lastLogin)}</p>
							</CardContent>
						</Card>
					</div>
				</div>

				<div className="space-y-4">
					<Card className="rounded-md">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<Users className="size-4" />
								Children
							</CardTitle>
							<p className="text-muted-foreground text-sm">
								All student profiles linked to this parent account.
							</p>
						</CardHeader>
						<CardContent className="space-y-3">
							{parent.children?.length ? (
								parent.children.map((child) => <ChildCard key={child.id} child={child} />)
							) : (
								<div className="border-border/70 text-muted-foreground flex min-h-36 items-center justify-center rounded-md border border-dashed text-sm">
									No linked children found for this parent.
								</div>
							)}
						</CardContent>
					</Card>

					<Card className="rounded-md">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<UserRound className="size-4" />
								Account Information
							</CardTitle>
						</CardHeader>
						<CardContent className="grid gap-3 md:grid-cols-2">
							<div className="border-border/70 rounded-md border p-3">
								<p className="text-muted-foreground text-xs">First Name</p>
								<p className="font-medium">{parent.firstName || "-"}</p>
							</div>
							<div className="border-border/70 rounded-md border p-3">
								<p className="text-muted-foreground text-xs">Last Name</p>
								<p className="font-medium">{parent.lastName || "-"}</p>
							</div>
							<div className="border-border/70 rounded-md border p-3">
								<p className="text-muted-foreground text-xs">Created At</p>
								<p className="font-medium">{formatDateTime(parent.createdAt)}</p>
							</div>
							<div className="border-border/70 rounded-md border p-3">
								<p className="text-muted-foreground text-xs">Portal Status</p>
								<p className="font-medium">{parent.isActive ? "Active" : "Disabled"}</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
