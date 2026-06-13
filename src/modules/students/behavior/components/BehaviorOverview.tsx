"use client";

import { useTranslations } from "next-intl";
import { BehaviorStats } from "./BehaviorStats";
import { IncidentList } from "./IncidentList";


export default function BehaviorOverview() {
	const t = useTranslations("StudentBehavior");

	return (
		<div className="space-y-6">
			{/* Top Stats */}
			<BehaviorStats />



			{/* Data Table */}
			<IncidentList />
		</div>
	);
}
