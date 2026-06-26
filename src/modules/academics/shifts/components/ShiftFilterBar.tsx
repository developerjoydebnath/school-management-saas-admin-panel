"use client";

import { FilterMobileWrapper } from "@/shared/components/custom/Filter";
import React from "react";
import { ShiftFilter } from "./ShiftList";

type Props = {
	children?: React.ReactNode;
	filter: ShiftFilter;
	setFilter: (filter: ShiftFilter) => void;
};

export default function ShiftFilterBar({ children }: Props) {
	return (
		<div>
			<FilterMobileWrapper>{children && children}</FilterMobileWrapper>
		</div>
	);
}
