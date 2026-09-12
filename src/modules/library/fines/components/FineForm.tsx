"use client";

import InputField from "@/shared/components/form/InputField";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { PATHS } from "@/shared/configs/paths.config";
import { cn } from "@/shared/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, User, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
	FINE_REASONS,
	borrowerTypeColors,
} from "../../shared/dto/library.dto";
import { searchBorrowers } from "../../shared/hooks/use-library-circulation";
import {
	createLibraryFine,
	updateLibraryFine,
} from "../../shared/hooks/use-library-fines";

const fineSchema = z.object({
	reason: z.enum(["OVERDUE", "DAMAGE", "LOST", "OTHER"]).default("OTHER"),
	amount: z.coerce.number().min(0.01, "Amount must be greater than zero"),
	notes: z.string().max(1000).optional().nullable(),
});

type FineFormValues = z.infer<typeof fineSchema>;

type Props = {
	id?: string;
	defaultValues?: Partial<FineFormValues>;
	/** Present on edit; the borrower is fixed once the fine exists. */
	existingBorrower?: {
		type: string;
		id: string;
		name: string;
		code?: string | null;
	};
	isEdit?: boolean;
};

/**
 * A fine raised by hand.
 *
 * Overdue fines assess themselves on return — this form is for the ones that
 * do not have a loan behind them: a torn page found at the desk, a lost library
 * card, a book damaged in a bag. Hence the borrower picker: there is no loan to
 * infer the person from.
 */
export default function FineForm({
	id,
	defaultValues,
	existingBorrower,
	isEdit = false,
}: Props) {
	const router = useRouter();
	const t = useTranslations("LibraryFines");
	const ft = useTranslations("Forms");

	const [borrower, setBorrower] = useState<any>(existingBorrower || null);
	const [search, setSearch] = useState("");
	const [matches, setMatches] = useState<any[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const form = useForm<FineFormValues>({
		resolver: zodResolver(fineSchema as any),
		shouldFocusError: false,
		defaultValues: {
			reason: (defaultValues?.reason as any) || "OTHER",
			amount: defaultValues?.amount ?? 0,
			notes: defaultValues?.notes ?? "",
		},
	});

	const reasonOptions = useMemo(
		() =>
			FINE_REASONS.map((reason) => ({
				label: t(`reasonValue.${reason}`),
				value: reason,
			})),
		[t],
	);

	const runSearch = async () => {
		const term = search.trim();
		if (term.length < 2) return;
		setIsSearching(true);
		try {
			setMatches(await searchBorrowers(term));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsSearching(false);
		}
	};

	const onSubmit = async (data: FineFormValues) => {
		if (!isEdit && !borrower) {
			toast.error(t("pickBorrowerFirst"));
			return;
		}
		try {
			if (isEdit && id) {
				await updateLibraryFine(id, {
					reason: data.reason,
					amount: Number(data.amount),
					notes: data.notes || undefined,
				});
				toast.success(t("updateSuccess"));
			} else {
				await createLibraryFine({
					borrowerType: borrower.type,
					borrowerId: borrower.id,
					reason: data.reason,
					amount: Number(data.amount),
					notes: data.notes || undefined,
				});
				toast.success(t("createSuccess"));
			}
			router.push(PATHS.LIBRARY.FINES.ROOT);
		} catch {
			// Global axios interceptor auto-toasts errors
		}
	};

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="mx-auto max-w-3xl space-y-6"
		>
			<Card className="shadow-none ring-0">
				<CardHeader>
					<CardTitle>{isEdit ? t("editTitle") : t("createTitle")}</CardTitle>
					<CardDescription>
						{isEdit ? t("editDescription") : t("createDescription")}
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label className="text-xs">{t("borrower")}</Label>
						{borrower ? (
							<div className="flex items-center justify-between gap-3 rounded-md border p-3">
								<div className="flex min-w-0 items-center gap-2">
									<User className="text-muted-foreground size-4 shrink-0" />
									<span className="min-w-0 truncate text-sm">{borrower.name}</span>
									<Badge
										className={cn(
											"shrink-0 border-transparent text-[10px] font-normal",
											borrowerTypeColors[borrower.type],
										)}
									>
										{t(`borrowerTypeValue.${borrower.type}`)}
									</Badge>
									{borrower.code && (
										<span className="text-muted-foreground shrink-0 font-mono text-xs">
											{borrower.code}
										</span>
									)}
								</div>
								{!isEdit && (
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => setBorrower(null)}
										title={ft("cancel")}
									>
										<X className="size-4" />
									</Button>
								)}
							</div>
						) : (
							<div className="space-y-2">
								<div className="flex gap-2">
									<div className="relative flex-1">
										<Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
										<Input
											value={search}
											onChange={(event) => setSearch(event.target.value)}
											onKeyDown={(event) => {
												if (event.key === "Enter") {
													event.preventDefault();
													void runSearch();
												}
											}}
											placeholder={t("borrowerSearchPlaceholder")}
											className="pl-9"
										/>
									</div>
									<Button
										type="button"
										variant="outline"
										onClick={runSearch}
										disabled={isSearching}
									>
										{t("search")}
									</Button>
								</div>
								{matches.length > 0 && (
									<div className="max-h-56 space-y-1 overflow-y-auto rounded-md border p-2">
										{matches.map((person) => (
											<button
												key={`${person.type}-${person.id}`}
												type="button"
												onClick={() => {
													setBorrower(person);
													setMatches([]);
													setSearch("");
												}}
												className="hover:bg-accent/60 flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm"
											>
												<span className="min-w-0 truncate">
													{person.name}
													{person.className && (
														<span className="text-muted-foreground ml-1.5 text-xs">
															{person.className}
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
							</div>
						)}
					</div>

					<div className="grid grid-cols-1 gap-4 @3xl/page:grid-cols-2">
						<InputField
							control={form.control}
							name="reason"
							label={t("reason")}
							type="select"
							options={reasonOptions}
							required
						/>
						<InputField
							control={form.control}
							name="amount"
							label={t("amountBdt")}
							type="number"
							step="0.01"
							min={0}
							placeholder="0.00"
							required
						/>
						<InputField
							control={form.control}
							name="notes"
							label={t("notes")}
							type="textarea"
							placeholder={t("notesPlaceholder")}
							fieldClass="col-span-full"
						/>
					</div>
				</CardContent>
			</Card>

			<div className="bg-background/95 sticky bottom-0 z-10 flex justify-end gap-3 rounded-md p-4 shadow-lg backdrop-blur">
				<Button
					variant="outline"
					type="button"
					onClick={() => router.push(PATHS.LIBRARY.FINES.ROOT)}
					disabled={form.formState.isSubmitting}
				>
					{ft("cancel")}
				</Button>
				<Button type="submit" disabled={form.formState.isSubmitting}>
					{form.formState.isSubmitting
						? isEdit
							? ft("updateLoading")
							: ft("saveLoading")
						: isEdit
							? ft("update")
							: ft("save")}
				</Button>
			</div>
		</form>
	);
}
