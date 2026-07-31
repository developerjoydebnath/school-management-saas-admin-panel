"use client";

import { ZoomableImage } from "@/shared/components/media/ZoomableImage";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@/shared/components/ui/sheet";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/components/ui/table";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMovements } from "../../movements/hooks/use-movement";
import { useStockBatch } from "../hooks/use-stock";

type Props = {
	id: string;
	open: boolean;
};

function formatValue(value: unknown) {
	if (value === null || value === undefined || value === "") return "-";
	if (typeof value === "boolean") return value ? "Yes" : "No";
	return String(value);
}

function Pair({ label, value }: { label: string; value: unknown }) {
	return (
		<div className="min-w-0">
			<p className="text-muted-foreground text-[11px] leading-4">{label}</p>
			<p className="mt-0.5 truncate text-sm leading-5">{formatValue(value)}</p>
		</div>
	);
}

function getMediaUrl(url?: string | null) {
	if (!url) return "";
	if (url.startsWith("http") || url.startsWith("data:")) return url;
	return url;
}

function DetailsSkeleton() {
	return (
		<div className="space-y-4 p-4">
			{Array.from({ length: 3 }).map((_, index) => (
				<section key={index} className="bg-muted/20 rounded-md border p-4">
					<Skeleton className="h-4 w-36" />
					<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
						{Array.from({ length: 4 }).map((__, itemIndex) => (
							<div key={itemIndex} className="space-y-2">
								<Skeleton className="h-3 w-24" />
								<Skeleton className="h-4 w-32" />
							</div>
						))}
					</div>
				</section>
			))}
		</div>
	);
}

