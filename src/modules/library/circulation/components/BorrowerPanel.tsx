"use client";

import { ProgressiveImage } from "@/shared/components/media/ProgressiveImage";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import {
	AlertTriangle,
	Camera,
	Search,
	User,
	X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Ref } from "react";
import { toast } from "sonner";
import {
	borrowerTypeColors,
	formatMoney,
} from "../../shared/dto/library.dto";
import ScanModal from "../../shared/components/ScanModal";
import {
	lookupBorrower,
	lookupBorrowerById,
	searchBorrowers,
} from "../../shared/hooks/use-library-circulation";

type Props = {
	state: any;
	onResolved: (state: any) => void;
	onClear: () => void;
	/** React 19 takes a ref as a plain prop; forwardRef is no longer needed. */
	inputRef?: Ref<HTMLInputElement>;
};

/**
 * Who is at the desk.
 *
 * One focused input, because a barcode scanner is a keyboard that types and
 * presses Enter — so the scan path and the typing path are the same path, and
 * no scanner-specific handling is needed at all.
 *
 * When a bare employee code matches both a teacher and a staff member, the API
 * returns the candidates instead of guessing, and this panel asks. Issuing a
 * book to the wrong person is the worst bug this module could have.
 */
export default function BorrowerPanel({
	state,
	onResolved,
	onClear,
	inputRef,
}: Props) {
	const t = useTranslations("LibraryCirculation");
	const [code, setCode] = useState("");
	const [isLooking, setIsLooking] = useState(false);
	const [candidates, setCandidates] = useState<any[]>([]);
	const [matches, setMatches] = useState<any[]>([]);
	const [isScannerOpen, setIsScannerOpen] = useState(false);

	const resolve = async (value: string) => {
		const input = value.trim();
		if (!input) return;
		setIsLooking(true);
		setCandidates([]);
		setMatches([]);
		try {
			const result = await lookupBorrower(input);
			if (result?.ambiguous) {
				setCandidates(result.candidates || []);
				return;
			}
			onResolved(result);
			setCode("");
		} catch {
			// Not a card number — fall back to a name search so the desk is not
			// stuck when a child has forgotten their card, which is most days.
			try {
				const found = await searchBorrowers(input);
				if (!found.length) {
					toast.error(t("borrowerNotFound", { code: input }));
					return;
				}
				setMatches(found);
			} catch {
				// Global axios interceptor auto-toasts errors
			}
		} finally {
			setIsLooking(false);
		}
	};

	const pick = async (borrower: any) => {
		setIsLooking(true);
		try {
			onResolved(await lookupBorrowerById(borrower.type, borrower.id));
			setCode("");
			setCandidates([]);
			setMatches([]);
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsLooking(false);
		}
	};

	const borrower = state?.borrower;

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
						placeholder={t("scanCardPlaceholder")}
						className="pl-9"
						autoComplete="off"
						disabled={isLooking}
					/>
				</div>
				{/* A scanner types the code and its own Enter keystroke, so it never
				    touches this button — it's here for someone typing by hand. */}
				<Button
					type="button"
					variant="outline"
					onClick={() => void resolve(code)}
					disabled={!code.trim() || isLooking}
				>
					<Search className="size-4" />
					{t("search")}
				</Button>
				{/* Camera fallback for a tablet at the desk with no scanner. */}
				<Button
					type="button"
					variant="outline"
					size="icon"
					onClick={() => setIsScannerOpen(true)}
					title={t("scanWithCamera")}
				>
					<Camera className="size-4" />
				</Button>
			</div>

			{candidates.length > 0 && (
				<div className="space-y-2 rounded-md border border-amber-300 bg-amber-50 p-3 dark:border-amber-900/50 dark:bg-amber-950/20">
					<p className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400">
						<AlertTriangle className="size-4" />
						{t("ambiguousCode")}
					</p>
					<p className="text-muted-foreground text-xs">{t("ambiguousHelper")}</p>
					{candidates.map((person) => (
						<button
							key={`${person.type}-${person.id}`}
							type="button"
							onClick={() => pick(person)}
							className="hover:bg-accent/60 flex w-full items-center justify-between gap-2 rounded border bg-background px-3 py-2 text-left text-sm"
						>
							<span className="min-w-0 truncate">{person.name}</span>
							<Badge
								className={cn(
									"shrink-0 border-transparent text-xs font-normal",
									borrowerTypeColors[person.type],
								)}
							>
								{t(`borrowerTypeValue.${person.type}`)}
							</Badge>
						</button>
					))}
				</div>
			)}

			{matches.length > 0 && (
				<div className="max-h-56 space-y-1 overflow-y-auto rounded-md border p-2">
					<p className="text-muted-foreground px-1 pb-1 text-xs">
						{t("searchMatches", { count: matches.length })}
					</p>
					{matches.map((person) => (
						<button
							key={`${person.type}-${person.id}`}
							type="button"
							onClick={() => pick(person)}
							className="hover:bg-accent/60 flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm"
						>
							<span className="min-w-0 truncate">
								{person.name}
								{person.className && (
									<span className="text-muted-foreground ml-1.5 text-xs">
										{person.className}
										{person.sectionName ? ` · ${person.sectionName}` : ""}
									</span>
								)}
							</span>
							<span className="text-muted-foreground shrink-0 font-mono text-xs">
								{person.code}
							</span>
						</button>
					))}
				</div>
			)}

			{borrower ? (
				<div className="space-y-3 rounded-md border p-3">
					<div className="flex items-start gap-3">
						<div className="bg-muted flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full">
							{borrower.photoUrl ? (
								<ProgressiveImage
									src={borrower.photoUrl}
									placeholderBase64={borrower.photoPlaceholder}
									alt={borrower.name}
									width={48}
									height={48}
									className="size-12 object-cover"
								/>
							) : (
								<User className="text-muted-foreground size-5" />
							)}
						</div>
						<div className="min-w-0 flex-1 space-y-0.5">
							<div className="flex flex-wrap items-center gap-2">
								<p className="min-w-0 truncate font-medium">{borrower.name}</p>
								<Badge
									className={cn(
										"border-transparent text-xs font-normal",
										borrowerTypeColors[borrower.type],
									)}
								>
									{t(`borrowerTypeValue.${borrower.type}`)}
								</Badge>
							</div>
							<p className="text-muted-foreground text-xs">
								{borrower.code}
								{borrower.className
									? ` · ${borrower.className}${borrower.sectionName ? ` (${borrower.sectionName})` : ""}`
									: borrower.designation
										? ` · ${borrower.designation}`
										: ""}
							</p>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={onClear}
							title={t("clearBorrower")}
						>
							<X className="size-4" />
						</Button>
					</div>

					<div className="grid grid-cols-2 gap-2 text-sm">
						<div className="bg-muted/40 rounded p-2">
							<p className="text-muted-foreground text-xs">{t("booksOut")}</p>
							<p
								className={cn(
									"font-medium tabular-nums",
									state.blocked?.atLimit && "text-amber-600 dark:text-amber-400",
								)}
							>
								{t("booksOutOf", {
									used: state.policy?.used ?? 0,
									limit: state.policy?.limit ?? 0,
								})}
							</p>
						</div>
						<div className="bg-muted/40 rounded p-2">
							<p className="text-muted-foreground text-xs">
								{t("outstandingFines")}
							</p>
							<p
								className={cn(
									"font-medium tabular-nums",
									Number(state.outstandingFine) > 0 &&
										"text-amber-600 dark:text-amber-400",
								)}
							>
								{formatMoney(state.outstandingFine)}
							</p>
						</div>
					</div>

					{/* Flags, not blocks: the desk sees the reason and chooses. */}
					{state.blocked?.inactive && (
						<p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
							<AlertTriangle className="size-3.5" />
							{t("borrowerInactive", { status: borrower.status })}
						</p>
					)}
					{state.blocked?.overFineThreshold && (
						<p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
							<AlertTriangle className="size-3.5" />
							{t("overFineThreshold")}
						</p>
					)}
				</div>
			) : (
				<div className="border-border/70 text-muted-foreground flex min-h-32 items-center justify-center rounded-md border border-dashed px-4 text-center text-sm">
					{t("scanCardEmpty")}
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
