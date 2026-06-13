import { FeeCharts } from "./fees/FeeCharts";
import { FeeProgressScholarship } from "./fees/FeeProgressScholarship";
import { FeeSummaryCards } from "./fees/FeeSummaryCards";
import { OutstandingDuesTable } from "./fees/OutstandingDuesTable";
import { PaymentHistoryTable } from "./fees/PaymentHistoryTable";

export default function FeesTab() {
	const feeSummary = {
		totalFee: 24000,
		totalPaid: 18500,
		totalDue: 5500,
		totalDiscount: 2000,
		totalFine: 350,
		nextPaymentDate: "Jun 10, 2026",
		nextPaymentAmount: 3000,
		paidPercent: 77,
	};

	const scholarshipInfo = {
		name: "Merit Scholarship 2025",
		type: "Merit-based",
		amount: 2000,
		status: "Active",
		validUntil: "Dec 2026",
		criteria: "Maintain GPA > 3.50",
	};

	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<FeeSummaryCards feeSummary={feeSummary} />

			{/* Payment Progress + Next Payment */}
			<FeeProgressScholarship feeSummary={feeSummary} scholarshipInfo={scholarshipInfo} />

			{/* Charts Row */}
			<FeeCharts />

			{/* Outstanding Dues with Fine */}
			<OutstandingDuesTable />

			{/* Payment History */}
			<PaymentHistoryTable />
		</div>
	);
}