export function StockDetailsSheet({ id, open }: Props) {
	const t = useTranslations("Inventory");
	const { data: response, isLoading } = useStockBatch(open ? id : null);
	const data = response?.data || response;
	const { data: movementsData } = useMovements(
		data?.itemId && data?.locationId
			? { itemId: data.itemId, locationId: data.locationId }
			: null
	);

	return (
		<SheetContent className="w-full gap-0 p-0 sm:max-w-none @3xl/body:w-[64vw]">
			<SheetHeader className="border-b p-4">
				<SheetTitle className="text-base leading-6 font-normal">
					{t("detailsTitle")}
				</SheetTitle>
				<SheetDescription className="text-xs">{t("detailsDescription")}</SheetDescription>
			</SheetHeader>
			<ScrollArea className="h-[calc(100vh-73px)]">
				{isLoading || !data ? (
					<DetailsSkeleton />
				) : (
					<div className="space-y-4 p-4">
						<section className="bg-muted/20 rounded-md border p-4">
							<h3 className="text-sm font-normal">{t("stockInformation")}</h3>
							<div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
								<Pair label="Item" value={data.item?.name} />
								<Pair label="Location" value={data.location?.name} />
								<Pair label="Total Quantity" value={data.quantityTotal} />
								<Pair label="Good Quantity" value={data.quantityGood} />
								<Pair label="Damaged Quantity" value={data.quantityDamaged} />
								<Pair label="Disposed Quantity" value={data.quantityDisposed} />
							</div>
						</section>

						{movementsData && movementsData.length > 0 && (
							<div className="mt-4 space-y-4">
								<h3 className="px-1 text-sm font-normal">Stock Movement</h3>
								<div className="overflow-hidden rounded-md border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className="pl-4">Date</TableHead>
												<TableHead>Type</TableHead>
												<TableHead>In / Out</TableHead>
												<TableHead>From Location</TableHead>
												<TableHead>To Location</TableHead>
												<TableHead className="text-right pr-4">
													Quantity
												</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{movementsData.map((movement: any) => (
												<TableRow key={movement.id}>
													<TableCell className="whitespace-nowrap pl-4">
														{new Date(
															movement.createdAt
														).toLocaleDateString()}
													</TableCell>
													<TableCell className="capitalize">
														{movement.movementType?.toLowerCase()}
													</TableCell>
													<TableCell>
														{movement.fromLocation?.id === data.location?.id ? (
															<span className="flex items-center gap-1 text-red-500 font-medium">
																<ArrowUpRight className="h-3.5 w-3.5" /> Out
															</span>
														) : movement.toLocation?.id === data.location?.id ? (
															<span className="flex items-center gap-1 text-green-500 font-medium">
																<ArrowDownLeft className="h-3.5 w-3.5" /> In
															</span>
														) : (
															"-"
														)}
													</TableCell>
													<TableCell>
														{movement.fromLocation?.name || "-"}
													</TableCell>
													<TableCell>
														{movement.toLocation?.name || "-"}
													</TableCell>
													<TableCell className="text-right font-medium pr-4">
														{movement.quantity}
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							</div>
						)}

						{data.history && data.history.length > 0 && (
							<div className="mt-4 space-y-4">
								<h3 className="px-1 text-sm font-normal">
									{t("updateHistory") || "Update History"}
								</h3>
								<div className="w-full space-y-4">
									{data.history.map((log: any, index: number) => {
										const details = log.afterData?.purchaseDetails;
										if (!details) return null;
										return (
											<div
												key={log.id}
												className="bg-muted/10 rounded-md border px-4 pb-4 shadow-sm"
											>
												<div className="border-border/50 border-b pt-4 pb-2">
													<div className="flex flex-1 items-center justify-between pr-4">
														<h4 className="text-sm font-semibold">
															{log.action === "PURCHASE"
																? "Initial Stock Purchase"
																: "Stock Addition"}
														</h4>
														<span className="text-muted-foreground text-xs font-normal">
															{new Date(
																log.createdAt
															).toLocaleString()}
														</span>
													</div>
												</div>
												<div className="pt-4">
													<div className="grid grid-cols-1 gap-x-4 gap-y-4 @xl/body:grid-cols-2">
														<Pair
															label="Quantity Added"
															value={details.quantityAdded}
														/>
														<Pair
															label="Purchase Date"
															value={
																details.purchaseDate
																	? new Date(
																			details.purchaseDate
																		).toLocaleDateString()
																	: null
															}
														/>
														<Pair
															label="Purchase Price"
															value={details.purchasePrice}
														/>
														<Pair
															label="Supplier"
															value={details.supplier}
														/>
														<Pair
															label="Invoice No"
															value={details.invoiceNo}
														/>
														<Pair
															label="Has Warranty"
															value={
																details.hasWarranty ? "Yes" : "No"
															}
														/>
														{details.hasWarranty && (
															<>
																<Pair
																	label="Warranty Period"
																	value={
																		details.warrantyPeriod
																			? `${details.warrantyPeriod} ${details.warrantyPeriodUnit || ""}`
																			: null
																	}
																/>
																<Pair
																	label="Warranty Notes"
																	value={details.warrantyNotes}
																/>
															</>
														)}
														<Pair label="Notes" value={details.notes} />
													</div>

													{details.invoiceImageUrl && (
														<div className="border-border/50 mt-5 space-y-3 border-t pt-4">
															<p className="text-muted-foreground text-[12px] leading-4 font-medium">
																Invoice Image(s)
															</p>
															<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
																{details.invoiceImageUrl
																	.split(",")
																	.map(
																		(
																			url: string,
																			imgIdx: number
																		) => {
																			const placeholders =
																				details.invoicePlaceholder
																					? details.invoicePlaceholder.split(
																							","
																						)
																					: [];
																			return (
																				<ZoomableImage
																					key={imgIdx}
																					src={getMediaUrl(
																						url
																					)}
																					placeholderBase64={
																						placeholders[
																							imgIdx
																						] ||
																						undefined
																					}
																					alt={`Invoice image ${imgIdx + 1}`}
																					className="bg-muted/30 aspect-video w-full rounded-md border"
																					imageClassName="object-contain"
																				/>
																			);
																		}
																	)}
															</div>
														</div>
													)}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						)}
					</div>
				)}
			</ScrollArea>
		</SheetContent>
	);
}
