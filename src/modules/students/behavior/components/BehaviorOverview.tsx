"use client";

import { BehaviorStats } from "./BehaviorStats";
import { IncidentList } from "./IncidentList";

export default function BehaviorOverview() {
	return (
		<div className="@container/page space-y-6">
			<BehaviorStats />
			<IncidentList />
		</div>
	);
}
