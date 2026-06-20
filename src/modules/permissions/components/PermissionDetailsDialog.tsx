"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/shared/components/ui/dialog";
import { Eye } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useTranslations } from "next-intl";
import { usePermission } from "../hooks/use-permissions";
import { PermissionDetailsSkeleton } from "./PermissionDetailsSkeleton";
import { useState, useEffect } from "react";

interface PermissionDetailsDialogProps {
	permissionId: number | string;
}

export function PermissionDetailsDialog({ permissionId }: PermissionDetailsDialogProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);

	useEffect(() => {
		if (isOpen && !hasOpened) {
			setHasOpened(true);
		}
	}, [isOpen, hasOpened]);

	const { data: permission, isLoading } = usePermission(hasOpened ? permissionId : null);
	const t = useTranslations("PermissionsPage");

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[550px]">
				<DialogHeader>
					<DialogTitle>{t("permissionDetails") || "Permission Details"}</DialogTitle>
				</DialogHeader>
				{isLoading || !permission ? (
					<PermissionDetailsSkeleton />
				) : (
					<ScrollArea className="max-h-[70vh] pr-4 -mr-4">
						<div className="flex flex-col gap-4 text-sm mt-2">
							<div className="grid grid-cols-2 gap-y-3">
								<div className="font-medium text-muted-foreground">Permission Name:</div>
								<div className="font-medium">{permission.permissionName}</div>
								<div className="font-medium text-muted-foreground">Group Name:</div>
								<div>{permission.groupName || "-"}</div>
								<div className="font-medium text-muted-foreground">Permission Key:</div>
								<div>{permission.permissionKey || "-"}</div>
								<div className="font-medium text-muted-foreground">Created At:</div>
								<div>{permission.createdAt ? new Date(permission.createdAt).toLocaleString() : "-"}</div>
								<div className="font-medium text-muted-foreground">Updated At:</div>
								<div>{permission.updatedAt ? new Date(permission.updatedAt).toLocaleString() : "-"}</div>
							</div>

							{permission.moduleName && permission.moduleName.length > 0 && (
								<>
									<div className="font-medium text-muted-foreground pt-2 border-t">Module Names:</div>
									<div className="flex flex-wrap gap-1">
										{permission.moduleName.map((module) => (
											<span key={module} className="bg-muted px-2 py-1 rounded text-xs">{module}</span>
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
