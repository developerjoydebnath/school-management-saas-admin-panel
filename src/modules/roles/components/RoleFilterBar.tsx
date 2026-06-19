import { FilterMobileWrapper } from "@/shared/components/custom/Filter";
import React from "react";
import { RoleFilter } from "./RoleList";

type Props = {
	children?: React.ReactNode;
	filter: RoleFilter;
	setFilter: (filter: RoleFilter) => void;
};

export default function RoleFilterBar({ children, filter, setFilter }: Props) {
	return (
		<div>
			{/* <FilterDesktopWrapper>
				Add desktop filter buttons here in the future
			</FilterDesktopWrapper> */}

			<FilterMobileWrapper>
				{children && children}

				{/* 
					Hide the Filter button completely for now since there are no custom filters. 
					When filters are added, uncomment this section.
				*/}
				{/* <FilterContainer>
					<FilterTriggerButton className="w-fit">
						<span className="flex items-center gap-2">
							<IconFilter strokeWidth={1.5} className="size-4" />
							<span>Filter</span>
						</span>
					</FilterTriggerButton>

					<FilterContent>
						// Add mobile filter buttons here in the future
					</FilterContent>
				</FilterContainer> */}
			</FilterMobileWrapper>
		</div>
	);
}
