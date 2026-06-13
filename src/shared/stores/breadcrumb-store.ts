import { create } from "zustand";

export type BreadcrumbItemType = {
	label: string;
	href?: string;
};

type BreadcrumbStore = {
	breadcrumbs: BreadcrumbItemType[];
	setBreadcrumbs: (breadcrumbs: BreadcrumbItemType[]) => void;
};

export const useBreadcrumbStore = create<BreadcrumbStore>((set) => ({
	breadcrumbs: [],
	setBreadcrumbs: (breadcrumbs: BreadcrumbItemType[]) => set({ breadcrumbs }),
}));
