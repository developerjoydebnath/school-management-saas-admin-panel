"use client";

import { ProgressiveImage } from "@/shared/components/media/ProgressiveImage";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { AlertTriangle, BookOpen, Camera, Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Ref } from "react";
import { toast } from "sonner";
import ScanModal from "../../shared/components/ScanModal";
import { copyStatusColors } from "../../shared/dto/library.dto";
import { lookupCopy } from "../../shared/hooks/use-library-circulation";

type Props = {
	basket: any[];
	onAdd: (result: any) => void;
	onRemove: (copyId: string) => void;
	disabled?: boolean;
	/** React 19 takes a ref as a plain prop; forwardRef is no longer needed. */
	inputRef?: Ref<HTMLInputElement>;
};

/**
 * Which books are being taken.
 *
 * Scanning adds to a basket rather than issuing immediately: a teacher
 * collecting three books is one trip to the desk, and one issue action keeps
 * the three loans on one due date.
 *
 * A copy that cannot go out is shown with the reason in a sentence — "Already
 * issued to Rahim Uddin (Class 7), due 27 Sep" — because at a desk with forty
 * students queuing, "unavailable" is useless.
 */
export default function CopyPanel({
	basket,
	onAdd,
	onRemove,
	disabled,
	inputRef,
}: Props) {
	const t = useTranslations("LibraryCirculation");
	const [code, setCode] = useState("");
	const [isLooking, setIsLooking] = useState(false);
	const [rejected, setRejected] = useState<any>(null);
	const [isScannerOpen, setIsScannerOpen] = useState(false);

	const resolve = async (value: string) => {
		const input = value.trim();
		if (!input) return;
		setIsLooking(true);
		setRejected(null);
		try {
			const result = await lookupCopy(input);
			if (!result?.issuable) {
				setRejected(result);
				return;
			}
			if (basket.some((item) => item.copy.id === result.copy.id)) {
				toast.info(t("alreadyInBasket", { accessionNo: result.copy.accessionNo }));
				return;
			}
			onAdd(result);
			setCode("");
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsLooking(false);
		}
	};

	return (
		<div className="space-y-3">
			<div className="flex gap-2">
				<div className="relative flex-1">
					<Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
					<Input
						ref={inputRef}
						value={code}
						onChange={(event) => setCode(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								event.preventDefault();
								void resolve(code);
							}
						}}
						placeholder={t("scanBookPlaceholder")}
						className="pl-9"
						autoComplete="off"
						disabled={disabled || isLooking}
					/>
				</div>
				{/* A scanner types the code and its own Enter keystroke, so it never
				    touches this button — it's here for someone typing by hand. */}
				<Button
					type="button"
					variant="outline"
					onClick={() => void resolve(code)}
					disabled={disabled || !code.trim() || isLooking}
				>
					<Search className="size-4" />
					{t("search")}
				</Button>
				<Button
					type="button"
					variant="outline"
					size="icon"
					onClick={() => setIsScannerOpen(true)}
					disabled={disabled}
					title={t("scanWithCamera")}
				>
					<Camera className="size-4" />
				</Button>
			</div>

			{rejected && (
				<div className="space-y-1 rounded-md border border-amber-300 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
					<p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400">
						<AlertTriangle className="size-4" />
						{rejected.book?.title} · {rejected.copy?.accessionNo}
					</p>
					<p className="text-muted-foreground text-xs">{rejected.reason}</p>
				</div>
			)}

			{basket.length === 0 ? (
				<div className="border-border/70 text-muted-foreground flex min-h-32 items-center justify-center rounded-md border border-dashed px-4 text-center text-sm">
					{disabled ? t("scanCardFirst") : t("scanBookEmpty")}
				</div>
			) : (
				<div className="space-y-2">
					{basket.map((item) => (
						<div
							key={item.copy.id}
							className="flex items-start gap-3 rounded-md border p-2.5"
						>
							<div className="bg-muted flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded">
								{item.book?.coverUrl ? (
									<ProgressiveImage
										src={item.book.coverUrl}
										placeholderBase64={item.book.coverPlaceholder}
										alt={item.book.title}
										width={36}
										height={48}
										className="h-12 w-9 object-cover"
									/>
								) : (
									<BookOpen className="text-muted-foreground size-4" />
								)}
							</div>
							<div className="min-w-0 flex-1 space-y-0.5">
								<p className="truncate text-sm font-medium">{item.book?.title}</p>
								<p className="text-muted-foreground truncate text-xs">
									{item.book?.author}
								</p>
								<div className="flex flex-wrap items-center gap-1.5">
									<span className="text-muted-foreground font-mono text-xs">
										{item.copy.accessionNo}
									</span>
									<Badge
										className={cn(
											"border-transparent text-[10px] font-normal",
											copyStatusColors[item.copy.status],
										)}
									>
										{t(`copyStatusValue.${item.copy.status}`)}
									</Badge>
								</div>
							</div>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => onRemove(item.copy.id)}
								title={t("removeFromBasket")}
							>
								<X className="size-4" />
							</Button>
						</div>
					))}
				</div>
			)}

			<ScanModal
				open={isScannerOpen}
				onOpenChange={setIsScannerOpen}
				onScan={(value: string) => {
					setIsScannerOpen(false);
					void resolve(value);
				}}
			/>
		</div>
	);
}
