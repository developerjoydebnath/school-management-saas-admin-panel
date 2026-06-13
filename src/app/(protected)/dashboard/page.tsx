"use client";

import OrderFilterBar from "@/modules/dashboard/components/OrderFilterBar";
import OrderTable from "@/modules/dashboard/components/OrderTable";
import PageHeading from "@/shared/components/custom/PageHeading";
import TableFilter from "@/shared/components/table/TableFilter";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { useBreadcrumbStore } from "@/shared/stores/breadcrumb-store";
import { IconPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export type FilterOption = {
	label: string;
	value: string;
};

export type OrderFilter = {
	status: FilterOption[];
	orderType: FilterOption[];
	search: string;
	startDate?: Date;
	endDate?: Date;
};

export default function Orders() {
	const [filter, setFilter] = useState<OrderFilter>({
		status: [],
		orderType: [],
		search: "",
		startDate: undefined,
		endDate: undefined,
	});
	const { setBreadcrumbs } = useBreadcrumbStore();

	useEffect(() => {
		setBreadcrumbs([
			{
				label: "Home",
				href: "/",
			},
			{
				label: "Orders",
				href: "/dashboard",
			},
		]);
	}, [setBreadcrumbs]);

	return (
		<div className="space-y-6">
			<PageHeading routeName="Orders">
				<Button>
					<IconPlus />
					Add Order
				</Button>
			</PageHeading>

			<Card className="p-6 ring-0">
				<CardHeader className="p-0">
					<OrderFilterBar filter={filter} setFilter={setFilter} />
				</CardHeader>

				<CardContent className="space-y-4 p-0">
					<TableFilter filter={filter} setFilter={setFilter} />
					<OrderTable queryType="ACTIVE" filter={filter} />
				</CardContent>
			</Card>
		</div>
	);
}
