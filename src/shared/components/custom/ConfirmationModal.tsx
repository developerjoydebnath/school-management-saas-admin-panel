"use client";

import React, { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { useTranslations } from "next-intl";

interface ConfirmationModalProps {
	children?: React.ReactNode;
	onConfirm: () => void;
	title?: string;
	description?: string;
	body?: React.ReactNode;
	confirmText?: string;
	cancelText?: string;
	isLoading?: boolean;
	variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export default function ConfirmationModal({
	children,
	onConfirm,
	title = "Are you sure?",
	description = "This action cannot be undone.",
	body,
	confirmText,
	cancelText,
	isLoading = false,
	variant = "default",
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
}: ConfirmationModalProps) {
	const t = useTranslations("Forms");
	const [internalOpen, setInternalOpen] = React.useState(false);

	const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
	const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen;

	const cancelAltText = cancelText || t("cancel");
	const confirmAltText = confirmText || t("confirm");
	const titleAltText = title || t("areYouSure");
	const descriptionAltText = description || t("thisActionCannotBeUndone");

	const handleConfirm = async (e: React.MouseEvent) => {
		e.preventDefault(); // Prevent default if any
		try {
			await onConfirm();
			setOpen(false);
		} catch (error) {
			// If it fails, we might want to keep it open
			console.error(error);
		}
	};

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			{children}
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{titleAltText}</AlertDialogTitle>
					<AlertDialogDescription>{descriptionAltText}</AlertDialogDescription>
				</AlertDialogHeader>
				{body && <div className="py-2">{body}</div>}
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isLoading} onClick={() => setOpen(false)}>
						{cancelAltText}
					</AlertDialogCancel>
					<AlertDialogAction onClick={handleConfirm} disabled={isLoading} variant={variant}>
						{isLoading ? t("processing") : confirmAltText}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
