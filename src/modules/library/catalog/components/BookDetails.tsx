"use client";

import ConfirmationModal from "@/shared/components/custom/ConfirmationModal";
import PermissionGuard from "@/shared/components/custom/PermissionGuard";
import { ProgressiveImage } from "@/shared/components/media/ProgressiveImage";
import { AlertDialogTrigger } from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { PATHS } from "@/shared/configs/paths.config";
import { PERMISSIONS } from "@/shared/configs/permissions.config";
import { cn } from "@/shared/lib/utils";
import { BookOpen, Library, Pencil, Plus, Printer, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
	copyStatusColors,
	formatDate,
	formatMoney,
	loanStatusColors,
} from "../../shared/dto/library.dto";
import {
	useLibraryBook,
	withdrawLibraryCopy,
} from "../../shared/hooks/use-library";
import AddCopiesDialog from "./AddCopiesDialog";
import EditCopyDialog from "./EditCopyDialog";
import SpineLabelsDialog from "./SpineLabelsDialog";

/**
 * One title: what it is, which physical volumes exist, and who has had them.
 *
 * The Copies tab is this title's slice of the accession register, and it keeps
 * the register's rules — a withdrawn copy is still listed, greyed rather than
 * gone, because an accession line is never removed.
 */
export default function BookDetails({ id }: { id: string }) {
	const t = useTranslations("LibraryCatalog");
	const tc = useTranslations("Common");
	const { book, isLoading } = useLibraryBook(id);
	const [isAddOpen, setIsAddOpen] = useState(false);
	const [isLabelsOpen, setIsLabelsOpen] = useState(false);
	const [isWithdrawing, setIsWithdrawing] = useState(false);
	const [copyBeingEdited, setCopyBeingEdited] = useState<any>(null);

	const withdraw = async (copyId: string) => {
		setIsWithdrawing(true);
		try {
			const response = await withdrawLibraryCopy(copyId);
			toast.success(response?.message || t("withdrawSuccess"));
		} catch {
			// Global axios interceptor auto-toasts errors
		} finally {
			setIsWithdrawing(false);
		}
	};

	if (isLoading || !book) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-40 rounded-md" />
				<Skeleton className="h-64 rounded-md" />
			</div>
		);
	}

	const copies = book.copies || [];
	const meta: Array<[string, string | number | null | undefined]> = [
		[t("category"), book.category?.name],
		[t("publisher"), book.publisher],
		[t("edition"), book.edition],
		[t("publishYear"), book.publishYear],
		[t("isbn"), book.isbn],
		[t("callNumber"), book.callNumber],
		[t("ddcNumber"), book.ddcNumber],
		[t("subject"), book.subject],
		[t("classLevel"), book.classLevel],
		[t("pages"), book.pages],
	];

	return (
		<div className="space-y-4">
			<Card className="shadow-none ring-0">
				<CardContent className="flex flex-col gap-5 @3xl/page:flex-row">
					<div className="bg-muted flex h-48 w-32 shrink-0 items-center justify-center self-center overflow-hidden rounded-md @3xl/page:self-start">
						{book.coverUrl ? (
							<ProgressiveImage
								src={book.coverUrl}
								placeholderBase64={book.coverPlaceholder}
								alt={book.title}
								width={128}
								height={192}
								className="h-48 w-32 object-cover"
							/>
						) : (
							<BookOpen className="text-muted-foreground size-8" />
						)}
					</div>

					<div className="min-w-0 flex-1 space-y-4">
						<div className="flex flex-wrap items-start justify-between gap-3">
							<div className="min-w-0 space-y-1">
								<h2 className="text-xl font-semibold">{book.title}</h2>
								{book.titleBn && (
									<p className="text-muted-foreground">{book.titleBn}</p>
								)}
								<p className="text-sm">{book.author}</p>
							</div>
							<div className="flex flex-wrap items-center gap-2">
								{book.isReference ? (
									<Badge variant="outline" className="gap-1">
										<Library className="size-3" />
										{t("referenceOnly")}
									</Badge>
								) : (
									<Badge
										className={cn(
											"border-transparent",
											Number(book.availableCopies) > 0
												? copyStatusColors.AVAILABLE
												: copyStatusColors.ISSUED,
										)}
									>
										{t("availableOf", {
											available: book.availableCopies ?? 0,
											total: book.totalCopies ?? 0,
										})}
									</Badge>
								)}
								<PermissionGuard
									permissions={[
										PERMISSIONS.LIBRARY.CATALOG.EDIT,
										PERMISSIONS.LIBRARY.CATALOG.ALL,
										PERMISSIONS.LIBRARY.ALL,
									]}
								>
									<Button variant="outline" size="sm" asChild>
										<Link href={PATHS.LIBRARY.CATALOG.EDIT(id)}>
											<Pencil className="size-4" />
											{tc("edit")}
										</Link>
									</Button>
								</PermissionGuard>
							</div>
						</div>

						<dl className="grid grid-cols-2 gap-x-6 gap-y-2 @3xl/page:grid-cols-3">
							{meta
								.filter(([, value]) => value !== null && value !== undefined && value !== "")
								.map(([label, value]) => (
									<div key={label} className="min-w-0">
										<dt className="text-muted-foreground text-xs">{label}</dt>
										<dd className="truncate text-sm">{value}</dd>
									</div>
								))}
						</dl>

						{book.summary && (
							<p className="text-muted-foreground text-sm">{book.summary}</p>
						)}
					</div>
				</CardContent>
			</Card>

			<Tabs defaultValue="copies">
				<TabsList>
					<TabsTrigger value="copies">
						{t("copiesTab", { count: copies.length })}
					</TabsTrigger>
					<TabsTrigger value="history">{t("historyTab")}</TabsTrigger>
				</TabsList>

				<TabsContent value="copies" className="mt-4">
					<Card className="shadow-none ring-0">
						<CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
							<CardTitle className="text-base">{t("registerLines")}</CardTitle>
							<div className="flex flex-wrap gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setIsLabelsOpen(true)}
									disabled={!copies.length}
								>
									<Printer className="size-4" />
									{t("printLabels")}
								</Button>
								<PermissionGuard
									permissions={[
										PERMISSIONS.LIBRARY.CATALOG.CREATE,
										PERMISSIONS.LIBRARY.CATALOG.ALL,
										PERMISSIONS.LIBRARY.ALL,
									]}
								>
									<Button size="sm" onClick={() => setIsAddOpen(true)}>
										<Plus className="size-4" />
										{t("addCopies")}
									</Button>
								</PermissionGuard>
							</div>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>{t("accessionNo")}</TableHead>
											<TableHead>{t("accessionDate")}</TableHead>
											<TableHead>{t("source")}</TableHead>
											<TableHead className="text-right">{t("price")}</TableHead>
											<TableHead>{t("rackNo")}</TableHead>
											<TableHead>{t("status")}</TableHead>
											<TableHead className="text-right">{tc("actions")}</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{copies.length === 0 && (
											<TableRow>
												<TableCell
													colSpan={7}
													className="text-muted-foreground py-8 text-center"
												>
													{t("noCopies")}
												</TableCell>
											</TableRow>
										)}
										{copies.map((copy: any) => (
											<TableRow
												key={copy.id}
												// A withdrawn line stays in the register but is
												// visually retired — it is closed, not a problem.
												className={cn(
													copy.status === "WITHDRAWN" && "opacity-55",
												)}
											>
												<TableCell className="font-mono text-xs">
													{copy.accessionNo}
												</TableCell>
												<TableCell className="text-sm">
													{formatDate(copy.accessionDate)}
												</TableCell>
												<TableCell className="text-sm">
													{t(`sourceValue.${copy.source}`)}
												</TableCell>
												<TableCell className="text-right text-sm tabular-nums">
													{copy.price === null ? "—" : formatMoney(copy.price)}
												</TableCell>
												<TableCell className="text-sm">
													{copy.rackNo || "—"}
												</TableCell>
												<TableCell>
													<Badge
														className={cn(
															"border-transparent text-xs font-normal",
															copyStatusColors[copy.status],
														)}
													>
														{t(`copyStatusValue.${copy.status}`)}
													</Badge>
													{copy.withdrawnAt && (
														<p className="text-muted-foreground mt-0.5 text-xs">
															{formatDate(copy.withdrawnAt)}
														</p>
													)}
												</TableCell>
												<TableCell className="text-right">
													{copy.status !== "WITHDRAWN" && (
														<PermissionGuard
															permissions={[
																PERMISSIONS.LIBRARY.CATALOG.EDIT,
																PERMISSIONS.LIBRARY.CATALOG.ALL,
																PERMISSIONS.LIBRARY.ALL,
															]}
														>
															<Button
																size="icon-sm"
																variant="outline"
																onClick={() => setCopyBeingEdited(copy)}
																title={t("editCopy")}
															>
																<Pencil className="text-muted-foreground hover:text-foreground h-4 w-4" />
															</Button>
														</PermissionGuard>
													)}
													{copy.status !== "WITHDRAWN" && (
														<PermissionGuard
															permissions={[
																PERMISSIONS.LIBRARY.CATALOG.DELETE,
																PERMISSIONS.LIBRARY.CATALOG.ALL,
																PERMISSIONS.LIBRARY.ALL,
															]}
														>
															<ConfirmationModal
																title={t("withdrawTitle")}
																description={t("withdrawDescription", {
																	accessionNo: copy.accessionNo,
																})}
																onConfirm={() => withdraw(copy.id)}
																isLoading={isWithdrawing}
															>
																<AlertDialogTrigger asChild>
																	<Button
																		size="icon-sm"
																		variant="destructive"
																		title={t("withdrawTitle")}
																	>
																		<Trash2 />
																	</Button>
																</AlertDialogTrigger>
															</ConfirmationModal>
														</PermissionGuard>
													)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="history" className="mt-4">
					<Card className="shadow-none ring-0">
						<CardHeader>
							<CardTitle className="text-base">{t("historyTab")}</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>{t("accessionNo")}</TableHead>
											<TableHead>{t("borrower")}</TableHead>
											<TableHead>{t("issuedOn")}</TableHead>
											<TableHead>{t("dueDate")}</TableHead>
											<TableHead>{t("returnedOn")}</TableHead>
											<TableHead>{t("status")}</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{(book.recentLoans || []).length === 0 && (
											<TableRow>
												<TableCell
													colSpan={6}
													className="text-muted-foreground py-8 text-center"
												>
													{t("noHistory")}
												</TableCell>
											</TableRow>
										)}
										{(book.recentLoans || []).map((loan: any) => (
											<TableRow key={loan.id}>
												<TableCell className="font-mono text-xs">
													{loan.accessionNo}
												</TableCell>
												<TableCell className="text-sm">
													{loan.borrowerName}
													{loan.borrowerCode && (
														<span className="text-muted-foreground ml-1.5 text-xs">
															{loan.borrowerCode}
														</span>
													)}
												</TableCell>
												<TableCell className="text-sm">
													{formatDate(loan.issuedAt)}
												</TableCell>
												<TableCell className="text-sm">
													{formatDate(loan.dueDate)}
												</TableCell>
												<TableCell className="text-sm">
													{loan.returnedAt ? formatDate(loan.returnedAt) : "—"}
												</TableCell>
												<TableCell>
													<Badge
														className={cn(
															"border-transparent text-xs font-normal",
															loanStatusColors[loan.status],
														)}
													>
														{t(`loanStatusValue.${loan.status}`)}
													</Badge>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>

			<AddCopiesDialog
				open={isAddOpen}
				onOpenChange={setIsAddOpen}
				bookId={id}
				bookTitle={book.title}
			/>
			<EditCopyDialog
				copy={copyBeingEdited}
				onOpenChange={(open) => {
					if (!open) setCopyBeingEdited(null);
				}}
			/>
			<SpineLabelsDialog
				open={isLabelsOpen}
				onOpenChange={setIsLabelsOpen}
				bookTitle={book.title}
				callNumber={book.callNumber}
				copies={copies.filter((copy: any) => copy.status !== "WITHDRAWN")}
			/>
		</div>
	);
}
