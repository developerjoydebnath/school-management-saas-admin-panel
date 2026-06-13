"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Search, QrCode } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface StudentSearchFormProps {
	onSearch: (query: string) => void;
	onClear: () => void;
	isLoading?: boolean;
	onScanClick?: () => void;
}

export default function StudentSearchForm({
	onSearch,
	onClear,
	isLoading,
	onScanClick,
}: StudentSearchFormProps) {
	const t = useTranslations("StudentProfileSearch");
	const [query, setQuery] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSearch(query);
	};

	const handleClear = () => {
		setQuery("");
		onClear();
	};

	return (
		<Card className="gap-0 shadow-none">
			<CardContent>
				<form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
					<div className="flex-1 flex gap-2">
						<div className="relative flex-1">
							<Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
							<Input
								placeholder={t("searchPlaceholder")}
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className="pl-9"
							/>
						</div>
						{onScanClick && (
							<Button
								type="button"
								variant="outline"
								size="icon"
								onClick={onScanClick}
								className="h-10 w-10 shrink-0 hover:bg-primary/10 hover:text-primary transition-all duration-200"
								title="Scan QR / Barcode"
							>
								<QrCode className="h-5 w-5" />
							</Button>
						)}
					</div>
					<div className="flex gap-2">
						<Button
							type="submit"
							disabled={isLoading || !query.trim()}
							className="sm:w-auto"
						>
							{isLoading ? t("searchButton") + "..." : t("searchButton")}
						</Button>
						{query && (
							<Button
								type="button"
								variant="outline"
								onClick={handleClear}
								className="sm:w-auto"
							>
								{t("clearButton")}
							</Button>
						)}
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
