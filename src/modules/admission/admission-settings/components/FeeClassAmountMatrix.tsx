"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useSWR } from "@/shared/hooks/use-swr";
import { getLocalizedName } from "@/shared/utils/localization";
import { Grid3X3 } from "lucide-react";
import { useLocale } from "next-intl";
import { FeeHead } from "../types/types";

interface FeeClassAmountMatrixProps {
	fees: FeeHead[];
	onUpdate: (id: string, updates: Partial<FeeHead>) => void;
}

function normalizeList(response: any) {
	if (Array.isArray(response)) return response;
	if (Array.isArray(response?.data)) return response.data;
	if (Array.isArray(response?.data?.items)) return response.data.items;
	if (Array.isArray(response?.items)) return response.items;
	return [];
}

export function FeeClassAmountMatrix({ fees, onUpdate }: FeeClassAmountMatrixProps) {
	const { data: classResponse, isLoading } = useSWR("/classes/active-list");
	const locale = useLocale();
	const classes = normalizeList(classResponse);
	const visibleFees = fees.filter((fee) => fee.isShown);

	const getClassName = (classItem: any) => {
		if (typeof classItem.name === "object") return getLocalizedName(classItem.name, locale);
		return classItem.name || classItem.enName || classItem.bnName || "Class";
	};

	const getOverride = (fee: FeeHead, classId: string) =>
		fee.classAmounts?.find((item) => item.classId === classId);

	const updateClassAmount = (fee: FeeHead, classId: string, value: string) => {
		const nextClassAmounts = [...(fee.classAmounts || [])].filter(
			(item) => item.classId !== classId
		);
		if (value !== "") {
			nextClassAmounts.push({
				classId,
				amount: Number(value) || 0,
			});
		}
		onUpdate(fee.id, { classAmounts: nextClassAmounts });
	};

	if (isLoading) {
		return <Skeleton className="h-64 rounded-lg" />;
	}

	if (!classes.length || !visibleFees.length) return null;

	return (
		<Card className="gap-0 rounded-lg py-0 shadow-none">
			<CardHeader className="flex flex-row items-center gap-3 border-b bg-blue-100/10 pt-4 pb-4! dark:bg-black/20">
				<Grid3X3 className="h-5 w-5" />
				<div>
					<CardTitle className="text-base font-bold">Class-wise Fee Amounts</CardTitle>
					<CardDescription className="mt-0.5 text-sm">
						Every class is auto-filled from the base fee. Change a cell only when that class needs a different amount.
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="p-0">
				<div className="overflow-x-auto">
					<table className="w-full min-w-[900px] text-sm">
						<thead>
							<tr className="border-b">
								<th className="w-[180px] px-6 py-3 text-left font-semibold">
									Class
								</th>
								{visibleFees.map((fee) => (
									<th key={fee.id} className="min-w-[150px] px-3 py-3 text-left font-semibold">
										<div className="space-y-0.5">
											<p>{fee.name}</p>
											<p className="text-muted-foreground text-xs font-normal">
												Base BDT {Number(fee.amount || 0).toLocaleString()}
											</p>
										</div>
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{classes.map((classItem: any) => (
								<tr key={classItem.id} className="border-b last:border-b-0">
									<td className="px-6 py-3 font-medium">{getClassName(classItem)}</td>
									{visibleFees.map((fee) => {
										const override = getOverride(fee, classItem.id);
										const baseAmount = Number(fee.amount || 0);
										const effectiveAmount = override
											? Number(override.amount)
											: baseAmount;
										return (
											<td key={`${classItem.id}-${fee.id}`} className="px-3 py-2">
												<Input
													key={`${fee.id}-${classItem.id}-${effectiveAmount}`}
													type="number"
													min={0}
													className="h-9 min-w-[120px]"
													defaultValue={effectiveAmount}
													onBlur={(event) =>
														updateClassAmount(
															fee,
															classItem.id,
															Number(event.target.value || 0) === baseAmount
																? ""
																: event.target.value
														)
													}
													onKeyDown={(event) => {
														if (event.key === "Enter") {
															event.currentTarget.blur();
														}
													}}
												/>
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	);
}
