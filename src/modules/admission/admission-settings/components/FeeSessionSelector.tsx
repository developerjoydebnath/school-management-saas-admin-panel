"use client";

import { Button } from "@/shared/components/ui/button";
import { Label } from "@/shared/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/components/ui/select";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { getLocalizedName } from "@/shared/utils/localization";
import { Copy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

interface FeeSessionSelectorProps {
	session: string;
	onSessionChange: (value: string) => void;
}

export function FeeSessionSelector({ session, onSessionChange }: FeeSessionSelectorProps) {
	const { data: sessions, isLoading } = useSWR("/sessions");
	const locale = useLocale();
	const t = useTranslations("AdmissionSettings");

	return (
		<div className="bg-background flex flex-wrap items-center justify-between gap-4 rounded-lg border p-4">
			<div className="flex items-center gap-4">
				<Label className="text-sm font-medium">{t("feeConfiguringSession")}</Label>

				{isLoading ? (
					<Skeleton className="h-10 w-[180px]" />
				) : (
					<Select
						value={session || null}
						onValueChange={(value) => value && onSessionChange(value)}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select session" />
						</SelectTrigger>
						<SelectContent className="p-1">
							{sessions
								?.filter((s: any) => s.status === "ACTIVE")
								.map((s: any) => (
									<SelectItem
										key={s.id}
										value={s.id.toString()}
										className="cursor-pointer py-2"
									>
										{typeof s.name === "object"
											? getLocalizedName(s.name, locale)
											: s.name}
									</SelectItem>
								))}
						</SelectContent>
					</Select>
				)}

				<span className="text-muted-foreground text-sm">{t("feeSessionNote")}</span>
			</div>

			<Button variant="outline" size="sm" className="h-8">
				<Copy className="mr-2 h-4 w-4" />
				{t("feeCopyPrevSession")}
			</Button>
		</div>
	);
}
