import { HealthInformation } from "./overview/HealthInformation";
import { ParentInformation } from "./overview/ParentInformation";
import { PerformanceSidebar } from "./overview/PerformanceSidebar";
import { PerformanceTrend } from "./overview/PerformanceTrend";
import { PersonalInformation } from "./overview/PersonalInformation";
import { QuickStats } from "./overview/QuickStats";
import { TransportLibraryInfo } from "./overview/TransportLibraryInfo";

interface ProfileOverviewTabProps {
	student: any;
}

export default function ProfileOverviewTab({ student }: ProfileOverviewTabProps) {
	return (
		<div className="space-y-6">
			{/* Quick Stats Row */}
			<QuickStats />

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				{/* Left Column - 2/3 width */}
				<div className="space-y-6 lg:col-span-2">
					<PerformanceTrend />
					<PersonalInformation student={student} />
					<ParentInformation student={student} />
					<HealthInformation student={student} />
					<TransportLibraryInfo />
				</div>

				{/* Right Column - 1/3 width */}
				<PerformanceSidebar student={student} />
			</div>
		</div>
	);
}

