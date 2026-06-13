"use client";

import { Button } from "@/shared/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LanguageSwitcher() {
	const [isPending, startTransition] = useTransition();
	const locale = useLocale();
	const router = useRouter();

	const changeLanguage = (nextLocale: string) => {
		document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
		startTransition(() => {
			router.refresh();
		});
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button variant="ghost" size="icon" disabled={isPending}>
						<Languages className="h-5 w-5" />
						<span className="sr-only">Toggle language</span>
					</Button>
				}
			/>

			<DropdownMenuContent align="end">
				<DropdownMenuItem
					onClick={() => changeLanguage("en")}
					className={locale === "en" ? "font-bold" : ""}
				>
					English
				</DropdownMenuItem>
				<DropdownMenuItem
					onClick={() => changeLanguage("bn")}
					className={locale === "bn" ? "font-bold" : ""}
				>
					বাংলা (Bangla)
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
