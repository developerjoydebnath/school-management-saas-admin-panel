"use client";

import { MaintenanceEditFormPage } from "@/modules/inventory/maintenance/components/MaintenanceEditFormPage";

export default function InventoryMaintenanceEditPage({ params }: { params: { id: string } }) {
	return <MaintenanceEditFormPage id={params.id} />;
}
