import { getTranslations } from "next-intl/server";
import { LocationFormPage } from "@/modules/inventory/locations/components/LocationFormPage";
import { use } from "react";

export async function generateMetadata() {
	const t = await getTranslations("Inventory");
	return { title: t("editTitle") };
}

export default function InventoryLocationEditPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	return <LocationFormPage id={id} />;
}
