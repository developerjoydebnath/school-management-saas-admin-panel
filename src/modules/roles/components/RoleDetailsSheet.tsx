"use client";

import { Badge } from "@/shared/components/ui/badge";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useRole } from "../hooks/use-roles";

type Props = {
	id: string;
	open: boolean;
};

const formatValue = (value?: string | number | null) => {
	if (value === null || value === undefined || value === "") return "N/A";
	return String(value);
};

function CompactPair({ label, value }: { label: string; value?: React.ReactNode }) {
	return (
		<div className="min-w-0">
			<p className="text-muted-foreground text-[11px] leading-4">{label}</p>
			<div className="mt-0.5 truncate text-sm leading-5">{value ?? "-"}</div>
		</div>
	);
}

function RoleDetailsSkeleton() {
	return (
		<div className="space-y-4 p-4">
			{Array.from({ length: 2 }).map((_, sectionIndex) => (
				<div key={sectionIndex} className="bg-muted/20 rounded-md border p-4">
					<Skeleton className="h-4 w-36" />
					<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
						{Array.from({ length: 4 }).map((__, itemIndex) => (
							<div key={itemIndex} className="space-y-2">
								<Skeleton className="h-3 w-20" />
								<Skeleton className="h-4 w-32" />
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

export function RoleDetailsSheet({ id, open }: Props) {
	const t = useTranslations("RolesPage");
	const { data: role, isLoading } = useRole(open ? id : null);

	const content = (() => {
		if (isLoading || !role) {
			return <RoleDetailsSkeleton />;
		}

		return (
			<div className="space-y-4 p-4">
				<div className="bg-muted/20 rounded-md border p-4">
					<h3 className="text-sm font-normal">Basic Information</h3>
					<div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 @xl/body:grid-cols-2">
						<CompactPair label="Name" value={formatValue(role.name)} />
						<CompactPair 
							label="System Role" 
							value={role.isSystem ? "Yes" : "No"} 
						/>
						<CompactPair
							label="Status"
							value={
								<Badge
									variant={role.status === "ACTIVE" ? "default" : role.status === "PENDING" ? "secondary" : "destructive"}
									className="capitalize"
								>
									{role.status ? role.status.toLowerCase() : "N/A"}
								</Badge>
							}
						/>
						<CompactPair 
							label="Created At" 
							value={role.createdAt ? new Date(role.createdAt).toLocaleString() : "N/A"} 
						/>
						<CompactPair 
							label="Updated At" 
							value={role.updatedAt ? new Date(role.updatedAt).toLocaleString() : "N/A"} 
						/>
					</div>
				</div>

				{role.description && (
					<div className="bg-muted/20 rounded-md border p-4">
						<h3 className="mb-3 text-sm font-normal">Description</h3>
						<div 
							className="text-muted-foreground text-sm whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none"
							dangerouslySetInnerHTML={{ __html: role.description }}
						/>
					</div>
				)}

				{role.permissions && role.permissions.length > 0 && (
					<div className="bg-muted/20 rounded-md border p-4">
						<h3 className="mb-3 text-sm font-normal">Permissions</h3>
						<div className="flex flex-wrap gap-1">
							{role.permissions.map((perm) => (
								<span key={perm} className="bg-muted px-2 py-1 rounded text-xs">
									{perm}
								</span>
							))}
						</div>
					</div>
				)}
			</div>
		);
	})();

	return (
		<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[64vw] @5xl/body:w-[54vw]">
			<SheetHeader className="border-b p-4">
				<SheetTitle className="text-base leading-6 font-normal">
					{t("roleDetails") || "Role Details"}
				</SheetTitle>
				<SheetDescription className="text-xs">
					View detailed information and permissions for this role.
				</SheetDescription>
			</SheetHeader>
			<ScrollArea className="h-[calc(100vh-73px)]">{content}</ScrollArea>
		</SheetContent>
	);
}
