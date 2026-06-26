"use client";

import { FilterMobileWrapper } from "@/shared/components/custom/Filter";
import React from "react";
import { SessionFilter } from "./SessionList";

type Props = {
	children?: React.ReactNode;
	filter: SessionFilter;
	setFilter: (filter: SessionFilter) => void;
};

export default function SessionFilterBar({ children }: Props) {
	return (
		<div>
			<FilterMobileWrapper>{children && children}</FilterMobileWrapper>
		</div>
	);
}
