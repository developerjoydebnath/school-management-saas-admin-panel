"use client";

import { Button } from "@/shared/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/shared/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import IncidentForm from "./IncidentForm";

export function AddIncidentDialog() {
	const t = useTranslations("StudentBehavior");
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button>
					<PlusCircle className="h-4 w-4" />
					{t("dialog.title")}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>{t("dialog.title")}</DialogTitle>
					<DialogDescription>{t("dialog.description")}</DialogDescription>
				</DialogHeader>

				<IncidentForm onSuccess={() => setIsOpen(false)} />
			</DialogContent>
		</Dialog>
	);
}
