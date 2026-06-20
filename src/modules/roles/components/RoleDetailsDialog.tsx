"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Eye } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useTranslations } from "next-intl";
import { useRole } from "../hooks/use-roles";
import { RoleDetailsSkeleton } from "./RoleDetailsSkeleton";
import { useState, useEffect } from "react";

interface RoleDetailsDialogProps {
	roleId: string;
}

export function RoleDetailsDialog({ roleId }: RoleDetailsDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);

	useEffect(() => {
		if (isOpen && !hasOpened) {
			setHasOpened(true);
		}
	}, [isOpen, hasOpened]);

	const { data: role, isLoading } = useRole(hasOpened ? roleId : null);
	const t = useTranslations("RolesPage");

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[550px]">
				<DialogHeader>
					<DialogTitle>{t("roleDetails") || "Role Details"}</DialogTitle>
				</DialogHeader>
				{isLoading || !role ? (
					<RoleDetailsSkeleton />
				) : (
					<ScrollArea className="max-h-[70vh] pr-4 -mr-4">
						<div className="flex flex-col gap-4 text-sm mt-2">
							<div className="grid grid-cols-2 gap-y-3">
								<div className="font-medium text-muted-foreground">Name:</div>
								<div className="font-medium">{role.name}</div>
								<div className="font-medium text-muted-foreground">System Role:</div>
								<div>{role.isSystem ? "Yes" : "No"}</div>
								<div className="font-medium text-muted-foreground">Status:</div>
								<div className="capitalize">{role.status?.toLowerCase() || "-"}</div>
								<div className="font-medium text-muted-foreground">Created At:</div>
								<div>{role.createdAt ? new Date(role.createdAt).toLocaleString() : "-"}</div>
								<div className="font-medium text-muted-foreground">Updated At:</div>
								<div>{role.updatedAt ? new Date(role.updatedAt).toLocaleString() : "-"}</div>
							</div>

							{role.description && (
								<>
									<div className="font-medium text-muted-foreground pt-2 border-t">Description:</div>
									<div 
										className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
										dangerouslySetInnerHTML={{ __html: role.description }}
									/>
								</>
							)}

							{role.permissions && role.permissions.length > 0 && (
								<>
									<div className="font-medium text-muted-foreground pt-2 border-t">Permissions:</div>
									<div className="flex flex-wrap gap-1">
										{role.permissions.map((perm) => (
											<span key={perm} className="bg-muted px-2 py-1 rounded text-xs">{perm}</span>
										))}
									</div>
								</>
							)}
						</div>
					</ScrollArea>
				)}
			</DialogContent>
		</Dialog>
	);
}
